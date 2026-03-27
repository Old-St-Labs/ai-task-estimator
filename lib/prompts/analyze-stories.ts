/**
 * lib/prompts/analyze-stories.ts
 *
 * Single combined prompt for the AI analysis pipeline.
 *
 * The prompt requests gap analysis + task breakdown + assignment + estimation
 * in one Gemini call, returning a structured JSON object that matches
 * llmResponseSchema in the analyze route handler.
 *
 * Rules:
 * - Always include numeric Story IDs and Developer IDs so the LLM response
 *   can be directly inserted into the DB without a lookup step.
 * - Always end with the "Return ONLY valid JSON" instruction.
 * - Never build two separate prompts — one call, one response.
 */

import type { Developer, UserStory } from "@/db/schema";

/**
 * Builds the single combined analysis prompt.
 *
 * Returns a prompt string ready to be passed to getJsonModel().generateContent().
 */
export function buildAnalysisPrompt(
  projectName: string,
  stories: Pick<UserStory, "id" | "title" | "description" | "acceptanceCriteria" | "priority">[],
  devRoster: Pick<Developer, "id" | "name" | "role" | "skillset" | "capacityHours">[]
): string {
  const storiesText = stories
    .map(
      (s) =>
        `Story ID: ${s.id}
Title: ${s.title}
Priority: ${s.priority}
Description: ${s.description}
Acceptance Criteria: ${s.acceptanceCriteria ?? "not specified"}`
    )
    .join("\n\n---\n\n");

  const devsText = devRoster
    .map(
      (d) =>
        `Developer ID: ${d.id}
Name: ${d.name}
Role: ${d.role}
Skills: ${d.skillset}
Capacity: ${d.capacityHours}h per sprint`
    )
    .join("\n\n");

  return `You are an expert software engineering project planner for the project "${projectName}".

Your job is to:
1. Identify implicit requirements and missing tasks not stated in the stories (gap analysis)
2. Break each user story into granular, actionable sub-tasks
3. Assign each sub-task to the most appropriate developer based on their skills
4. Estimate realistic effort in hours per task

## User Stories
${storiesText}

## Development Team
${devsText}

## Task Rules
- Break each story into 3–8 sub-tasks covering all necessary layers
- Include implicit tasks not mentioned in the story (e.g. input validation, error handling, DB indexes, email triggers, loading/empty states)
- Each task must take between 0.5 and 16 hours
- Assign tasks based on skill match — use the Developer IDs provided above
- If no developer has the right skill, set assignedDeveloperId to null
- layer must be one of: backend, frontend, database, infrastructure, testing, other

## Gap Rules
- List business requirements, edge cases, or technical concerns implied but not stated
- Reference the Story ID the gap belongs to
- Examples: "Password reset flow not specified", "Rate limiting on auth endpoints"

## Required JSON Output

Return ONLY valid JSON — no markdown, no code blocks, no explanation:

{
  "gaps": [
    {
      "storyId": <number — must be a valid Story ID from above>,
      "title": "<short gap title>",
      "description": "<explanation of the missing requirement>"
    }
  ],
  "tasks": [
    {
      "userStoryId": <number — must be a valid Story ID from above>,
      "title": "<specific actionable task title>",
      "description": "<what needs to be implemented and why>",
      "layer": "<backend|frontend|database|infrastructure|testing|other>",
      "estimatedHours": <number between 0.5 and 16>,
      "assignedDeveloperId": <Developer ID from the list above, or null>,
      "assignmentReason": "<why this developer was chosen>"
    }
  ]
}`;
}
