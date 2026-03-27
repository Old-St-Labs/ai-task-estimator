// app/components/tasks/task-table.tsx
// Server Component — groups tasks by story with inline edit rows

import type { Developer, Task, UserStory } from "@/db/schema";
import { TaskRow } from "@/app/components/tasks/task-row";
import { Badge } from "@/app/components/ui/badge";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const PRIORITY_VARIANTS: Record<UserStory["priority"], BadgeVariant> = {
  low:      "default",
  medium:   "info",
  high:     "warning",
  critical: "danger",
};

interface TaskTableProps {
  story:      UserStory;
  tasks:      Task[];
  developers: Developer[];
}

export function TaskTable({ story, tasks, developers }: TaskTableProps) {
  const totalHours = tasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">{story.title}</h3>
          <p className="text-sm text-gray-500">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · {totalHours}h total
          </p>
        </div>
        <Badge variant={PRIORITY_VARIANTS[story.priority]}>{story.priority}</Badge>
      </div>

      {tasks.length === 0 ? (
        <p className="px-4 py-4 text-sm italic text-gray-400">
          No tasks generated for this story yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
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
        </div>
      )}
    </div>
  );
}
