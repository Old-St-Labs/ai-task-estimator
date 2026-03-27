---
name: user-story-management
description: Guide for implementing the User Story entity — schema, API routes, list UI, and create/edit form including acceptance criteria and priority. Use this when asked to add, modify, or scaffold anything related to user stories, requirements, or story backlog.
---

# Skill: user-story-management

> Use this skill for all work related to the User Story entity.
> Read `crud-resource` for the generic scaffold steps that apply here.

---

## User Story Entity Overview

A **User Story** belongs to a **Project** and represents a high-level feature requirement with:
- `title` — short summary
- `description` — detailed context
- `acceptanceCriteria` — conditions for completion (optional but recommended)
- `priority` — `low | medium | high | critical`
- `status` — `pending | analyzed | planned` (managed by the system, not the user directly)

---

## Schema Definition

In `db/schema.ts`:

```ts
export const userStories = sqliteTable("user_stories", {
  id:                 int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId:          int("project_id", { mode: "number" }).notNull().references(() => projects.id),
  title:              text("title").notNull(),
  description:        text("description").notNull(),
  acceptanceCriteria: text("acceptance_criteria"),
  priority:           text("priority", { enum: ["low", "medium", "high", "critical"] }).notNull().default("medium"),
  status:             text("status", { enum: ["pending", "analyzed", "planned"] }).notNull().default("pending"),
  createdAt:          int("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt:          int("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});
export type UserStory    = typeof userStories.$inferSelect;
export type NewUserStory = typeof userStories.$inferInsert;
```

After adding: `yarn db:push`

---

## Zod Schema — `lib/schemas/user-story.schema.ts`

```ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userStories } from "@/db/schema";

export const userStorySchema = createSelectSchema(userStories);

export const createUserStorySchema = createInsertSchema(userStories).omit({
  id: true, createdAt: true, updatedAt: true,
  status: true,   // system-managed, never sent by user on create
});

export const updateUserStorySchema = createUserStorySchema.partial();

export type CreateUserStoryInput = typeof createUserStorySchema._type;
export type UpdateUserStoryInput = typeof updateUserStorySchema._type;
```

---

## API Routes

### Collection — `app/api/stories/route.ts`

```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userStories } from "@/db/schema";
import { createUserStorySchema } from "@/lib/schemas/user-story.schema";
import { badRequest, created, internalError, ok } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const rows = projectId
      ? await db.select().from(userStories).where(eq(userStories.projectId, Number(projectId)))
      : await db.select().from(userStories);
    return ok(rows);
  } catch { return internalError(); }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createUserStorySchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    const [row] = await db.insert(userStories).values(parsed.data).returning();
    return created(row);
  } catch { return internalError(); }
}
```

### Single item — `app/api/stories/[id]/route.ts`

```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userStories } from "@/db/schema";
import { updateUserStorySchema } from "@/lib/schemas/user-story.schema";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(userStories).where(eq(userStories.id, Number(id)));
    if (!row) return notFound();
    return ok(row);
  } catch { return internalError(); }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = updateUserStorySchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    const [row] = await db.update(userStories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(userStories.id, Number(id)))
      .returning();
    if (!row) return notFound();
    return ok(row);
  } catch { return internalError(); }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(userStories).where(eq(userStories.id, Number(id))).returning();
    if (!row) return notFound();
    return ok({ deleted: true, id: row.id });
  } catch { return internalError(); }
}
```

---

## UI Components

### Story Status Badge

```tsx
// app/components/stories/story-status-badge.tsx
import { Badge } from "@/app/components/ui/badge";
import type { UserStory } from "@/db/schema";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  variant: "default"  as const },
  analyzed: { label: "Analyzed", variant: "info"     as const },
  planned:  { label: "Planned",  variant: "success"  as const },
};

const PRIORITY_CONFIG = {
  low:      { label: "Low",      variant: "default"  as const },
  medium:   { label: "Medium",   variant: "info"     as const },
  high:     { label: "High",     variant: "warning"  as const },
  critical: { label: "Critical", variant: "danger"   as const },
};

export function StoryStatusBadge({ status }: { status: UserStory["status"] }) {
  const { label, variant } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: UserStory["priority"] }) {
  const { label, variant } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return <Badge variant={variant}>{label}</Badge>;
}
```

### Story List Item

```tsx
// app/components/stories/story-list-item.tsx
import type { UserStory } from "@/db/schema";
import { StoryStatusBadge, PriorityBadge } from "@/app/components/stories/story-status-badge";

interface StoryListItemProps {
  story:    UserStory;
  taskCount?: number;
}

export function StoryListItem({ story, taskCount }: StoryListItemProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{story.title}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{story.description}</p>
          {story.acceptanceCriteria && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                Acceptance Criteria
              </summary>
              <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">{story.acceptanceCriteria}</p>
            </details>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <PriorityBadge priority={story.priority} />
          <StoryStatusBadge status={story.status} />
          {taskCount !== undefined && (
            <span className="text-xs text-gray-400">{taskCount} tasks</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### UserStory Form Fields

When building the form (see `create-form` skill), use these fields:

| Field | Input type | Notes |
|---|---|---|
| `title` | text | required, min 1 |
| `description` | textarea | required, min 10 chars |
| `acceptanceCriteria` | textarea | optional |
| `priority` | select | `low \| medium \| high \| critical`, default `medium` |
| `projectId` | hidden | passed as prop, not shown to user |

The form posts to `POST /api/stories` (create) or `PATCH /api/stories/:id` (edit).
Do **not** allow the user to set `status` — it is system-managed.

---

## Stories Backlog Page — `app/projects/[id]/stories/page.tsx`

```tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, userStories, tasks } from "@/db/schema";
import { StoryListItem } from "@/app/components/stories/story-list-item";
import { Modal } from "@/app/components/ui/modal";
import { Button } from "@/app/components/ui/button";
import { UserStoryForm } from "@/app/components/stories/user-story-form";

export default async function StoriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const stories  = await db.select().from(userStories).where(eq(userStories.projectId, project.id));
  const allTasks = await db.select().from(tasks); // for task count per story

  const taskCountMap = allTasks.reduce<Record<number, number>>((acc, t) => {
    acc[t.userStoryId] = (acc[t.userStoryId] ?? 0) + 1;
    return acc;
  }, {});

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...stories].sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Stories</h1>
          <p className="text-sm text-gray-500">{stories.length} stories</p>
        </div>
        <Modal title="Add User Story" trigger={<Button>+ Add Story</Button>}>
          <UserStoryForm projectId={project.id} />
        </Modal>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No user stories yet. Add your first story to get started.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {sorted.map((story) => (
            <StoryListItem key={story.id} story={story} taskCount={taskCountMap[story.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Checklist: User Story Management

- [ ] `user_stories` table in `db/schema.ts` — all columns including `acceptance_criteria`, `priority`, `status`
- [ ] `yarn db:push` run
- [ ] `lib/schemas/user-story.schema.ts` — select, create (omit `status`), and update schemas
- [ ] `GET/POST /api/stories` with `?projectId=` filter
- [ ] `GET/PATCH/DELETE /api/stories/[id]`
- [ ] `status` is never accepted from user input on create
- [ ] `StoryListItem` with priority badge, status badge, and acceptance criteria toggle
- [ ] `UserStoryForm` with 4 user-facing fields (title, description, acceptance criteria, priority)
- [ ] Stories sorted by priority order on the list page (critical → high → medium → low)
