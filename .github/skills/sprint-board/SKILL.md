---
name: sprint-board
description: Guide for implementing the sprint board visualization — showing sprints as columns with developer swim lanes, task cards, and utilization indicators. Use this when asked to build or modify the sprint board, sprint timeline, or sprint view.
---

# Skill: sprint-board

> Use this skill when implementing the sprint board visualization — the final output view of the AI Task Estimator.

---

## Feature Overview (from PRD)

The sprint board shows:
- **Sprint columns** — one column per 2-week sprint
- **Developer rows/lanes** — tasks grouped by who they're assigned to
- **Task cards** — each with title, layer badge, estimated hours, and story context
- **Capacity indicators** — per-developer utilization bar per sprint
- **Unassigned tasks** — shown in a separate section

---

## Data Shape

The sprint board page fetches all sprints, tasks, developers, and stories for the project and composes them client-side.

### Server Component data fetch

```tsx
// app/projects/[id]/sprints/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, sprints, tasks, developers, userStories } from "@/db/schema";
import { SprintBoard } from "@/app/components/sprints/sprint-board";
import { GenerateSprintsButton } from "@/app/components/sprints/generate-sprints-button";

export const metadata = { title: "Sprint Plan" };

export default async function SprintsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const [sprintRows, taskRows, devRows, storyRows] = await Promise.all([
    db.select().from(sprints).where(eq(sprints.projectId, project.id)),
    db.select().from(tasks),   // filtered in SprintBoard by story's projectId
    db.select().from(developers).where(eq(developers.projectId, project.id)),
    db.select().from(userStories).where(eq(userStories.projectId, project.id)),
  ]);

  // Only tasks belonging to this project's stories
  const storyIds   = new Set(storyRows.map((s) => s.id));
  const projectTasks = taskRows.filter((t) => storyIds.has(t.userStoryId));

  return (
    <div className="mx-auto max-w-full px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sprint Plan — {project.name}</h1>
        <GenerateSprintsButton projectId={project.id} />
      </div>

      {sprintRows.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No sprints yet. Click "Generate Sprints" to build the plan.
        </p>
      ) : (
        <SprintBoard
          sprints={sprintRows}
          tasks={projectTasks}
          developers={devRows}
          stories={storyRows}
        />
      )}
    </div>
  );
}
```

---

## Sprint Board Component

```tsx
// app/components/sprints/sprint-board.tsx
"use client";

import type { Developer, Sprint, Task, UserStory } from "@/db/schema";
import { TaskCard } from "@/app/components/sprints/task-card";
import { CapacityBar } from "@/app/components/sprints/capacity-bar";
import { parseSkillset } from "@/lib/skillset";

interface SprintBoardProps {
  sprints:    Sprint[];
  tasks:      Task[];
  developers: Developer[];
  stories:    UserStory[];
}

export function SprintBoard({ sprints, tasks, developers, stories }: SprintBoardProps) {
  const storyMap = new Map(stories.map((s) => [s.id, s]));
  const devMap   = new Map(developers.map((d) => [d.id, d]));
  const sortedSprints = [...sprints].sort((a, b) => a.sprintNumber - b.sprintNumber);

  return (
    <div className="mt-6 overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {sortedSprints.map((sprint) => {
          const sprintTasks = tasks.filter((t) => t.sprintNumber === sprint.sprintNumber);

          return (
            <SprintColumn
              key={sprint.id}
              sprint={sprint}
              tasks={sprintTasks}
              developers={developers}
              devMap={devMap}
              storyMap={storyMap}
            />
          );
        })}
      </div>
    </div>
  );
}
```

---

## Sprint Column Component

```tsx
// app/components/sprints/sprint-column.tsx
import type { Developer, Sprint, Task, UserStory } from "@/db/schema";
import { TaskCard } from "@/app/components/sprints/task-card";
import { CapacityBar } from "@/app/components/sprints/capacity-bar";
import { Badge } from "@/app/components/ui/badge";

interface SprintColumnProps {
  sprint:    Sprint;
  tasks:     Task[];
  developers: Developer[];
  devMap:    Map<number, Developer>;
  storyMap:  Map<number, UserStory>;
}

export function SprintColumn({ sprint, tasks, developers, devMap, storyMap }: SprintColumnProps) {
  const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);

  // Group tasks by developer
  const byDeveloper = developers.reduce<Record<number | "unassigned", Task[]>>(
    (acc, dev) => { acc[dev.id] = []; return acc; },
    { unassigned: [] } as Record<number | "unassigned", Task[]>
  );

  for (const task of tasks) {
    const key = task.developerId ?? "unassigned";
    (byDeveloper[key] ?? (byDeveloper[key] = [])).push(task);
  }

  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

  return (
    <div className="w-72 flex-shrink-0 rounded-xl border bg-gray-50 p-3">
      {/* Sprint header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Sprint {sprint.sprintNumber}</h2>
          <Badge variant={sprint.status === "active" ? "success" : "default"}>
            {sprint.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">
          {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
        </p>
        <p className="text-xs text-gray-500">{totalHours.toFixed(1)}h total</p>
      </div>

      {/* Developer swim lanes */}
      <div className="space-y-3">
        {developers.map((dev) => {
          const devTasks  = byDeveloper[dev.id] ?? [];
          const devHours  = devTasks.reduce((s, t) => s + t.estimatedHours, 0);

          return (
            <div key={dev.id} className="rounded-lg border bg-white p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{dev.name}</span>
                <span className="text-xs text-gray-500">{devHours.toFixed(1)}h</span>
              </div>
              <CapacityBar used={devHours} capacity={dev.capacityHours} />
              <div className="mt-2 space-y-1">
                {devTasks.map((task) => (
                  <TaskCard key={task.id} task={task} story={storyMap.get(task.userStoryId)} />
                ))}
                {devTasks.length === 0 && (
                  <p className="text-xs italic text-gray-400">No tasks</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Unassigned tasks */}
        {(byDeveloper.unassigned?.length ?? 0) > 0 && (
          <div className="rounded-lg border border-dashed border-yellow-300 bg-yellow-50 p-2">
            <span className="text-xs font-medium text-yellow-700">⚠️ Unassigned</span>
            <div className="mt-2 space-y-1">
              {byDeveloper.unassigned!.map((task) => (
                <TaskCard key={task.id} task={task} story={storyMap.get(task.userStoryId)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task Card Component

```tsx
// app/components/sprints/task-card.tsx
import type { Task, UserStory } from "@/db/schema";
import { Badge } from "@/app/components/ui/badge";

const LAYER_COLORS: Record<string, string> = {
  backend:        "bg-green-100 text-green-700",
  frontend:       "bg-blue-100 text-blue-700",
  database:       "bg-purple-100 text-purple-700",
  infrastructure: "bg-red-100 text-red-700",
  testing:        "bg-yellow-100 text-yellow-700",
  other:          "bg-gray-100 text-gray-700",
};

interface TaskCardProps {
  task:  Task;
  story: UserStory | undefined;
}

export function TaskCard({ task, story }: TaskCardProps) {
  return (
    <div className="rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs">
      {task.isAiGenerated === 1 && <span className="mr-0.5 text-purple-400">✨</span>}
      <span className="font-medium text-gray-800">{task.title}</span>
      <div className="mt-1 flex items-center gap-1">
        <span className={`rounded px-1 py-0.5 text-xs font-medium ${LAYER_COLORS[task.layer]}`}>
          {task.layer}
        </span>
        <span className="ml-auto text-gray-500">{task.estimatedHours}h</span>
      </div>
      {story && (
        <p className="mt-0.5 truncate text-gray-400" title={story.title}>
          {story.title}
        </p>
      )}
    </div>
  );
}
```

---

## Capacity Bar Component

```tsx
// app/components/sprints/capacity-bar.tsx

interface CapacityBarProps {
  used:     number;
  capacity: number;
}

export function CapacityBar({ used, capacity }: CapacityBarProps) {
  const pct   = Math.min(Math.round((used / capacity) * 100), 100);
  const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
```

---

## Summary Stats Strip

Add a stats strip above the board for quick project overview:

```tsx
// app/components/sprints/sprint-stats.tsx
import type { Sprint, Task, Developer } from "@/db/schema";

interface SprintStatsProps {
  sprints:    Sprint[];
  tasks:      Task[];
  developers: Developer[];
}

export function SprintStats({ sprints, tasks, developers }: SprintStatsProps) {
  const totalHours       = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const unassignedCount  = tasks.filter((t) => !t.developerId).length;
  const sprintCount      = sprints.length;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Sprints",       value: sprintCount },
        { label: "Total Tasks",   value: tasks.length },
        { label: "Total Hours",   value: `${totalHours.toFixed(0)}h` },
        { label: "Unassigned",    value: unassignedCount, warn: unassignedCount > 0 },
      ].map(({ label, value, warn }) => (
        <div key={label} className={`rounded-lg border p-3 text-center ${warn ? "border-yellow-300 bg-yellow-50" : "bg-white"}`}>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Checklist: Sprint Board

- [ ] `sprints` and `tasks` tables include `sprintNumber`
- [ ] Server Component fetches all data at `app/projects/[id]/sprints/page.tsx`
- [ ] `SprintBoard` renders sprint columns in order
- [ ] `SprintColumn` groups tasks by developer swim lane + unassigned section
- [ ] `TaskCard` shows layer color, hours, story title, AI indicator
- [ ] `CapacityBar` shows utilization — red when >90%, yellow when >70%
- [ ] `SprintStats` shows aggregate numbers above the board
- [ ] `GenerateSprintsButton` in the page header (see `sprint-planning` skill)
- [ ] Unassigned tasks shown with warning styling in each sprint column
- [ ] Board is horizontally scrollable (`overflow-x-auto`) for many sprints
