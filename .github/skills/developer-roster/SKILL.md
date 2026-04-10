---
name: developer-roster
description: Guide for implementing the Developer entity — schema, API routes, list UI, add/edit form, and capacity display. Use this when asked to add, modify, or scaffold anything related to developers, team members, or developer capacity.
---

# Skill: developer-roster

> Use this skill for all work related to the Developer entity — from schema to UI.
> This is a domain-specific guide. Read `crud-resource` for the generic CRUD scaffold steps.

---

## Developer Entity Overview

A **Developer** belongs to a **Project** and represents a team member with:
- A `role` (frontend / backend / fullstack / devops / qa)
- A `skillset` (stored as a JSON array string: `'["React","Node.js","TypeScript"]'`)
- A `capacityHours` per sprint (default: 80 hours)

The developer roster is used by the AI analysis to assign tasks and by the sprint planner to respect capacity.

---

## Schema Definition

In `db/schema.ts`, ensure the `developers` table exists:

```ts
export const developers = sqliteTable("developers", {
  id:            int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId:     int("project_id", { mode: "number" }).notNull().references(() => projects.id),
  name:          text("name").notNull(),
  role:          text("role", { enum: ["frontend", "backend", "fullstack", "devops", "qa"] }).notNull(),
  skillset:      text("skillset").notNull().default("[]"), // JSON array: '["React","Node.js"]'
  capacityHours: real("capacity_hours").notNull().default(80),
  createdAt:     int("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt:     int("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});
export type Developer    = typeof developers.$inferSelect;
export type NewDeveloper = typeof developers.$inferInsert;
```

After adding: `yarn db:push`

---

## Zod Schema — `lib/schemas/developer.schema.ts`

```ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { developers } from "@/db/schema";

export const developerSchema = createSelectSchema(developers);

export const createDeveloperSchema = createInsertSchema(developers)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    // Skillset is stored as JSON string but accepted as comma-separated text from forms
    skillset: z.string().min(1, "At least one skill is required"),
  });

export const updateDeveloperSchema = createDeveloperSchema.partial();

export type CreateDeveloperInput = typeof createDeveloperSchema._type;
export type UpdateDeveloperInput = typeof updateDeveloperSchema._type;
```

### Skillset Helpers

```ts
// lib/skillset.ts
/** Parse a skillset JSON string into a string array */
export function parseSkillset(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Fall back to comma-separated
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Serialize a comma-separated skill string into a JSON array string for DB storage */
export function serializeSkillset(raw: string): string {
  const skills = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return JSON.stringify(skills);
}
```

---

## API Routes

### Collection — `app/api/developers/route.ts`

```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { createDeveloperSchema } from "@/lib/schemas/developer.schema";
import { serializeSkillset } from "@/lib/skillset";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const rows = projectId
      ? await db.select().from(developers).where(eq(developers.projectId, Number(projectId)))
      : await db.select().from(developers);
    return ok(rows);
  } catch { return internalError(); }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createDeveloperSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    // Normalize skillset to JSON array
    const data = { ...parsed.data, skillset: serializeSkillset(parsed.data.skillset) };
    const [row] = await db.insert(developers).values(data).returning();
    return created(row);
  } catch { return internalError(); }
}
```

### Single item — `app/api/developers/[id]/route.ts`

```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { updateDeveloperSchema } from "@/lib/schemas/developer.schema";
import { serializeSkillset } from "@/lib/skillset";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(developers).where(eq(developers.id, Number(id)));
    if (!row) return notFound();
    return ok(row);
  } catch { return internalError(); }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = updateDeveloperSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const data = parsed.data.skillset
      ? { ...parsed.data, skillset: serializeSkillset(parsed.data.skillset), updatedAt: new Date() }
      : { ...parsed.data, updatedAt: new Date() };

    const [row] = await db.update(developers).set(data).where(eq(developers.id, Number(id))).returning();
    if (!row) return notFound();
    return ok(row);
  } catch { return internalError(); }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(developers).where(eq(developers.id, Number(id))).returning();
    if (!row) return notFound();
    return ok({ deleted: true, id: row.id });
  } catch { return internalError(); }
}
```

---

## UI Components

### DeveloperCard — `app/components/developers/developer-card.tsx`

```tsx
import type { Developer } from "@/db/schema";
import { Badge } from "@/app/components/ui/badge";
import { parseSkillset } from "@/lib/skillset";

const ROLE_VARIANTS = {
  frontend:  "info",  backend: "success", fullstack: "warning",
  devops:    "danger", qa: "default",
} as const;

export function DeveloperCard({ developer }: { developer: Developer }) {
  const skills = parseSkillset(developer.skillset);
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{developer.name}</h3>
          <Badge variant={ROLE_VARIANTS[developer.role] ?? "default"} className="mt-1">
            {developer.role}
          </Badge>
        </div>
        <span className="text-xs text-gray-500">{developer.capacityHours}h/sprint</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {skills.map((skill) => (
          <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
```

### DeveloperForm — `app/components/developers/developer-form.tsx`

See the `create-form` skill for the full form pattern. The developer form fields are:

| Field | Input type | Validation |
|---|---|---|
| `name` | text | required, min 1 |
| `role` | select | enum value required |
| `skillset` | text | comma-separated, min 1 skill |
| `capacityHours` | number | 1–160, default 80 |

The form posts to `POST /api/developers` (create) or `PATCH /api/developers/:id` (edit).

---

## Roster Page — `app/projects/[id]/developers/page.tsx`

```tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, developers } from "@/db/schema";
import { DeveloperCard } from "@/app/components/developers/developer-card";
import { Modal } from "@/app/components/ui/modal";
import { Button } from "@/app/components/ui/button";
import { DeveloperForm } from "@/app/components/developers/developer-form";

export default async function DevelopersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const devRoster = await db.select().from(developers).where(eq(developers.projectId, project.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Roster</h1>
          <p className="text-sm text-gray-500">{devRoster.length} developer{devRoster.length !== 1 ? "s" : ""}</p>
        </div>
        <Modal title="Add Developer" trigger={<Button>+ Add Developer</Button>}>
          <DeveloperForm projectId={project.id} />
        </Modal>
      </div>

      {devRoster.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No developers yet. Add your team to enable AI task assignment.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devRoster.map((dev) => <DeveloperCard key={dev.id} developer={dev} />)}
        </div>
      )}
    </div>
  );
}
```

---

## Checklist: Developer Roster Feature

- [ ] `developers` table in `db/schema.ts` with `projectId` foreign key, `role` enum, `skillset` (JSON string), `capacityHours`
- [ ] `yarn db:push` run
- [ ] `lib/skillset.ts` with `parseSkillset` and `serializeSkillset` helpers
- [ ] `lib/schemas/developer.schema.ts` with create + update Zod schemas
- [ ] `GET/POST /api/developers` with `?projectId=` filter
- [ ] `GET/PATCH/DELETE /api/developers/[id]`
- [ ] `POST` and `PATCH` serialize skillset to JSON array before DB insert
- [ ] `DeveloperCard` parses skillset JSON for display
- [ ] `DeveloperForm` with all 4 fields + validation
- [ ] Developers page at `app/projects/[id]/developers/page.tsx`
