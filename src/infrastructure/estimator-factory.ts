import type { IEstimatorPort } from "../domain/estimator.port";
import type { Task } from "../domain/task";

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createEstimator(): IEstimatorPort {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return new MockEstimator();
  return new AiEstimator(
    apiKey,
    process.env.AI_MODEL ?? "gpt-4o-mini",
    process.env.AI_BASE_URL ?? "https://api.openai.com/v1"
  );
}

// ─── AI Estimator (live mode) ─────────────────────────────────────────────────

const VALID_TYPES = new Set<string>(["FE", "BE"]);

class AiEstimator implements IEstimatorPort {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string
  ) {}

  async estimate(userStories: string[], teamMembers: string[]): Promise<Task[]> {
    const prompt = buildPrompt(userStories, teamMembers);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a technical project manager. Break down user stories into specific development tasks. Respond with valid JSON only — no markdown.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      throw new Error(
        `AI service error (${response.status}). Check your API key and model configuration.`
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI service.");

    const cleaned = content
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/```$/m, "")
      .trim();
    const parsed = JSON.parse(cleaned) as { tasks: unknown[] };
    if (!Array.isArray(parsed.tasks)) throw new Error("Unexpected AI response format.");

    return validateTasks(parsed.tasks, teamMembers);
  }
}

function buildPrompt(userStories: string[], teamMembers: string[]): string {
  return `Break down the following user stories into specific development tasks.

User Stories:
${userStories.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Team Members: ${teamMembers.join(", ")}

Requirements:
- Label each task "FE" (frontend/UI) or "BE" (backend/API/database)
- Estimate hours (integer 1-40), accounting for AI-native development (30-50% faster than traditional)
- Assign each task to one team member, distributing evenly
- Include 2-4 tasks per user story

Respond with exactly this JSON:
{"tasks":[{"title":"string","description":"string","type":"FE or BE","estimatedHours":number,"assignedTo":"exact name","userStory":"original story text"}]}`;
}

function validateTasks(raw: unknown[], teamMembers: string[]): Task[] {
  const memberSet = new Set(teamMembers.map((m) => m.toLowerCase()));
  return raw
    .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null)
    .map((t) => {
      const rawAssignee = String(t.assignedTo ?? "").trim();
      const assignedTo =
        teamMembers.find((m) => m.toLowerCase() === rawAssignee.toLowerCase()) ??
        teamMembers[0];
      return {
        title: String(t.title ?? "Untitled Task").slice(0, 120),
        description: String(t.description ?? "").slice(0, 300),
        type: VALID_TYPES.has(String(t.type)) ? (String(t.type) as "FE" | "BE") : "FE",
        estimatedHours: Math.max(1, Math.min(40, Math.round(Number(t.estimatedHours) || 2))),
        assignedTo: memberSet.has(rawAssignee.toLowerCase()) ? rawAssignee : assignedTo,
        userStory: String(t.userStory ?? "").slice(0, 200),
      };
    });
}

// ─── Mock Estimator (demo mode) ───────────────────────────────────────────────

type TaskTemplate = { title: string; description: string; type: "FE" | "BE"; hours: number };

const KEYWORD_TEMPLATES: Array<{ keywords: string[]; templates: TaskTemplate[] }> = [
  {
    keywords: ["login", "sign in", "signin", "log in", "authenticate", "auth"],
    templates: [
      { title: "Build login form UI", description: "Login page with email/password fields, validation states, and error messages.", type: "FE", hours: 4 },
      { title: "Implement authentication API endpoint", description: "POST /api/auth/login — validate credentials, issue JWT or session cookie.", type: "BE", hours: 5 },
      { title: "Add protected route middleware", description: "Redirect unauthenticated users; attach user context to requests.", type: "BE", hours: 3 },
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
      { title: "Add activity feed component", description: "Recent actions in a scrollable timeline with timestamps.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["search", "filter", "query", "find", "look up"],
    templates: [
      { title: "Build search input and results UI", description: "Debounced search input, loading indicator, and results list with highlighting.", type: "FE", hours: 4 },
      { title: "Implement full-text search endpoint", description: "GET /api/search — query indexed records, return paginated results.", type: "BE", hours: 6 },
      { title: "Add filter panel component", description: "Multi-select facet filters that sync to query params.", type: "FE", hours: 4 },
    ],
  },
  {
    keywords: ["profile", "account", "settings", "preferences"],
    templates: [
      { title: "Build profile edit form", description: "Editable profile fields with avatar upload and save confirmation.", type: "FE", hours: 4 },
      { title: "Implement profile update API", description: "PATCH /api/users/:id — validate and persist profile changes.", type: "BE", hours: 3 },
      { title: "Add avatar upload and storage", description: "Upload to object storage, generate CDN URL, update user record.", type: "BE", hours: 4 },
    ],
  },
  {
    keywords: ["notification", "alert", "email", "message", "notify"],
    templates: [
      { title: "Build notification bell and dropdown", description: "Real-time notification indicator with unread count badge and dismissal.", type: "FE", hours: 4 },
      { title: "Implement notification delivery service", description: "Queue-based worker for email and in-app alerts.", type: "BE", hours: 6 },
      { title: "Add notification preferences page", description: "User-controlled toggles for each notification type per channel.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["payment", "billing", "subscription", "checkout", "invoice"],
    templates: [
      { title: "Build checkout flow UI", description: "Multi-step checkout with card input and order summary.", type: "FE", hours: 6 },
      { title: "Integrate payment gateway", description: "Server-side payment API integration — create intent, handle webhooks.", type: "BE", hours: 8 },
      { title: "Build billing history page", description: "List past invoices and receipts with download links.", type: "FE", hours: 3 },
    ],
  },
  {
    keywords: ["report", "export", "csv", "pdf", "download", "chart", "graph"],
    templates: [
      { title: "Build data visualization components", description: "Charts and graphs for key metrics.", type: "FE", hours: 5 },
      { title: "Implement report export endpoint", description: "Generate CSV/PDF report server-side and stream to client.", type: "BE", hours: 5 },
    ],
  },
];

const FALLBACK_TEMPLATES: TaskTemplate[] = [
  { title: "Design and implement UI screens", description: "Responsive UI components, layouts, and interaction states for the feature.", type: "FE", hours: 5 },
  { title: "Build REST API endpoint", description: "Backend endpoint with validation, business logic, and error handling.", type: "BE", hours: 5 },
  { title: "Set up data model and database schema", description: "Define schema, create migrations, and add repository layer.", type: "BE", hours: 4 },
  { title: "Connect frontend to API", description: "Wire UI to backend endpoints, handle loading and error states.", type: "FE", hours: 3 },
];

class MockEstimator implements IEstimatorPort {
  async estimate(userStories: string[], teamMembers: string[]): Promise<Task[]> {
    const tasks: Task[] = [];
    const memberHours: Record<string, number> = {};
    for (const m of teamMembers) memberHours[m] = 0;

    const pickMember = () =>
      [...teamMembers].sort((a, b) => (memberHours[a] ?? 0) - (memberHours[b] ?? 0))[0] ??
      teamMembers[0];

    for (const story of userStories) {
      const lower = story.toLowerCase();
      let matched: TaskTemplate[] = [];
      for (const group of KEYWORD_TEMPLATES) {
        if (group.keywords.some((kw) => lower.includes(kw))) {
          matched = group.templates;
          break;
        }
      }
      if (matched.length === 0) matched = FALLBACK_TEMPLATES;

      const count = Math.min(matched.length, 2 + Math.floor(story.length / 40));
      for (const template of matched.slice(0, Math.max(2, count))) {
        const hours = Math.max(1, template.hours + Math.floor(Math.random() * 3) - 1);
        const assignedTo = pickMember();
        memberHours[assignedTo] = (memberHours[assignedTo] ?? 0) + hours;
        tasks.push({ ...template, estimatedHours: hours, assignedTo, userStory: story });
      }
    }
    return tasks;
  }
}
