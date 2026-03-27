"use client";

import { useActionState, useState } from "react";
import { estimateTasksAction } from "../actions";
import { TeamMembersInput } from "./TeamMembersInput";
import { TaskBreakdownView } from "./TaskBreakdownView";
import type { ActionState } from "../types";

const initialState: ActionState = { status: "idle" };

function ResultsSkeleton() {
  return (
    <div className="space-y-5" aria-live="polite" aria-busy="true" aria-label="Generating estimates">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 h-3 w-24 rounded-full bg-zinc-200" />
            <div className="mb-2 h-8 w-16 rounded-lg bg-zinc-200" />
            <div className="h-2.5 w-32 rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3.5">
            <div className="h-2 w-2 rounded-full bg-zinc-200" />
            <div className="h-3 w-48 rounded-full bg-zinc-200" />
          </div>
          <div className="divide-y divide-zinc-50">
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex items-center gap-4 px-5 py-4">
                <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded-full bg-zinc-200" />
                  <div className="h-2.5 w-1/2 rounded-full bg-zinc-100" />
                </div>
                <div className="h-5 w-8 shrink-0 rounded-md bg-zinc-200" />
                <div className="h-5 w-10 shrink-0 rounded-full bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EstimatorForm() {
  const [state, formAction, isPending] = useActionState(
    estimateTasksAction,
    initialState
  );
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* User Stories card */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-zinc-800">User Stories</span>
              </div>
              <span className="text-xs text-zinc-400">one per line</span>
            </div>
            <div className="p-5">
              <textarea
                id="userStories"
                name="userStories"
                required
                rows={10}
                placeholder={"As a user, I want to log in with my email and password\nAs a user, I want to see a dashboard with my recent activity\nAs an admin, I want to manage user accounts"}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
          </div>

          {/* Team Members card */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-zinc-800">Team Members</span>
              </div>
              <span className="text-xs text-zinc-400">press Enter to add</span>
            </div>
            <div className="min-h-[240px] p-5">
              <TeamMembersInput members={teamMembers} onChange={setTeamMembers} />
            </div>
            <input type="hidden" name="teamMembers" value={JSON.stringify(teamMembers)} />
          </div>
        </div>

        {state.status === "error" && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-violet-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating estimates…
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
                </svg>
                Generate Estimates
              </>
            )}
          </button>
        </div>
      </form>

      {isPending && <ResultsSkeleton />}
      {!isPending && state.status === "success" && (
        <TaskBreakdownView result={state.result} />
      )}
    </div>
  );
}
