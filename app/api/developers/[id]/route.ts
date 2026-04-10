import { eq } from "drizzle-orm";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { developerUpdateSchema } from "@/lib/schemas/developers";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/developers/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(developers).where(eq(developers.id, Number(id)));
    if (!row) return notFound(`Developer ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// PATCH /api/developers/:id — partial update
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = developerUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const [row] = await db
      .update(developers)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(developers.id, Number(id)))
      .returning();

    if (!row) return notFound(`Developer ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// DELETE /api/developers/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(developers).where(eq(developers.id, Number(id))).returning();
    if (!row) return notFound(`Developer ${id} not found`);
    return ok({ deleted: true, id: row.id });
  } catch {
    return internalError();
  }
}
