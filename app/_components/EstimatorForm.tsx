"use client";

import { useActionState, useState } from "react";
import { estimateTasksAction } from "../actions";
import { TeamMembersInput } from "./TeamMembersInput";
import { TaskBreakdownView } from "./TaskBreakdownView";
import type { ActionState } from "../types";

const initialState: ActionState = { status: "idle" };

export function EstimatorForm() {
  const [state, formAction, isPending] = useActionState(
    estimateTasksAction,
    initialState
  );
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* User Stories */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="userStories"
              className="text-sm font-semibold text-zinc-700"
            >
              User Stories
              <span className="ml-1 text-zinc-400 font-normal">(one per line)</span>
            </label>
            <textarea
              id="userStories"
              name="userStories"
              required
              rows={10}
              placeholder={
                "As a user, I want to log in with my email and password\n" +
                "As a user, I want to see a dashboard with my recent activity\n" +
                "As an admin, I want to manage user accounts"
              }
              className="resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 leading-relaxed"
            />
          </div>

          {/* Team Members */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-700">
              Team Members
              <span className="ml-1 text-zinc-400 font-normal">(press Enter to add)</span>
            </span>
            <div className="rounded-xl border border-zinc-300 bg-white px-4 py-3 min-h-[232px]">
              <TeamMembersInput
                members={teamMembers}
                onChange={setTeamMembers}
              />
            </div>
            {/* Hidden field carries the JSON array to the Server Action */}
            <input
              type="hidden"
              name="teamMembers"
              value={JSON.stringify(teamMembers)}
            />
          </div>
        </div>

        {/* Error message */}
        {state.status === "error" && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating estimates…
              </>
            ) : (
              <>
                Generate Estimates
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {state.status === "success" && (
        <TaskBreakdownView result={state.result} />
      )}
    </div>
  );
}
