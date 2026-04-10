// app/components/sprints/sprint-stats.tsx

import type { Sprint, Task, Developer } from "@/db/schema";

interface SprintStatsProps {
  sprints:    Sprint[];
  tasks:      Task[];
  developers: Developer[];
}

export function SprintStats({ sprints, tasks, developers }: SprintStatsProps) {
  const totalHours      = tasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  const unassignedCount = tasks.filter((t) => !t.developerId).length;
  const sprintCount     = sprints.length;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Sprints",      value: sprintCount,              warn: false },
        { label: "Total Tasks",  value: tasks.length,             warn: false },
        { label: "Total Hours",  value: `${totalHours.toFixed(0)}h`, warn: false },
        { label: "Unassigned",   value: unassignedCount,          warn: unassignedCount > 0 },
      ].map(({ label, value, warn }) => (
        <div
          key={label}
          className={`rounded-lg border p-3 text-center ${
            warn ? "border-yellow-300 bg-yellow-50" : "bg-white"
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
