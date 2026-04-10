import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userStories } from "@/db/schema";
import { userStoryInsertSchema } from "@/lib/schemas/user-stories";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

// GET /api/user-stories — list all; filter by ?projectId=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const rows = projectId
      ? await db.select().from(userStories).where(eq(userStories.projectId, Number(projectId)))
      : await db.select().from(userStories);

    return ok(rows);
  } catch {
    return internalError();
  }
}

// POST /api/user-stories — create a user story
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = userStoryInsertSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db.insert(userStories).values(parsed.data).returning();
    return created(row);
  } catch {
    return internalError();
  }
}
