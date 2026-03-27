"use server";

import type { ActionState, Task } from "./types";

export async function estimateTasksAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    teamMembers = parsed
      .map((m) => sanitizeName(String(m)))
      .filter(Boolean);
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

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";

  let tasks: Task[];

  if (!apiKey) {
    // ── Demo / hackathon mode ────────────────────────────────────────────────
    // No API key configured — use the built-in mock engine so the app is fully
    // functional without any external service.
    tasks = mockEstimate(userStories, teamMembers);
  } else {
    // ── Live AI mode ─────────────────────────────────────────────────────────
    const prompt = buildPrompt(userStories, teamMembers);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert technical project manager. Break down user stories into specific development tasks and assign them to team members. Always respond with valid JSON only — no markdown, no code blocks.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI API error:", response.status, errText);
        return {
          status: "error",
          message: `AI service error (${response.status}). Check your API key and model configuration.`,
        };
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return { status: "error", message: "Empty response from AI service." };
      }

      const cleaned = content.replace(/^```[a-z]*\n?/i, "").replace(/```$/m, "").trim();
      const parsed = JSON.parse(cleaned) as { tasks: unknown[] };

      if (!Array.isArray(parsed.tasks)) {
        return { status: "error", message: "Unexpected AI response format." };
      }

      tasks = validateTasks(parsed.tasks, teamMembers);
    } catch (err) {
      console.error("Estimation error:", err);
      return {
        status: "error",
        message:
          "Failed to reach the AI service. Check your network and API configuration.",
      };
    }
  }

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const byMember: Record<string, number> = {};
  for (const task of tasks) {
    byMember[task.assignedTo] = (byMember[task.assignedTo] ?? 0) + task.estimatedHours;
  }

  return {
    status: "success",
    result: { tasks, summary: { totalHours, byMember } },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildPrompt(userStories: string[], teamMembers: string[]): string {
  return `Break down the following user stories into specific development tasks.

User Stories:
${userStories.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Available Team Members:
${teamMembers.join(", ")}

Requirements:
- Each task must have a clear, actionable title
- Classify each task as "FE" (frontend/UI) or "BE" (backend/API/database)
- Provide a realistic estimate in hours (whole number, min 1, max 40)
- Assign each task to one team member, distributing work as evenly as possible
- Include 2–5 tasks per user story
- Be specific and technical

Respond with exactly this JSON shape:
{
  "tasks": [
    {
      "title": "string",
      "description": "string — 1 or 2 sentences",
      "type": "FE" or "BE",
      "estimatedHours": number,
      "assignedTo": "exact name from the team list",
      "userStory": "the original user story text this task belongs to"
    }
  ]
}`;
}

function sanitizeText(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, 3000);
}

function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s'\-\.]/g, "")
    .trim()
    .slice(0, 60);
}

const VALID_TYPES = new Set<string>(["FE", "BE"]);

// ─── Mock engine (demo / hackathon mode) ────────────────────────────────────
// Generates realistic task breakdowns using keyword analysis of user stories.
// Used automatically when AI_API_KEY is not set.

type TaskTemplate = {
  title: string;
  description: string;
  type: "FE" | "BE";
  hours: number;
};

const KEYWORD_TEMPLATES: Array<{
  keywords: string[];
  templates: TaskTemplate[];
}> = [
  {
    keywords: ["login", "sign in", "signin", "log in", "authenticate", "auth"],
    templates: [
      { title: "Build login form UI", description: "Create login page with email and password fields, validation states, and error messages.", type: "FE", hours: 4 },
      { title: "Implement authentication API endpoint", description: "POST /api/auth/login — validate credentials, issue JWT or session cookie.", type: "BE", hours: 5 },
      { title: "Add protected route middleware", description: "Redirect unauthenticated users to login; attach user context to requests.", type: "BE", hours: 3 },
      { title: "Persist auth state client-side", description: "Store token/session in secure storage and restore on page reload.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["register", "sign up", "signup", "create account", "onboard"],
    templates: [
      { title: "Build registration form UI", description: "Multi-field form with client-side validation for email, password, and name.", type: "FE", hours: 4 },
      { title: "Create user registration endpoint", description: "POST /api/auth/register — hash password, persist user, send confirmation email.", type: "BE", hours: 5 },
      { title: "Set up email verification flow", description: "Generate one-time token, send verification email, verify on click.", type: "BE", hours: 4 },
    ],
  },
  {
    keywords: ["dashboard", "overview", "home screen", "summary", "analytics"],
    templates: [
      { title: "Design dashboard layout and navigation", description: "Responsive sidebar layout with top nav, breadcrumbs, and content area.", type: "FE", hours: 5 },
      { title: "Build summary stats widgets", description: "Reusable card components displaying key metrics with loading skeletons.", type: "FE", hours: 4 },
      { title: "Implement dashboard data aggregation API", description: "Aggregate user-specific metrics from the database with caching.", type: "BE", hours: 5 },
      { title: "Add activity feed component", description: "Display recent actions in a scrollable timeline with timestamps.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["search", "filter", "query", "find", "look up"],
    templates: [
      { title: "Build search input and results UI", description: "Debounced search input, loading indicator, and results list with highlighting.", type: "FE", hours: 4 },
      { title: "Implement full-text search endpoint", description: "GET /api/search — query indexed records, return paginated results.", type: "BE", hours: 6 },
      { title: "Add filter panel component", description: "Multi-select facet filters that sync to query params for shareable URLs.", type: "FE", hours: 4 },
    ],
  },
  {
    keywords: ["profile", "account", "settings", "preferences", "user data"],
    templates: [
      { title: "Build profile edit form", description: "Editable profile fields with avatar upload preview and save confirmation.", type: "FE", hours: 4 },
      { title: "Implement profile update API", description: "PATCH /api/users/:id — validate and persist profile changes.", type: "BE", hours: 3 },
      { title: "Add avatar upload and storage", description: "Upload image to object storage, generate CDN URL, update user record.", type: "BE", hours: 4 },
    ],
  },
  {
    keywords: ["notification", "alert", "email", "message", "notify"],
    templates: [
      { title: "Build notification bell and dropdown", description: "Real-time notification indicator with unread count badge and dismissal.", type: "FE", hours: 4 },
      { title: "Implement notification delivery service", description: "Queue-based notification worker for email and in-app alerts.", type: "BE", hours: 6 },
      { title: "Add notification preferences page", description: "User-controlled toggles for each notification type per channel.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["list", "view", "display", "show", "browse", "manage"],
    templates: [
      { title: "Build paginated list view", description: "Table or card list with sorting headers, pagination controls, and empty state.", type: "FE", hours: 4 },
      { title: "Implement list data endpoint", description: "GET /api/items — support pagination, sorting, and filtering query params.", type: "BE", hours: 4 },
    ],
  },
  {
    keywords: ["create", "add", "new", "submit", "post", "upload"],
    templates: [
      { title: "Build create/add form", description: "Controlled form with field validation, error display, and success feedback.", type: "FE", hours: 4 },
      { title: "Implement create endpoint", description: "POST /api/items — validate input, persist to database, return created record.", type: "BE", hours: 4 },
    ],
  },
  {
    keywords: ["delete", "remove", "archive", "deactivate"],
    templates: [
      { title: "Add delete confirmation dialog", description: "Modal with confirmation step to prevent accidental deletions.", type: "FE", hours: 2 },
      { title: "Implement delete/archive endpoint", description: "DELETE /api/items/:id — soft-delete or hard-delete with authorization check.", type: "BE", hours: 3 },
    ],
  },
  {
    keywords: ["payment", "billing", "subscription", "checkout", "invoice", "stripe"],
    templates: [
      { title: "Build checkout flow UI", description: "Multi-step checkout with card input (Stripe Elements) and order summary.", type: "FE", hours: 6 },
      { title: "Integrate payment gateway", description: "Server-side Stripe/payment API integration — create payment intent, handle webhooks.", type: "BE", hours: 8 },
      { title: "Build billing history page", description: "List past invoices and receipts with download links.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["report", "export", "csv", "pdf", "download", "chart", "graph"],
    templates: [
      { title: "Build data visualization components", description: "Charts and graphs for key metrics using a charting library.", type: "FE", hours: 5 },
      { title: "Implement report export endpoint", description: "Generate CSV/PDF report server-side and stream to client.", type: "BE", hours: 5 },
    ],
  },
];

const FALLBACK_TEMPLATES: TaskTemplate[] = [
  { title: "Design and implement UI screens", description: "Create responsive UI components, layouts, and interaction states for the feature.", type: "FE", hours: 5 },
  { title: "Build REST API endpoint", description: "Implement backend endpoint with validation, business logic, and error handling.", type: "BE", hours: 5 },
  { title: "Set up data model and database schema", description: "Define schema, create migrations, and add repository layer for the feature.", type: "BE", hours: 4 },
  { title: "Write integration and unit tests", description: "Cover critical paths with unit tests and end-to-end integration tests.", type: "BE", hours: 3 },
  { title: "Connect frontend to API", description: "Wire UI to backend endpoints, handle loading and error states.", type: "FE", hours: 3 },
];

function mockEstimate(userStories: string[], teamMembers: string[]): Task[] {
  const tasks: Task[] = [];
  let memberIndex = 0;

  const assign = () => {
    const member = teamMembers[memberIndex % teamMembers.length];
    memberIndex++;
    return member;
  };

  // Track hours per member to try to balance workload
  const memberHours: Record<string, number> = {};
  for (const m of teamMembers) memberHours[m] = 0;

  const pickMember = (preferType: "FE" | "BE") => {
    // Assign to the member with the fewest hours
    const sorted = [...teamMembers].sort(
      (a, b) => (memberHours[a] ?? 0) - (memberHours[b] ?? 0)
    );
    const member = sorted[0] ?? teamMembers[0];
    return member;
  };

  for (const story of userStories) {
    const lower = story.toLowerCase();

    // Find matching templates from keyword groups
    let matched: TaskTemplate[] = [];
    for (const group of KEYWORD_TEMPLATES) {
      if (group.keywords.some((kw) => lower.includes(kw))) {
        matched = group.templates;
        break;
      }
    }

    if (matched.length === 0) {
      matched = FALLBACK_TEMPLATES;
    }

    // Pick 3–4 tasks per story
    const count = Math.min(matched.length, 2 + Math.floor(story.length / 40));
    const selected = matched.slice(0, Math.max(2, count));

    for (const template of selected) {
      // Add ±1h variance so estimates feel natural
      const variance = Math.floor(Math.random() * 3) - 1;
      const hours = Math.max(1, template.hours + variance);
      const assignedTo = pickMember(template.type);
      memberHours[assignedTo] = (memberHours[assignedTo] ?? 0) + hours;

      tasks.push({
        title: template.title,
        description: template.description,
        type: template.type,
        estimatedHours: hours,
        assignedTo,
        userStory: story,
      });
    }
  }

  return tasks;
}

// ─── Validation (for live AI responses) ──────────────────────────────────────

function validateTasks(raw: unknown[], teamMembers: string[]): Task[] {
  const memberSet = new Set(teamMembers.map((m) => m.toLowerCase()));

  return raw
    .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null)
    .map((t) => {
      const rawAssignee = String(t.assignedTo ?? "").trim();
      const matchedMember =
        teamMembers.find((m) => m.toLowerCase() === rawAssignee.toLowerCase()) ??
        teamMembers[0];

      return {
        title: String(t.title ?? "Untitled Task").slice(0, 120),
        description: String(t.description ?? "").slice(0, 300),
        type: VALID_TYPES.has(String(t.type)) ? (String(t.type) as "FE" | "BE") : "FE",
        estimatedHours: Math.max(1, Math.min(40, Math.round(Number(t.estimatedHours) || 2))),
        assignedTo: memberSet.has(rawAssignee.toLowerCase()) ? rawAssignee : matchedMember,
        userStory: String(t.userStory ?? "").slice(0, 200),
      };
    });
}
