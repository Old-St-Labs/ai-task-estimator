import { db } from "@/db";
import { projects } from "@/db/schema";
import { projectInsertSchema } from "@/lib/schemas/projects";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

// GET /api/projects — list all projects
export async function GET() {
  try {
    const rows = await db.select().from(projects);
    return ok(rows);
  } catch {
    return internalError();
  }
}

// POST /api/projects — create a project
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = projectInsertSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db.insert(projects).values(parsed.data).returning();
    return created(row);
  } catch {
    return internalError();
  }
}
