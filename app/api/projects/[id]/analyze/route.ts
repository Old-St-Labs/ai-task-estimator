import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { analysisRuns, developers, projects, tasks, userStories } from "@/db/schema";
import { getJsonModel } from "@/lib/gemini";
import { buildAnalysisPrompt } from "@/lib/prompts/analyze-stories";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

// ── Zod schema for LLM response ──────────────────────────────────────────────

const llmGapSchema = z.object({
  storyId: z.number().int(),
  title: z.string().min(1),
  description: z.string(),
});

const llmTaskSchema = z.object({
  userStoryId: z.number().int(),
  title: z.string().min(1),
  description: z.string(),
  layer: z.enum(["backend", "frontend", "database", "infrastructure", "testing", "other"]),
  estimatedHours: z.number().min(0.5).max(40),
  assignedDeveloperId: z.number().int().nullable(),
  assignmentReason: z.string(),
});

const llmResponseSchema = z.object({
  gaps: z.array(llmGapSchema),
  tasks: z.array(llmTaskSchema).min(1),
});

type LlmResponse = z.infer<typeof llmResponseSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function failRun(id: number, rawResponse: string, error: string) {
  await db
    .update(analysisRuns)
    .set({ status: "failed", rawResponse, errorMessage: error, updatedAt: new Date() })
    .where(eq(analysisRuns.id, id));
}

// ── Route Handler ─────────────────────────────────────────────────────────────

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/analyze
 *
 * Runs the full AI analysis pipeline for a project:
 *  1. Load user stories + developers
 *  2. Build combined analysis prompt
 *  3. Create analysis_runs audit record (status: "running")
 *  4. Call Gemini with responseMimeType: "application/json"
 *  5. JSON.parse the response
 *  6. Zod-validate the parsed JSON
 *  7. Clear previous AI-generated tasks for this project's stories
 *  8. Insert new tasks from the LLM response
 *  9. Mark all stories as status: "analyzed"
 * 10. Update analysis_runs to status: "completed"
 */
export async function POST(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const projectId = Number(id);

    // 1. Validate project exists
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) return notFound(`Project ${projectId} not found`);

    // 2. Load stories and developers
    const stories = await db
      .select()
      .from(userStories)
      .where(eq(userStories.projectId, projectId));

    const devRoster = await db
      .select()
      .from(developers)
      .where(eq(developers.projectId, projectId));

    if (stories.length === 0) {
      return badRequest("Add at least one user story before running analysis");
    }
    if (devRoster.length === 0) {
      return badRequest("Add at least one developer before running analysis");
    }

    // 3. Build prompt
    const prompt = buildAnalysisPrompt(project.name, stories, devRoster);

    // 4. Create audit record before calling LLM
    const [run] = await db
      .insert(analysisRuns)
      .values({ projectId, status: "running", prompt })
      .returning();

    // 5. Call Gemini — isolated try/catch so we can update the audit record on failure
    let rawText = "";
    try {
      const model = getJsonModel();
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
    } catch (apiErr) {
      console.error("[analyze] Gemini API error:", apiErr);
      await failRun(run.id, rawText, String(apiErr));
      return internalError("Gemini API call failed — check your API key and quota");
    }

    // 6. Parse + Zod-validate — never trust raw LLM output
    let llmData: LlmResponse;
    try {
      const json = JSON.parse(rawText) as unknown;
      const zodResult = llmResponseSchema.safeParse(json);
      if (!zodResult.success) {
        console.error("[analyze] Zod validation failed:", JSON.stringify(zodResult.error.issues, null, 2));
        console.error("[analyze] Raw LLM response:", rawText);
        await failRun(run.id, rawText, zodResult.error.message);
        return internalError("AI returned an unexpected response format");
      }
      llmData = zodResult.data;
    } catch (parseErr) {
      console.error("[analyze] JSON parse error:", parseErr);
      console.error("[analyze] Raw LLM response:", rawText);
      await failRun(run.id, rawText, "JSON parse error");
      return internalError("AI returned malformed JSON");
    }

    // 7. Clear previous AI-generated tasks for all stories in this project
    const storyIds = stories.map((s) => s.id);
    await db
      .delete(tasks)
      .where(inArray(tasks.userStoryId, storyIds));

    // 8. Insert the new AI-generated tasks
    const insertedTasks = await db
      .insert(tasks)
      .values(
        llmData.tasks.map((t) => ({
          userStoryId: t.userStoryId,
          developerId: t.assignedDeveloperId ?? undefined,
          title: t.title,
          description: t.description,
          layer: t.layer,
          estimatedHours: t.estimatedHours,
          isAiGenerated: 1,
          status: "pending" as const,
        }))
      )
      .returning();

    // 9. Mark all stories as analyzed
    for (const story of stories) {
      await db
        .update(userStories)
        .set({ status: "analyzed", updatedAt: new Date() })
        .where(eq(userStories.id, story.id));
    }

    // 10. Complete the audit record
    await db
      .update(analysisRuns)
      .set({ status: "completed", rawResponse: rawText, updatedAt: new Date() })
      .where(eq(analysisRuns.id, run.id));

    return ok({
      analysisRunId: run.id,
      taskCount: insertedTasks.length,
      gapCount: llmData.gaps.length,
      tasks: insertedTasks,
      gaps: llmData.gaps,
    });
  } catch (err) {
    console.error("[analyze] unexpected error:", err);
    return internalError();
  }
}
