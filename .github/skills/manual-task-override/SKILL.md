---
name: manual-task-override
description: Guide for implementing manual editing of AI-generated tasks — reassigning developers, changing hour estimates, editing titles/descriptions, and deleting sub-tasks. Use this when asked to allow users to edit, override, or refine AI-generated task output.
---

# Skill: manual-task-override

> Use this skill when implementing the task review and manual override UI — the step where users refine the AI's output before generating sprints.

---

## Feature Overview (from PRD)

After the AI produces tasks, users must be able to:
- ✏️ **Edit** a task: change title, description, estimated hours, layer
- 👤 **Reassign** a task to a different developer
- 🗑️ **Delete** a sub-task
- ➕ **Add** a manual task not produced by AI

---

## API Routes

### PATCH `/api/tasks/[id]` — Partial update

```ts
// app/api/tasks/[id]/route.ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { updateTaskSchema } from "@/lib/schemas/task.schema";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
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

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.delete(tasks).where(eq(tasks.id, Number(id))).returning();
    if (!row) return notFound(`Task ${id} not found`);
    return ok({ deleted: true, id: row.id });
  } catch {
    return internalError();
  }
}
```

### Zod schema — `lib/schemas/task.schema.ts`

```ts
// lib/schemas/task.schema.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { tasks } from "@/db/schema";

export const taskSchema       = createSelectSchema(tasks);
export const createTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = typeof createTaskSchema._type;
export type UpdateTaskInput = typeof updateTaskSchema._type;
```

---

## Inline Edit Row Component

The task list should support inline editing — clicking a row opens an edit form in place:

```tsx
// app/components/tasks/task-row.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Developer, Task } from "@/db/schema";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const LAYER_LABELS: Record<string, string> = {
  backend: "Backend", frontend: "Frontend", database: "Database",
  infrastructure: "Infra", testing: "Testing", other: "Other",
};

interface TaskRowProps {
  task:       Task;
  developers: Developer[];
}

export function TaskRow({ task, developers }: TaskRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  const [editValues, setEditValues] = useState({
    title:          task.title,
    estimatedHours: task.estimatedHours,
    developerId:    task.developerId ?? "",
    layer:          task.layer,
  });

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:          editValues.title,
          estimatedHours: Number(editValues.estimatedHours),
          developerId:    editValues.developerId ? Number(editValues.developerId) : null,
          layer:          editValues.layer,
        }),
      });
      if (res.ok) { router.refresh(); setIsEditing(false); }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  const assignedDev = developers.find((d) => d.id === task.developerId);

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        {/* Editable title */}
        <td className="px-4 py-2">
          <input
            value={editValues.title}
            onChange={(e) => setEditValues((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </td>
        {/* Layer select */}
        <td className="px-4 py-2">
          <select
            value={editValues.layer}
            onChange={(e) => setEditValues((p) => ({ ...p, layer: e.target.value as Task["layer"] }))}
            className="rounded border px-2 py-1 text-sm"
          >
            {Object.keys(LAYER_LABELS).map((l) => <option key={l} value={l}>{LAYER_LABELS[l]}</option>)}
          </select>
        </td>
        {/* Estimated hours */}
        <td className="px-4 py-2">
          <input
            type="number"
            min={0.5}
            max={40}
            step={0.5}
            value={editValues.estimatedHours}
            onChange={(e) => setEditValues((p) => ({ ...p, estimatedHours: Number(e.target.value) }))}
            className="w-20 rounded border px-2 py-1 text-sm"
          />
        </td>
        {/* Developer reassign */}
        <td className="px-4 py-2">
          <select
            value={editValues.developerId}
            onChange={(e) => setEditValues((p) => ({ ...p, developerId: e.target.value }))}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="">— Unassigned —</option>
            {developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <Button size="sm" isLoading={isSaving} onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">
        {task.isAiGenerated === 1 && <span className="mr-1 text-xs text-purple-500">✨</span>}
        {task.title}
      </td>
      <td className="px-4 py-3">
        <Badge variant="default">{LAYER_LABELS[task.layer]}</Badge>
      </td>
      <td className="px-4 py-3 text-sm font-medium">{task.estimatedHours}h</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {assignedDev?.name ?? <span className="italic text-gray-400">Unassigned</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
          {isDeleting ? (
            <>
              <Button size="sm" variant="danger" onClick={handleDelete}>Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsDeleting(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setIsDeleting(true)}>Delete</Button>
          )}
        </div>
      </td>
    </tr>
  );
}
```

---

## Task List with Inline Edit

```tsx
// app/components/tasks/task-table.tsx
import type { Developer, Task, UserStory } from "@/db/schema";
import { TaskRow } from "@/app/components/tasks/task-row";
import { Badge } from "@/app/components/ui/badge";

interface TaskTableProps {
  story:      UserStory;
  tasks:      Task[];
  developers: Developer[];
}

export function TaskTable({ story, tasks, developers }: TaskTableProps) {
  const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);

  return (
    <div className="mb-6 rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">{story.title}</h3>
          <p className="text-sm text-gray-500">{tasks.length} tasks · {totalHours}h total</p>
        </div>
        <Badge variant={story.priority === "critical" ? "danger" : story.priority === "high" ? "warning" : "default"}>
          {story.priority}
        </Badge>
      </div>
      {tasks.length === 0 ? (
        <p className="px-4 py-3 text-sm text-gray-500">No tasks generated for this story.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2 text-left">Task</th>
              <th className="px-4 py-2 text-left">Layer</th>
              <th className="px-4 py-2 text-left">Est.</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} developers={developers} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## Rules

| Rule | Detail |
|---|---|
| `PATCH` only updates provided fields | Use `updateTaskSchema` (`.partial()`) |
| `updatedAt` always refreshed on update | Set `updatedAt: new Date()` in every `.set({...})` |
| Delete is soft-confirmed | Two-step button (click → "Confirm Delete" + "Cancel") |
| AI-generated marker | `isAiGenerated === 1` shown with ✨ icon |
| Optimistic UI | Use `router.refresh()` after every mutation |
| Developer list for reassign | Passed as prop from Server Component — never fetched client-side |

---

## Checklist: Manual Task Override

- [ ] `PATCH /api/tasks/[id]` with `updateTaskSchema.partial()`
- [ ] `DELETE /api/tasks/[id]` returns `{ deleted: true, id }`
- [ ] `TaskRow` component: view mode + inline edit mode (toggle via `isEditing`)
- [ ] Edit form: title, layer, estimatedHours, developerId (select from roster)
- [ ] Delete confirmation: two-step in the same row
- [ ] AI-generated tasks marked with ✨ icon
- [ ] `router.refresh()` called after every save/delete
- [ ] Developer list passed down from Server Component (not re-fetched in client)
