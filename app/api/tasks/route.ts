import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { taskInsertSchema } from "@/lib/schemas/tasks";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

// GET /api/tasks — list all; filter by ?userStoryId= or ?sprintId= or ?projectId= (via join)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userStoryId = searchParams.get("userStoryId");
    const sprintId = searchParams.get("sprintId");

    const conditions = [];
    if (userStoryId) conditions.push(eq(tasks.userStoryId, Number(userStoryId)));
    if (sprintId) conditions.push(eq(tasks.sprintId, Number(sprintId)));

    const rows =
      conditions.length > 0
        ? await db.select().from(tasks).where(and(...conditions))
        : await db.select().from(tasks);

    return ok(rows);
  } catch {
    return internalError();
  }
}

// POST /api/tasks — create a task
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = taskInsertSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db.insert(tasks).values(parsed.data).returning();
    return created(row);
  } catch {
    return internalError();
  }
}
