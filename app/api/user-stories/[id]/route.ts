import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userStories } from "@/db/schema";
import { userStoryUpdateSchema } from "@/lib/schemas/user-stories";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/user-stories/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(userStories).where(eq(userStories.id, Number(id)));
    if (!row) return notFound(`User story ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// PATCH /api/user-stories/:id — partial update
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = userStoryUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db
      .update(userStories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(userStories.id, Number(id)))
      .returning();

    if (!row) return notFound(`User story ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// DELETE /api/user-stories/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(userStories).where(eq(userStories.id, Number(id))).returning();
    if (!row) return notFound(`User story ${id} not found`);
    return ok({ deleted: true, id: row.id });
  } catch {
    return internalError();
  }
}
