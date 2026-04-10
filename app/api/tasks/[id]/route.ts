import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { taskUpdateSchema } from "@/lib/schemas/tasks";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(tasks).where(eq(tasks.id, Number(id)));
    if (!row) return notFound(`Task ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// PATCH /api/tasks/:id — manual override: reassign developer, update estimate, change status
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db
      .update(tasks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(tasks.id, Number(id)))
      .returning();

    if (!row) return notFound(`Task ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// DELETE /api/tasks/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(tasks).where(eq(tasks.id, Number(id))).returning();
    if (!row) return notFound(`Task ${id} not found`);
    return ok({ deleted: true, id: row.id });
  } catch {
    return internalError();
  }
}
