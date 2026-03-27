---
name: refactoring
description: Refactoring patterns for a Next.js 16 + React 19 + TypeScript strict codebase. Covers component extraction, SC/CC boundary fixes, TypeScript tightening, Tailwind deduplication, and Server Action cleanup. Activate when improving code structure without changing behaviour.
---

# Refactoring Patterns

> **Golden rule:** A refactor must not change observable behaviour. Runtime output before == runtime output after. If behaviour differs, it was a change, not a refactor.

## 1. Extract Component

**When:** A file exceeds ~150 lines, or a JSX block maps to a clear reusable concept.

**Rules:**
- New component goes in `_components/` if feature-local, `components/ui/` if shared across 2+ features.
- Preserve the SC/CC boundary — do **not** add `"use client"` to the child unless it truly needs it.
- Type all props explicitly; never rely on implicit `any` from destructuring.

## 2. Fix Server / Client Component Boundaries

The most common mistake: `"use client"` where it isn't needed, or missing where it is.

**Decision tree:**
```
Does the component use:
  useState / useEffect / useRef / useReducer?      → needs "use client"
  onClick / onChange / any DOM event handler?       → needs "use client"
  window / document / localStorage / navigator?    → needs "use client"
  useActionState / useFormStatus / useOptimistic?   → needs "use client"
  None of the above?                                → remove "use client"
```

**Lift data fetching to the server — anti-pattern to fix:**
```typescript
// BEFORE (anti-pattern): fetch inside client component
"use client";
export function ItemList() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch("/api/items").then(r => r.json()).then(setItems); }, []);
  return items.map(i => <ItemCard key={i.id} item={i} />);
}

// AFTER: server fetches, passes as props
// page.tsx (Server Component)
export default async function Page() {
  const items = await db.getItems();
  return <ItemList items={items} />;
}
// _components/ItemList.tsx (Server Component — no hooks needed)
export function ItemList({ items }: { items: Item[] }) {
  return items.map(i => <ItemCard key={i.id} item={i} />);
}
```

## 3. Tighten TypeScript Types

**Replace `any` with `unknown` + narrowing:**
```typescript
// Before
function parseResponse(data: any) {
  return data.tasks.map((t: any) => t.title);
}

// After
function parseResponse(data: unknown): string[] {
  if (
    typeof data !== "object" || data === null ||
    !("tasks" in data) ||
    !Array.isArray((data as { tasks: unknown }).tasks)
  ) {
    throw new Error("Unexpected response shape");
  }
  return (data as { tasks: { title: unknown }[] }).tasks.map(t =>
    typeof t.title === "string" ? t.title : ""
  );
}
```

**Extract repeated literal unions into a shared type:**
```typescript
// Before: scattered
function badge(type: "FE" | "BE") {}
function icon(type: "FE" | "BE") {}

// After: single source of truth in app/types.ts
export type TaskType = "FE" | "BE";
```

**Use `as const` for sets of magic strings:**
```typescript
const VALID_TYPES = ["FE", "BE"] as const;
type TaskType = typeof VALID_TYPES[number]; // "FE" | "BE"
```

## 4. Deduplicate Tailwind Classes

**Extract repeated class strings into a named variable:**
```tsx
// Before
<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">A</div>
<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">B</div>

// After
const cardClass = "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm";
<div className={cardClass}>A</div>
<div className={cardClass}>B</div>
```

**Compose variants with array + join — no external library needed:**
```tsx
const badgeClass = (type: TaskType) =>
  [
    "rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
    type === "FE" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700",
  ].join(" ");
```

## 5. Extract Helpers from Server Actions

Large `actions.ts` files should extract pure logic into named helpers:

```typescript
// Before: 80+ lines of mixed parsing, sanitizing, AI calls, mapping...
export async function estimateTasksAction(_prev, formData) { ... }

// After: action orchestrates; helpers do the work
export async function estimateTasksAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const stories = extractStories(formData);
  if (!stories.length) return { status: "error", message: "Enter at least one story." };
  const members = extractMembers(formData);
  if (!members.length) return { status: "error", message: "Add at least one member." };
  try {
    const tasks = await runEstimation(stories, members);
    return buildSuccessState(tasks);
  } catch (err) {
    console.error("estimateTasksAction:", err);
    return { status: "error", message: "Estimation failed." };
  }
}
```

**Rules for extracted helpers:**
- Pure functions preferred (same input → same output, no side effects).
- Co-locate at the bottom of the same file unless shared across 2+ actions.
- Name descriptively: `sanitizeText`, `buildPrompt`, `validateTasks`.

## 6. Simplify Conditional Rendering

```tsx
// Before: imperative variable assignment
let content;
if (state.status === "error") content = <p>{state.message}</p>;
else if (state.status === "success") content = <Results result={state.result} />;

// After: declarative inline
{state.status === "error" && <p role="alert">{state.message}</p>}
{state.status === "success" && <Results result={state.result} />}
```

## 7. Refactoring Checklist

Before committing any refactor:
- [ ] No behaviour change — identical runtime output for identical inputs
- [ ] TypeScript error count unchanged or reduced (never increased)
- [ ] SC/CC boundaries unchanged or corrected (never worsened)
- [ ] No new `any` introduced
- [ ] Extracted pieces are in the right location (co-located vs. shared)
- [ ] All Tailwind classes come from core utilities or existing `@theme` tokens
- [ ] `npm run lint` passes with zero new errors
