import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sprints } from "@/db/schema";
import { sprintInsertSchema } from "@/lib/schemas/sprints";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

// GET /api/sprints — list all; filter by ?projectId=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const rows = projectId
      ? await db.select().from(sprints).where(eq(sprints.projectId, Number(projectId)))
      : await db.select().from(sprints);

    return ok(rows);
  } catch {
    return internalError();
  }
}

// POST /api/sprints — create a sprint (used by the sprint-planning engine)
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = sprintInsertSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db.insert(sprints).values(parsed.data).returning();
    return created(row);
  } catch {
    return internalError();
  }
}
