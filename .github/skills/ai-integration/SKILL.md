---
name: ai-integration
description: AI API integration patterns for this app — prompt building, response parsing, input sanitization, environment config, and mock fallback. Activate when working on actions.ts or any AI service code.
---

# AI Integration

## Architecture

The AI pipeline lives entirely in `app/actions.ts` (Server Action). It:
1. Validates and sanitizes user input
2. Builds a structured prompt
3. Calls the AI API (or falls back to mock engine)
4. Parses and validates the JSON response
5. Returns typed `ActionState`

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `AI_API_KEY` | No | — | API key; if absent, mock engine runs |
| `AI_MODEL` | No | `gpt-4o-mini` | Model identifier |
| `AI_BASE_URL` | No | `https://api.openai.com/v1` | OpenAI-compatible base URL |

**Rule:** Read env vars in Server Actions/Server Components only — never expose to client.

```typescript
const apiKey = process.env.AI_API_KEY;
const model = process.env.AI_MODEL ?? "gpt-4o-mini";
const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
```

## Input Sanitization (REQUIRED)

Never inject raw user input into prompts. Always sanitize first:

```typescript
function sanitizeText(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .slice(0, 3000); // hard cap
}

function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s'\-\.]/g, "") // allowlist only safe chars
    .trim()
    .slice(0, 60);
}
```

## Prompt Building

Use a template function — never string-concatenate user data directly:

```typescript
function buildPrompt(userStories: string[], teamMembers: string[]): string {
  return `Break down the following user stories...

User Stories:
${userStories.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Available Team Members:
${teamMembers.join(", ")}

Respond with exactly this JSON shape:
{
  "tasks": [{ "title": "...", "type": "FE"|"BE", "estimatedHours": number }]
}`;
}
```

## API Call Pattern

```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: "You are a... Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  }),
});

if (!response.ok) {
  const errText = await response.text();
  console.error("AI API error:", response.status, errText);
  return { status: "error", message: `AI service error (${response.status}).` };
}
```

## Response Parsing & Validation

Always validate AI output before using it — never trust shape:

```typescript
const data = (await response.json()) as {
  choices: Array<{ message: { content: string } }>;
};

const content = data.choices?.[0]?.message?.content;
if (!content) return { status: "error", message: "Empty response." };

// Strip markdown code fences if present
const cleaned = content.replace(/^```[a-z]*\n?/i, "").replace(/```$/m, "").trim();

const parsed = JSON.parse(cleaned) as { tasks: unknown[] };
if (!Array.isArray(parsed.tasks)) {
  return { status: "error", message: "Unexpected AI response format." };
}

// Validate each item
const tasks = validateTasks(parsed.tasks, teamMembers);
```

## Mock Engine (Demo Mode)

When `AI_API_KEY` is absent, the app uses a keyword-based mock engine in `actions.ts`. This is intentional — the app works without any API key.

**Do not remove the mock engine.** It keeps the app functional for demos.

## Response Type Contract

```typescript
// app/types.ts
type ActionState =
  | { status: "idle" }
  | { status: "success"; result: EstimationResult }
  | { status: "error"; message: string };
```

Server Actions must always return `ActionState`. Never throw — catch errors and return `{ status: "error", message: "..." }`.

## Security Rules

- Sanitize ALL user input before prompt injection.
- Never log API keys or full request bodies.
- Keep AI calls server-side only (Server Actions, Server Components).
- Validate and cap parsed numbers: `Math.max(min, Math.min(40, Number(val)))`.
- Validate strings are in allowlists before using: `VALID_TYPES.has(String(t.type))`.

## Cost & Token Guidance

For prompt cost optimization, model selection, `max_tokens`, and token logging — see [token-optimization skill](.github/skills/token-optimization/SKILL.md).
