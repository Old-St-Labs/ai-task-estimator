// app/components/sprints/sprint-board.tsx
"use client";

import type { Developer, Sprint, Task, UserStory } from "@/db/schema";
import { SprintColumn } from "@/app/components/sprints/sprint-column";

interface SprintBoardProps {
  sprints:    Sprint[];
  tasks:      Task[];
  developers: Developer[];
  stories:    UserStory[];
}

export function SprintBoard({ sprints, tasks, developers, stories }: SprintBoardProps) {
  const storyMap = new Map(stories.map((s) => [s.id, s]));
  const sortedSprints = [...sprints].sort((a, b) => a.sprintNumber - b.sprintNumber);

  return (
    <div className="mt-6 overflow-x-auto pb-4">
      <div className="flex gap-4" style={{ minWidth: `${sortedSprints.length * 300}px` }}>
        {sortedSprints.map((sprint) => {
          const sprintTasks = tasks.filter((t) => t.sprintNumber === sprint.sprintNumber);

          return (
            <SprintColumn
              key={sprint.id}
              sprint={sprint}
              tasks={sprintTasks}
              developers={developers}
              devMap={new Map(developers.map((d) => [d.id, d]))}
              storyMap={storyMap}
            />
          );
        })}
      </div>
    </div>
  );
}
