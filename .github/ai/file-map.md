# File Map — AI Task Estimator

Quick reference: feature area → file path. Update this when adding new files.

## Core App Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home page — renders `<EstimatorForm />` |
| `app/layout.tsx` | Root layout — sets `<html>`, `<body>`, metadata |
| `app/globals.css` | Tailwind v4 config (`@import`, `@theme` tokens) |
| `app/actions.ts` | `estimateTasksAction` — Server Action for estimation |
| `app/types.ts` | Shared types: `Task`, `ActionState`, `EstimationResult` |

## Components (`app/_components/`)

| File | Type | Purpose |
|------|------|---------|
| `EstimatorForm.tsx` | Client | Main form — `useActionState`, user stories textarea, team members |
| `TeamMembersInput.tsx` | Client | Tag-input for adding/removing team member names |
| `TaskBreakdownView.tsx` | Server | Renders estimation results grouped by user story |
| `TaskCard.tsx` | Server | Single task card showing title, type badge, hours, assignee |

## Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript strict config |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` |
| `eslint.config.mjs` | ESLint with `eslint-config-next` |
| `.env.local.example` | Env var template (`AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`) |

## AI Context

| File | Purpose |
|------|---------|
| `.github/ai/PROJECT_CONTEXT.md` | Domain model, business rules, planned routes |
| `.github/ai/file-map.md` | **This file** — navigation index |

## Skills (lazy-load when relevant)

| Skill | Path | When to Load |
|-------|------|-------------|
| Next.js 16 | `.github/skills/nextjs16/SKILL.md` | Routes, layouts, RSC, data fetching |
| React 19 | `.github/skills/react19/SKILL.md` | `useActionState`, `useFormStatus`, `useOptimistic` |
| Tailwind v4 | `.github/skills/tailwind-v4/SKILL.md` | Styling, `@theme` tokens, custom utilities |
| AI Integration | `.github/skills/ai-integration/SKILL.md` | Prompt building, API calls, response validation |
| Refactoring | `.github/skills/refactoring/SKILL.md` | Component extraction, type tightening, deduplication |
| AI Setup | `.github/skills/ai-setup/SKILL.md` | Writing agents, skills, instructions; PROSE compliance |

## Agents

| Agent | Path | Scope |
|-------|------|-------|
| Orchestrator | `.github/agents/orchestrator.md` | Planning & routing (read-only) |
| Dev | `.github/agents/dev.md` | Full-stack general tasks |
| Frontend | `.github/agents/frontend.md` | UI components, pages, CSS |
| Backend | `.github/agents/backend.md` | Server Actions, types, AI integration |
| Refactor | `.github/agents/refactor.md` | Structural improvements, zero behaviour change |
| AI Setup | `.github/agents/ai-setup.md` | Create/improve agents, skills, instructions (.github/ only) |

## Planned Routes (not yet built)

| Route | Page | Purpose |
|-------|------|---------|
| `/estimates` | Estimate List | Browse past estimates |
| `/estimates/new` | New Estimate | Create from scratch |
| `/estimates/[id]` | Estimate Detail | Single estimate with full breakdown |

When building a planned route, create:
```
app/<route-segment>/
  page.tsx            ← Server Component
  _components/        ← Feature-local components
  actions.ts          ← Server Actions (if any mutations)
  types.ts            ← Feature-local types (if needed)
```
