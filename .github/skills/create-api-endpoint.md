# Skill: create-api-endpoint

> **Copilot Chat Participant Skill**
> Reference this skill whenever the user asks to create, add, or scaffold a new API endpoint.
> Instruction files are read in full before writing any code — never infer patterns from context alone.

---

## Tech Stack

| Concern       | Choice                                |
|---------------|---------------------------------------|
| Framework     | Next.js 16 — App Router (Route Handlers) |
| Language      | TypeScript 5 (strict mode)            |
| ORM           | Drizzle ORM (`drizzle-orm`)           |
| Database      | SQLite via `better-sqlite3` (`local.db`) |
| Validation    | Zod 4 — schemas derived from Drizzle via `drizzle-zod` |
| Response shape | `{ "code": "200", "data": <payload> }` |
| Auth          | Not implemented — skip               |

---

## File Conventions

```
app/
  api/
    <resource>/
      route.ts          ← collection endpoints (GET, POST)
    <resource>/
      [id]/
        route.ts        ← single-item endpoints (GET, PUT, PATCH, DELETE)
db/
  schema.ts             ← all table definitions (single source of truth)
  index.ts              ← db singleton (import { db } from "@/db")
lib/
  api-response.ts       ← response helpers (ok, created, notFound, badRequest, internalError)
```

**Path aliases:** use `@/` for all imports (`@/db`, `@/lib/api-response`, etc.)

---

## Step-by-Step: Adding a New API Endpoint

### 1. Define the table in `db/schema.ts` (if it doesn't exist)

```ts
// db/schema.ts
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const widgets = sqliteTable("widgets", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
```

After adding a new table, run:
```bash
yarn db:push
```

---

### 2. Derive Zod schemas with `drizzle-zod`

Create a `schemas.ts` co-located with the route **or** in `lib/schemas/`:

```ts
// lib/schemas/widget.schema.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { widgets } from "@/db/schema";

// Full select schema (used for response typing)
export const widgetSchema = createSelectSchema(widgets);

// Insert schema — strip server-managed fields, make optional fields optional
export const createWidgetSchema = createInsertSchema(widgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Partial insert schema for PATCH
export const updateWidgetSchema = createWidgetSchema.partial();

export type CreateWidgetInput = typeof createWidgetSchema._type;
export type UpdateWidgetInput = typeof updateWidgetSchema._type;
```

---

### 3. Create the Route Handler

#### Collection route — `app/api/widgets/route.ts`

```ts
import { db } from "@/db";
import { widgets } from "@/db/schema";
import { createWidgetSchema } from "@/lib/schemas/widget.schema";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

// GET /api/widgets — list all
export async function GET() {
  try {
    const all = await db.select().from(widgets);
    return ok(all);
  } catch {
    return internalError();
  }
}

// POST /api/widgets — create one
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createWidgetSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const [row] = await db.insert(widgets).values(parsed.data).returning();
    return created(row);
  } catch {
    return internalError();
  }
}
```

#### Single-item route — `app/api/widgets/[id]/route.ts`

```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { widgets } from "@/db/schema";
import { updateWidgetSchema } from "@/lib/schemas/widget.schema";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/widgets/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(widgets).where(eq(widgets.id, Number(id)));
    if (!row) return notFound(`Widget ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// PATCH /api/widgets/:id — partial update
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = updateWidgetSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const [row] = await db
      .update(widgets)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(widgets.id, Number(id)))
      .returning();

    if (!row) return notFound(`Widget ${id} not found`);
    return ok(row);
  } catch {
    return internalError();
  }
}

// DELETE /api/widgets/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db
      .delete(widgets)
      .where(eq(widgets.id, Number(id)))
      .returning();

    if (!row) return notFound(`Widget ${id} not found`);
    return ok({ deleted: true, id: row.id });
  } catch {
    return internalError();
  }
}
```

---

## Response Shape Reference

All handlers use helpers from `@/lib/api-response`. Never use `NextResponse.json()` directly.

| Helper          | Status | Shape                                                      |
|-----------------|--------|------------------------------------------------------------|
| `ok(data)`      | 200    | `{ code: "200", data: <payload> }`                         |
| `created(data)` | 201    | `{ code: "201", data: <payload> }`                         |
| `notFound(msg)` | 404    | `{ code: "404", data: { message } }`                       |
| `badRequest(msg, details?)` | 400 | `{ code: "400", data: { message, details? } }` |
| `internalError(msg?)` | 500 | `{ code: "500", data: { message } }`                  |

---

## Validation Rules

- **Always use `safeParse`** — never `parse()` in route handlers (unhandled throws escape the try/catch).
- Derive Zod schemas from Drizzle with `createInsertSchema` / `createSelectSchema` — never write Zod schemas by hand for DB-backed resources.
- Omit `id`, `createdAt`, `updatedAt` from insert schemas.
- Use `.partial()` for PATCH schemas.

---

## Database Conventions

- Table names: `snake_case` plural (e.g. `task_estimates`, `widget_tags`)
- Column names: `snake_case`
- Always include `createdAt` and `updatedAt` timestamp columns
- All tables go in `db/schema.ts` — never create separate schema files
- After any schema change: `yarn db:push`

---

## Golden Rules (Never Violate)

1. **Never call `NextResponse.json()` directly** — use the helpers in `@/lib/api-response`.
2. **Never write Zod schemas by hand** for DB-backed resources — derive from Drizzle schema.
3. **Always `safeParse`** request bodies — return `badRequest(...)` on failure, never throw.
4. **Route handlers are async and always wrap logic in try/catch** — return `internalError()` in the catch block.
5. **`params` is a Promise in Next.js 16** — always `await params` before destructuring.
6. **Imports use `@/` path alias** — never relative paths for `db`, `lib`, or `app` imports.
7. **Only one db client** — always import `{ db }` from `@/db`, never instantiate `Database` in a route.

---

## Checklist: Adding a New Endpoint

- [ ] Table defined in `db/schema.ts` (if new resource)
- [ ] `yarn db:push` run after schema change
- [ ] Zod schemas derived in `lib/schemas/{resource}.schema.ts`
- [ ] Route handler created at `app/api/{resource}/route.ts`
- [ ] Single-item handler at `app/api/{resource}/[id]/route.ts` (if needed)
- [ ] All responses use helpers from `@/lib/api-response`
- [ ] Request body validated with `safeParse` before touching the DB
- [ ] `params` is `await`ed before use
