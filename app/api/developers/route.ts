import { eq } from "drizzle-orm";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { developerInsertSchema } from "@/lib/schemas/developers";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

// GET /api/developers — list all; filter by ?projectId=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const rows = projectId
      ? await db.select().from(developers).where(eq(developers.projectId, Number(projectId)))
      : await db.select().from(developers);

    return ok(rows);
  } catch {
    return internalError();
  }
}

// POST /api/developers — create a developer
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = developerInsertSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    // skillset is already serialised to JSON string by the Zod transform
    const [row] = await db.insert(developers).values(parsed.data).returning();
    return created(row);
  } catch {
    return internalError();
  }
}
