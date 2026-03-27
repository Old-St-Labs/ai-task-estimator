"use server";

import type { ActionState } from "./types";
import { sanitizeName, sanitizeText } from "@/src/infrastructure/sanitize";
import { estimateTasksUseCase } from "@/src/application/estimate-tasks.use-case";
import { createEstimator } from "@/src/infrastructure/estimator-factory";

export async function estimateTasksAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Parse and sanitize FormData
  const userStoriesRaw = formData.get("userStories");
  const teamMembersRaw = formData.get("teamMembers");

  if (typeof userStoriesRaw !== "string" || !userStoriesRaw.trim()) {
    return { status: "error", message: "Please enter at least one user story." };
  }

  if (typeof teamMembersRaw !== "string" || !teamMembersRaw.trim()) {
    return { status: "error", message: "Please add at least one team member." };
  }

  let teamMembers: string[];
  try {
    const parsed: unknown = JSON.parse(teamMembersRaw);
    if (!Array.isArray(parsed)) throw new Error("invalid");
    teamMembers = parsed.map((m) => sanitizeName(String(m))).filter(Boolean);
  } catch {
    return { status: "error", message: "Invalid team members data." };
  }

  if (teamMembers.length === 0) {
    return { status: "error", message: "Please add at least one team member." };
  }

  const userStories = sanitizeText(userStoriesRaw)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (userStories.length === 0) {
    return { status: "error", message: "Please enter at least one user story." };
  }

  // 2. Delegate to use case
  try {
    const estimator = createEstimator();
    const result = await estimateTasksUseCase(estimator, userStories, teamMembers);
    return { status: "success", result };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to generate estimates. Check your configuration.";
    console.error("Estimation error:", err);
    return { status: "error", message };
  }
}
