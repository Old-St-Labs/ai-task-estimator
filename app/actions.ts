"use server";

import type { ActionState, Task } from "./types";

export async function estimateTasksAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userStoriesRaw = formData.get("userStories");
  const teamMembersRaw = formData.get("teamMembers");

  if (typeof userStoriesRaw !== "string" || !userStoriesRaw.trim()) {
    return { status: "error", message: "Please enter at least one user story." };
  }

  if (typeof teamMembersRaw !== "string" || !teamMembersRaw.trim()) {
    return { status: "error", message: "Please add at least one team member." };
  }

  let teamMembers: string[];
  try {
    const parsed: unknown = JSON.parse(teamMembersRaw);
    if (!Array.isArray(parsed)) throw new Error("invalid");
    teamMembers = parsed
      .map((m) => sanitizeName(String(m)))
      .filter(Boolean);
  } catch {
    return { status: "error", message: "Invalid team members data." };
  }

  if (teamMembers.length === 0) {
    return { status: "error", message: "Please add at least one team member." };
  }

  const userStories = sanitizeText(userStoriesRaw)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (userStories.length === 0) {
    return { status: "error", message: "Please enter at least one user story." };
  }

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";

  if (!apiKey) {
    return {
      status: "error",
      message:
        "AI_API_KEY is not configured. Add it to .env.local to enable AI estimation.",
    };
  }

  const prompt = buildPrompt(userStories, teamMembers);

  let tasks: Task[];
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical project manager. Break down user stories into specific development tasks and assign them to team members. Always respond with valid JSON only — no markdown, no code blocks.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      return {
        status: "error",
        message: `AI service error (${response.status}). Check your API key and model configuration.`,
      };
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { status: "error", message: "Empty response from AI service." };
    }

    // Strip markdown code fences if the model wrapped the JSON anyway
    const cleaned = content.replace(/^```[a-z]*\n?/i, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(cleaned) as { tasks: unknown[] };

    if (!Array.isArray(parsed.tasks)) {
      return { status: "error", message: "Unexpected AI response format." };
    }

    tasks = validateTasks(parsed.tasks, teamMembers);
  } catch (err) {
    console.error("Estimation error:", err);
    return {
      status: "error",
      message:
        "Failed to reach the AI service. Check your network and API configuration.",
    };
  }

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const byMember: Record<string, number> = {};
  for (const task of tasks) {
    byMember[task.assignedTo] = (byMember[task.assignedTo] ?? 0) + task.estimatedHours;
  }

  return {
    status: "success",
    result: { tasks, summary: { totalHours, byMember } },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildPrompt(userStories: string[], teamMembers: string[]): string {
  return `Break down the following user stories into specific development tasks.

User Stories:
${userStories.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Available Team Members:
${teamMembers.join(", ")}

Requirements:
- Each task must have a clear, actionable title
- Classify each task as "FE" (frontend/UI) or "BE" (backend/API/database)
- Provide a realistic estimate in hours (whole number, min 1, max 40)
- Assign each task to one team member, distributing work as evenly as possible
- Include 2–5 tasks per user story
- Be specific and technical

Respond with exactly this JSON shape:
{
  "tasks": [
    {
      "title": "string",
      "description": "string — 1 or 2 sentences",
      "type": "FE" or "BE",
      "estimatedHours": number,
      "assignedTo": "exact name from the team list",
      "userStory": "the original user story text this task belongs to"
    }
  ]
}`;
}

function sanitizeText(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, 3000);
}

function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s'\-\.]/g, "")
    .trim()
    .slice(0, 60);
}

const VALID_TYPES = new Set<string>(["FE", "BE"]);

function validateTasks(raw: unknown[], teamMembers: string[]): Task[] {
  const memberSet = new Set(teamMembers.map((m) => m.toLowerCase()));

  return raw
    .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null)
    .map((t) => {
      const rawAssignee = String(t.assignedTo ?? "").trim();
      const matchedMember =
        teamMembers.find((m) => m.toLowerCase() === rawAssignee.toLowerCase()) ??
        teamMembers[0];

      return {
        title: String(t.title ?? "Untitled Task").slice(0, 120),
        description: String(t.description ?? "").slice(0, 300),
        type: VALID_TYPES.has(String(t.type)) ? (String(t.type) as "FE" | "BE") : "FE",
        estimatedHours: Math.max(1, Math.min(40, Math.round(Number(t.estimatedHours) || 2))),
        assignedTo: memberSet.has(rawAssignee.toLowerCase()) ? rawAssignee : matchedMember,
        userStory: String(t.userStory ?? "").slice(0, 200),
      };
    });
}
