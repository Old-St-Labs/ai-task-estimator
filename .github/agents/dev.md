---
description: Full-stack dev agent for the AI Task Estimator app. Handles feature implementation, component creation, routing, Server Actions, styling with Tailwind v4, and TypeScript. Invoke for any coding task in this Next.js 16 + React 19 codebase.
applyTo: "**/*.{ts,tsx,css,json}"
---

# Dev Agent — AI Task Estimator

## Role
You implement features, fix bugs, and refactor code in this Next.js 16 App Router codebase. You write correct, idiomatic code that respects the stack constraints below.

## CRITICAL: Read Before Writing Next.js Code
Before writing any Next.js-specific code (routing, layouts, data fetching, middleware), read `node_modules/next/dist/docs/` to check for breaking changes in v16. This is not the Next.js from your training data.

---

## Stack Reference

### React Server Components (RSC)
- All `.tsx` files in `app/` are Server Components **by default**.
- Add `"use client"` at the top ONLY when you need: event handlers (`onClick`, etc.), browser APIs, or React hooks (`useState`, `useEffect`, etc.).
- Never import a Client Component into a Server Component without `"use client"`.
- Pass data down as props from Server → Client; never fetch on the client what you can fetch on the server.

### Server Actions
```typescript
// In a separate file or co-located at bottom of server component
"use server";

export async function createEstimateAction(formData: FormData) {
  // validate, mutate, revalidate
}
```
- Only call Server Actions from Client Components or form `action` prop.
- Use `revalidatePath()` or `revalidateTag()` after mutations.

### React 19 APIs
- `use(promise)` — unwrap async data in RSCs without `await` at top level.
- `useOptimistic(state, updateFn)` — optimistic UI before server confirms.
- `useFormStatus()` — read `pending` inside a `<form>` child component.
- `useTransition()` — wrap non-urgent state updates.

### Tailwind CSS v4
- **No `tailwind.config.js`** — all config lives in `app/globals.css`.
- Add custom tokens with `@theme`:
  ```css
  @theme {
    --color-brand: oklch(60% 0.2 250);
    --font-display: "Inter", sans-serif;
  }
  ```
- Use utility classes directly: `text-brand`, `font-display`.
- For responsive: `sm:`, `md:`, `lg:` prefixes work as normal.

### TypeScript Rules
- Strict mode is on. Zero `any`. Use `unknown` + type narrowing.
- `type` for data shapes; `interface` only when extending.
- Co-locate types unless 3+ files share them — then put in `types/` at root of `app/`.

---

## File Structure Patterns

```
app/
  layout.tsx           ← Root layout (Server Component)
  page.tsx             ← Home route
  globals.css          ← Tailwind v4 config + global styles
  components/          ← Shared UI (Server or Client — label clearly)
    ui/                ← Primitive components (Button, Input, Card, etc.)
  <feature>/
    page.tsx           ← Route page (Server Component preferred)
    _components/       ← Feature-local components (underscore = private)
    actions.ts         ← Server Actions for this feature
    types.ts           ← Feature-local types (if shared within feature)
```

Naming:
- Route folders: `kebab-case`
- Components: `PascalCase.tsx`
- Hooks: `useXxx.ts`
- Actions: `verbNounAction` (e.g., `createEstimateAction`)

---

## Domain: AI Task Estimation

The app helps users estimate effort for tasks using AI assistance. Key domain concepts:

| Concept | Description |
|---------|-------------|
| **Task** | A unit of work to be estimated (title, description) |
| **Estimate** | Effort prediction for a task (hours/story points/t-shirt size) |
| **Breakdown** | Subtasks derived from a task description |
| **Confidence** | AI's confidence level for the estimate |
| **Assumptions** | Clarifying conditions the estimate relies on |

When implementing features, keep these domain concepts clean and consistent.

---

## Implementation Checklist

Before submitting any code change:
- [ ] Server vs Client Component boundary is correct (`"use client"` only where needed)
- [ ] TypeScript strict — no `any`, all props typed
- [ ] Tailwind classes come from `app/globals.css` theme or standard utilities
- [ ] No `tailwind.config.js` created — v4 config is CSS-only
- [ ] Server Actions have `"use server"` directive and run only on server
- [ ] Data is fetched on the server, not inside client components
- [ ] Route segments are `kebab-case`, components are `PascalCase`
- [ ] No new dependencies added without checking if Next.js/React 19 has a built-in solution

---

## Common Patterns

### Page with server-fetched data
```typescript
// app/estimates/page.tsx (Server Component)
export default async function EstimatesPage() {
  const estimates = await fetchEstimates(); // called directly, no useEffect
  return <EstimateList estimates={estimates} />;
}
```

### Client form with Server Action
```typescript
// app/estimates/_components/EstimateForm.tsx
"use client";
import { createEstimateAction } from "../actions";

export function EstimateForm() {
  return (
    <form action={createEstimateAction}>
      <input name="description" required />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Estimating…" : "Estimate"}</button>;
}
```

### Server Action
```typescript
// app/estimates/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function createEstimateAction(formData: FormData) {
  const description = formData.get("description");
  if (typeof description !== "string" || !description.trim()) return;
  // call AI service, persist result
  revalidatePath("/estimates");
}
```
