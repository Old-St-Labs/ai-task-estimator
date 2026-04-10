import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { projectUpdateSchema } from "@/lib/schemas/projects";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(projects).where(eq(projects.id, Number(id)));
    if (!row) return notFound(`Project ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// PATCH /api/projects/:id — partial update
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, Number(id)))
      .returning();

    if (!row) return notFound(`Project ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// DELETE /api/projects/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(projects).where(eq(projects.id, Number(id))).returning();
    if (!row) return notFound(`Project ${id} not found`);
    return ok({ deleted: true, id: row.id });
  } catch {
    return internalError();
  }
}
