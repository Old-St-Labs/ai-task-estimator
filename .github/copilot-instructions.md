# AI Task Estimator — Copilot Instructions

## Stack
Next.js 16.2.1 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind CSS v4 · Node.js

> **Next.js 16 has breaking changes.** Read `node_modules/next/dist/docs/` before writing routing, layouts, or data-fetching code.

## Critical Rules
- All `app/**/*.tsx` are Server Components by default. Add `"use client"` only for hooks/events/browser APIs.
- **No `tailwind.config.js`** — all Tailwind config lives in `app/globals.css` under `@theme`.
- Never use `any` — use `unknown` and narrow.
- Server Actions must return `ActionState` and never throw — always catch errors.
- Sanitize all user input before injecting into AI prompts.

## Naming
- Route folders: `kebab-case` | Components: `PascalCase` | Hooks: `camelCase` | Actions: `verbNounAction`

## Context (load what you need, when you need it)

| Need | Read |
|------|------|
| Domain model, business rules | [PROJECT_CONTEXT.md](.github/ai/PROJECT_CONTEXT.md) |
| File locations | [file-map.md](.github/ai/file-map.md) |
| Next.js 16 patterns | [nextjs16 skill](.github/skills/nextjs16/SKILL.md) |
| React 19 APIs | [react19 skill](.github/skills/react19/SKILL.md) |
| Tailwind v4 config | [tailwind-v4 skill](.github/skills/tailwind-v4/SKILL.md) |
| AI API integration | [ai-integration skill](.github/skills/ai-integration/SKILL.md) |
| Refactoring patterns | [refactoring skill](.github/skills/refactoring/SKILL.md) |
| AI setup patterns | [ai-setup skill](.github/skills/ai-setup/SKILL.md) |
| Token & cost optimization | [token-optimization skill](.github/skills/token-optimization/SKILL.md) |
| Playwright e2e testing | [playwright skill](.github/skills/playwright/SKILL.md) |

## Agents

| Agent | Invoke for |
|-------|-----------|
| `@orchestrator` | Planning multi-step features, architecture decisions |
| `@frontend` | UI components, pages, Tailwind styling |
| `@backend` | Server Actions, AI integration, types |
| `@dev` | General full-stack tasks |
| `@refactor` | Improve structure/types/boundaries without changing behaviour |
| `@ai-setup` | Create/improve agents, skills, instructions, and PROSE compliance |
| `@e2e` | Write and maintain Playwright e2e tests |
