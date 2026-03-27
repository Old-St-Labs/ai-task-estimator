---
applyTo: "**/*.{ts,tsx}"
description: Code quality rules for all TS/TSX files — 300-line max, no inline styles, reuse existing components and patterns.
---

# Code Quality Rules

## File Size — 300 Line Maximum

No file may exceed 300 lines. Check with `wc -l <file>` before finishing a task.

Split strategies:
- Extract sub-components into `_components/` (UI files)
- Extract helpers into a co-located `utils.ts`
- Extract types into `types.ts`
- Move domain/business logic to `src/application/` or `src/infrastructure/`

Never split arbitrarily — keep cohesive units together.

## No Inline Styles

**Never use `style={{...}}`** anywhere in TSX. Use Tailwind utility classes only.

```tsx
// Forbidden
<div style={{ color: 'red', marginTop: 8 }}>...</div>

// Correct
<div className="text-red-600 mt-2">...</div>
```

If a design token is missing, add it to `app/globals.css` under `@theme`.

## Reuse Before Creating

Before writing a new component:
1. Check `app/_components/ui/` — primitive shared components
2. Check `app/_components/` — feature-level shared components

New shared primitives (Button, Badge, Spinner, Card) go in `app/_components/ui/`.

## Use Established Patterns

| Pattern | Tailwind classes |
|---------|------------------|
| Card | `rounded-xl border border-zinc-200 bg-white p-4 shadow-sm` |
| Error banner | `rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700` |
| Info banner | `rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700` |
| Warning banner | `rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700` |
| Tag/badge | `rounded-full bg-zinc-100 px-3 py-1 text-sm` |
| Primary button | `rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700` |

Do not invent new patterns when an established one exists.
