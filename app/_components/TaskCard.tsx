import type { Task } from "../types";

type Props = {
  task: Task;
};

export function TaskCard({ task }: Props) {
  const isFE = task.type === "FE";

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50/80 sm:gap-4">
      {/* Type color dot */}
      <span
        className={[
          "h-2 w-2 shrink-0 rounded-full",
          isFE ? "bg-blue-400" : "bg-emerald-400",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* Title + description */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-800">{task.title}</p>
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-zinc-400">{task.description}</p>
        )}
      </div>

      {/* FE / BE badge */}
      <span
        className={[
          "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
          isFE ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600",
        ].join(" ")}
      >
        {task.type}
      </span>

      {/* Hours */}
      <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
        {task.estimatedHours}h
      </span>

      {/* Assignee avatar + name */}
      <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600"
          aria-hidden="true"
        >
          {task.assignedTo.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-xs text-zinc-500 md:inline">{task.assignedTo}</span>
      </span>
    </div>
  );
}
