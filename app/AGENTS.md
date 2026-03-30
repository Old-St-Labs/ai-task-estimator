# App Layer - Presentation Context

This directory is the **Next.js App Router presentation layer**. It consumes domain types
and calls Server Actions. It does not import from `src/domain` or `src/application`
directly - only through re-exports in `app/types.ts`.

## Server vs Client Components

Default is **Server Component**. Add `"use client"` only when the component uses:
- React hooks (`useState`, `useEffect`, `useActionState`, etc.)
- Browser APIs or event handlers on interactive elements

See [react-server-components instructions](../.github/instructions/react-server-components.instructions.md).

## File Conventions

| Path | Purpose |
|------|------|
| `app/page.tsx` | Home page - Server Component |
| `app/layout.tsx` | Root layout |
| `app/globals.css` | Tailwind v4 - all design tokens under `@theme` |
| `app/actions.ts` | Server Actions only |
| `app/types.ts` | Re-exports domain types + defines `ActionState` |
| `app/_components/` | Feature-level components |
| `app/_components/ui/` | Shared primitives (Button, Badge, Spinner, Card) |

## Key Rules

- No `tailwind.config.js` - config lives in `app/globals.css` under `@theme`
- No `style={{}}` - Tailwind utility classes only
- 300-line file limit - split into `_components/` proactively
- Server Actions must return `ActionState` and never throw
- Never use `any` - use `unknown` and narrow

## Established Tailwind Patterns

| Pattern | Classes |
|---------|--------|
| Card | `rounded-xl border border-zinc-200 bg-white p-4 shadow-sm` |
| Error banner | `rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700` |
| Info banner | `rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700` |
| Tag | `rounded-full bg-zinc-100 px-3 py-1 text-sm` |
| Primary button | `rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700` |

See [code-quality instructions](../.github/instructions/code-quality.instructions.md) for the full pattern library.
