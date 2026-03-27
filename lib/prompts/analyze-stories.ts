/**
 * lib/prompts/analyze-stories.ts
 *
 * Prompt builders for the AI analysis pipeline.
 *
 * Each function returns a prompt string ready to be passed to gemini.generateContent().
 * All prompts instruct the model to return valid JSON matching the documented shape.
 */

import type { Developer, UserStory } from "@/db/schema";

// ---------------------------------------------------------------------------
// Gap Analysis
// ---------------------------------------------------------------------------

/**
 * Asks the LLM to identify implicit requirements that the user stories don't
 * explicitly mention (e.g. password hashing, email verification, error handling).
 *
 * Returns: { gaps: string[] }
 */
export function buildGapAnalysisPrompt(stories: UserStory[]): string {
  return `You are a senior software architect reviewing a list of user stories before development begins.

Identify implicit requirements, hidden tasks, or missing concerns that are NOT mentioned in the stories
but are typically required for a production-ready implementation (e.g. error handling, database migrations,
email triggers, security concerns, loading states, empty states, pagination, etc.).

User Stories:
${stories.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join("\n")}

Respond with valid JSON in this exact shape:
{
  "gaps": [
    "string describing an implicit requirement or missing concern"
  ]
}`;
}

// ---------------------------------------------------------------------------
// Task Breakdown + Assignment + Estimation
// ---------------------------------------------------------------------------

/**
 * Asks the LLM to decompose each user story into granular sub-tasks,
 * assign each task to the best-fit developer, and estimate hours.
 *
 * Returns: { tasks: AiTask[] }
 */
export interface AiTask {
  userStoryTitle: string;
  title: string;
  description: string;
  layer: "backend" | "frontend" | "infrastructure" | "design" | "qa" | "other";
  estimatedHours: number;
  assignedDeveloperName: string;
  reasoning: string;
}

export function buildTaskBreakdownPrompt(
  stories: UserStory[],
  developers: Developer[]
): string {
  const devList = developers
    .map(
      (d) =>
        `- ${d.name} (${d.role}): skills = ${d.skillset}, capacity = ${d.capacityHours}h per sprint`
    )
    .join("\n");

  return `You are a senior tech lead breaking down user stories into granular development tasks.

Developers available:
${devList}

User Stories:
${stories.map((s, i) => `${i + 1}. [${s.priority.toUpperCase()}] ${s.title}\n   Description: ${s.description}${s.acceptanceCriteria ? `\n   Acceptance Criteria: ${s.acceptanceCriteria}` : ""}`).join("\n\n")}

Instructions:
- Break each story into small, independently deliverable sub-tasks (typically 2–8 hours each).
- Assign each task to the developer whose skills best match the work.
- Estimate hours realistically — account for testing, code review, and edge cases.
- Set the layer field to help with sprint ordering (infrastructure and backend before frontend).
- Include a short reasoning for the assignment.

Respond with valid JSON in this exact shape:
{
  "tasks": [
    {
      "userStoryTitle": "exact title of the user story this task belongs to",
      "title": "short task title",
      "description": "what needs to be done",
      "layer": "backend" | "frontend" | "infrastructure" | "design" | "qa" | "other",
      "estimatedHours": number,
      "assignedDeveloperName": "exact name of assigned developer",
      "reasoning": "why this developer was chosen"
    }
  ]
}`;
}
