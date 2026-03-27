import type { EstimationResult } from "../types";
import { TaskCard } from "./TaskCard";

type Props = {
  result: EstimationResult;
};

const isProduction = !!process.env.AI_API_KEY;

const MEMBER_BAR_COLORS = [
  "bg-teal-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-rose-500",
  "bg-emerald-500",
];

export function TaskBreakdownView({ result }: Props) {
  const { tasks, summary } = result;

  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const key = task.userStory || "Other";
    (acc[key] ??= []).push(task);
    return acc;
  }, {});

  const memberEntries = Object.entries(summary.byMember).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-5">

      {/* Summary row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Total hours */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Total Estimate</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-zinc-900">{summary.totalHours}</span>
            <span className="text-base font-medium text-zinc-500">hours</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {tasks.length} tasks · {memberEntries.length} member{memberEntries.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Workload by member — My Goals style */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">Workload</p>
          <ul className="space-y-3">
            {memberEntries.map(([member, hours], i) => (
              <li key={member}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-700">{member}</span>
                  <span className="text-sm text-zinc-500">{hours}h</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  {/* width is data-driven — intentional inline style */}
                  <div
                    className={`h-full rounded-full ${MEMBER_BAR_COLORS[i % MEMBER_BAR_COLORS.length]}`}
                    style={{ width: `${Math.round((hours / summary.totalHours) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI-native development note — production only */}
      {isProduction && (
        <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            <strong className="font-semibold">AI-native development:</strong> Hours reflect ~30–50%
            acceleration from AI tooling. Recalibrate based on your team&apos;s actual AI maturity.
          </span>
        </div>
      )}

      {/* Tasks grouped by user story */}
      {Object.entries(grouped).map(([story, storyTasks]) => (
        <div key={story} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-teal-400" aria-hidden="true" />
              <h2 className="truncate text-sm font-semibold text-zinc-700">{story}</h2>
            </div>
            <span className="ml-3 shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
              {storyTasks.length} task{storyTasks.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-zinc-50">
            {storyTasks.map((task, i) => (
              <TaskCard key={`${story}-${i}`} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
