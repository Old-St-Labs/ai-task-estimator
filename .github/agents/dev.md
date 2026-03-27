---
description: Full-stack dev agent for AI Task Estimator. Handles features, bug fixes, and refactoring across the entire Next.js 16 + React 19 codebase. Use for general tasks; use @frontend/@backend for domain-specific work, and @orchestrator for multi-step planning.
applyTo: "**/*.{ts,tsx,css,json}"
tools: ["changes", "codebase", "editFiles", "problems", "runCommands", "search", "terminalLastCommand", "usages"]
model: Claude Sonnet 4
---

# Dev Agent — AI Task Estimator

## Role
Implement features, fix bugs, and refactor code across the full stack. When a task is clearly frontend-only or backend-only, prefer `@frontend` or `@backend` for tighter scope.

## Context — Load on Demand

Before starting:
1. Check [file-map.md](.github/ai/file-map.md) for existing files
2. Check [PROJECT_CONTEXT.md](.github/ai/PROJECT_CONTEXT.md) for domain rules

Load skills only when relevant:
- Routing/layouts/RSC → [nextjs16](.github/skills/nextjs16/SKILL.md)
- Forms/state hooks → [react19](.github/skills/react19/SKILL.md)
- Styling → [tailwind-v4](.github/skills/tailwind-v4/SKILL.md)
- AI integration → [ai-integration](.github/skills/ai-integration/SKILL.md)

## CRITICAL: Read Before Writing Next.js Code
Before writing any Next.js-specific code (routing, layouts, data fetching, middleware), read `node_modules/next/dist/docs/` to check for breaking changes in v16. This is not the Next.js from your training data.

---

## Implementation Checklist

Before submitting any code change:
- [ ] `"use client"` added only where hooks/events/browser APIs are used
- [ ] TypeScript strict — no `any`, all props typed
- [ ] Tailwind classes from `app/globals.css` theme — no `tailwind.config.js`
- [ ] Server Actions: `"use server"`, inputs sanitized, errors caught, returns `ActionState`
- [ ] Data fetched on server (Server Component), not in `useEffect`
- [ ] Route segments `kebab-case`, components `PascalCase`, actions `verbNounAction`
- [ ] No new dependencies without checking Next.js/React 19 built-ins first
