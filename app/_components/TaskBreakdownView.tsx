import type { EstimationResult } from "../types";
import { TaskCard } from "./TaskCard";

type Props = {
  result: EstimationResult;
};

const isProduction = !!process.env.AI_API_KEY;

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

      {/* AI-native development note — production mode only */}
      {isProduction && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            <strong className="font-semibold">AI-native development:</strong> Hours are adjusted for a team using AI coding assistants and AI-generated scaffolding, typically 30–50% faster than traditional estimates. Review and recalibrate based on your team&apos;s actual AI tooling maturity.
          </span>
        </div>
      )}

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
