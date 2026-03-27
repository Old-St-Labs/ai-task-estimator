import type { EstimationResult } from "../types";
import { TaskCard } from "./TaskCard";

type Props = {
  result: EstimationResult;
};

export function TaskBreakdownView({ result }: Props) {
  const { tasks, summary } = result;

  // Group tasks by user story
  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const key = task.userStory || "Other";
    (acc[key] ??= []).push(task);
    return acc;
  }, {});

  const memberEntries = Object.entries(summary.byMember).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="mt-10 space-y-8">
      {/* Summary bar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          Summary
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-zinc-900">
              {summary.totalHours}h
            </span>
            <span className="text-sm text-zinc-500">total</span>
          </div>
          <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
          <div className="flex flex-wrap gap-3">
            {memberEntries.map(([member, hours]) => (
              <div
                key={member}
                className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm"
              >
                <span className="font-medium text-zinc-800">{member}</span>
                <span className="text-zinc-500">{hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks grouped by user story */}
      {Object.entries(grouped).map(([story, storyTasks]) => (
        <section key={story}>
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
            <span className="line-clamp-2">{story}</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {storyTasks.map((task, i) => (
              <TaskCard key={`${story}-${i}`} task={task} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
