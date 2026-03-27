# AI Task Estimator — Copilot Instructions

## Project Overview
An AI-powered task estimation tool. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.

> **CRITICAL:** This is Next.js 16 — it has breaking changes from v14/v15. Always read `node_modules/next/dist/docs/` before writing Next.js-specific code. Deprecation notices must be heeded.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Runtime | Node.js |

## Key Conventions

### Next.js 16 App Router
- All files under `app/` use the App Router; no `pages/` directory.
- Components are **React Server Components by default** — add `"use client"` only when needed (event handlers, browser APIs, React hooks).
- Use `"use server"` for Server Actions inside forms and mutations.
- Layouts: `app/layout.tsx` (root), nested layouts via `app/<segment>/layout.tsx`.
- Metadata: export `metadata` or `generateMetadata()` from `page.tsx` / `layout.tsx`.

### React 19
- Use the `use()` hook to unwrap Promises and Context in Server Components.
- Prefer `useOptimistic` for optimistic UI updates.
- Use `useFormStatus` for form pending state — must be in a child of a `<form>`.
- Server Actions: defined with `"use server"`, passed to form `action` prop or called directly.

### Tailwind CSS v4
- **No `tailwind.config.js`** — configuration is CSS-first via `app/globals.css`.
- Import Tailwind with `@import "tailwindcss"` in the CSS file.
- Custom theme tokens defined with `@theme { --color-brand: ... }` inside CSS.
- PostCSS plugin is `@tailwindcss/postcss` (already in `postcss.config.mjs`).

### TypeScript
- Strict mode on. Never use `any` — use `unknown` and narrow.
- Prefer `type` over `interface` for object shapes; use `interface` for extensible contracts.
- Co-locate types in the same file unless shared across 3+ files.

### File & Folder Naming
- Route segments: `kebab-case` folder names (e.g. `app/task-list/page.tsx`).
- Components: `PascalCase` (e.g. `TaskCard.tsx`).
- Utilities / hooks: `camelCase` (e.g. `useEstimate.ts`, `formatDuration.ts`).
- Server Actions: prefix with verb, suffix with `Action` (e.g. `createEstimateAction.ts`).

## Deeper Guides
- Project context & domain rules → `.github/ai/PROJECT_CONTEXT.md`
- Dev agent with implementation patterns → `.github/agents/dev.md`
