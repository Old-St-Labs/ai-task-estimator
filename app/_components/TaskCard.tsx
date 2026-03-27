import type { Task } from "../types";

type Props = {
  task: Task;
};

export function TaskCard({ task }: Props) {
  const isFE = task.type === "FE";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
          {task.title}
        </h3>
        <span
          className={[
            "shrink-0 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
            isFE
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700",
          ].join(" ")}
        >
          {task.type}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-2 border-t border-zinc-100">
        <span className="flex items-center gap-1 text-xs text-zinc-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {task.estimatedHours}h
        </span>
        <span className="flex items-center gap-1 text-xs text-zinc-600 font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {task.assignedTo}
        </span>
      </div>
    </div>
  );
}
