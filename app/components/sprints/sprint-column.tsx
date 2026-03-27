// app/components/sprints/sprint-column.tsx

import type { Developer, Sprint, Task, UserStory } from "@/db/schema";
import { TaskCard } from "@/app/components/sprints/task-card";
import { CapacityBar } from "@/app/components/sprints/capacity-bar";
import { Badge } from "@/app/components/ui/badge";

interface SprintColumnProps {
  sprint:     Sprint;
  tasks:      Task[];
  developers: Developer[];
  devMap:     Map<number, Developer>;
  storyMap:   Map<number, UserStory>;
}

const formatDate = (d: Date | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

export function SprintColumn({ sprint, tasks, developers, devMap, storyMap }: SprintColumnProps) {
  const totalHours = tasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

  // Group tasks by developer
  const byDeveloper: Record<number | "unassigned", Task[]> = { unassigned: [] };
  for (const dev of developers) {
    byDeveloper[dev.id] = [];
  }
  for (const task of tasks) {
    const key = task.developerId ?? "unassigned";
    const bucket = byDeveloper[key];
    if (bucket) {
      bucket.push(task);
    } else {
      byDeveloper[key] = [task];
    }
  }

  return (
    <div className="w-72 flex-shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-3">
      {/* Sprint header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Sprint {sprint.sprintNumber}</h2>
          <Badge variant="default">planned</Badge>
        </div>
        <p className="text-xs text-gray-500">
          {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
        </p>
        <p className="text-xs text-gray-500">
          {tasks.length} tasks · {totalHours.toFixed(0)}h total
        </p>
      </div>

      {/* Developer swim lanes */}
      <div className="space-y-3">
        {developers.map((dev) => {
          const devTasks = byDeveloper[dev.id] ?? [];
          const devHours = devTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

          return (
            <div key={dev.id} className="rounded-lg border border-gray-200 bg-white p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{dev.name}</span>
                <span className="text-xs text-gray-500">{devHours.toFixed(0)}h</span>
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
