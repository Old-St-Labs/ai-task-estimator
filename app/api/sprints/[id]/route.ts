import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sprints } from "@/db/schema";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/sprints/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(sprints).where(eq(sprints.id, Number(id)));
    if (!row) return notFound(`Sprint ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}
