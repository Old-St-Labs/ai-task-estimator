// app/components/sprints/task-card.tsx

import type { Task, UserStory } from "@/db/schema";

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
      {task.isAiGenerated === 1 && (
        <span className="mr-0.5 text-purple-400" title="AI-generated">✨</span>
      )}
      <span className="font-medium text-gray-800">{task.title}</span>
      <div className="mt-1 flex items-center gap-1">
        <span
          className={`rounded px-1 py-0.5 text-xs font-medium ${LAYER_COLORS[task.layer ?? "other"] ?? LAYER_COLORS.other}`}
        >
          {task.layer ?? "other"}
        </span>
        <span className="ml-auto text-gray-500">{task.estimatedHours ?? 0}h</span>
      </div>
      {story && (
        <p className="mt-0.5 truncate text-gray-400" title={story.title}>
          {story.title}
        </p>
      )}
    </div>
  );
}
