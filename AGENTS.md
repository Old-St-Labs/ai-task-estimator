<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AI-Native Setup — AI Task Estimator

This project follows [PROSE](https://danielmeppiel.github.io/awesome-ai-native/docs/prose/) — an architectural style for reliable AI-native development.

## Quick Start

- **Planning a feature?** → use `@orchestrator`
- **Building UI?** → use `@frontend`
- **Writing Server Actions / AI integration?** → use `@backend`
- **General coding?** → use `@dev`
- **New feature end-to-end?** → use prompt `.github/prompts/new-feature.prompt.md`
- **Improving existing code structure?** → use `@refactor`
- **Creating/improving agents, skills, or AI setup?** → use `@ai-setup`
- **Writing or fixing e2e tests?** → use `@e2e`

## Structure

```
.github/
├── copilot-instructions.md          ← Global rules (auto-loaded, kept short)
├── agents/
│   ├── orchestrator.md              ← Plans & routes; never writes code
│   ├── dev.md                       ← General full-stack tasks
│   ├── frontend.md                  ← UI, components, Tailwind
│   ├── backend.md                   ← Server Actions, AI, types
│   ├── refactor.md                  ← Structural improvements, no behaviour change
│   ├── ai-setup.md                  ← Create/improve agents, skills, and PROSE setup
│   ├── e2e.md                       ← E2e tests, Page Object Model, CI
│   └── playwright.md                ← DEPRECATED — use e2e.md
├── instructions/
│   ├── typescript-strict.instructions.md       ← applyTo: **/*.{ts,tsx}
│   ├── server-actions.instructions.md          ← applyTo: app/**/actions.ts
│   └── react-server-components.instructions.md ← applyTo: app/**/*.tsx
├── prompts/
│   └── new-feature.prompt.md        ← End-to-end feature workflow
├── skills/
│   ├── nextjs16/SKILL.md            ← App Router, RSC, data fetching
│   ├── react19/SKILL.md             ← useActionState, useFormStatus, use()
│   ├── tailwind-v4/SKILL.md         ← @theme, CSS-first config
│   ├── ai-integration/SKILL.md      ← Prompts, sanitization, API, mock engine
│   ├── refactoring/SKILL.md         ← Extract, type-tighten, dedup, boundary fixes
│   ├── ai-setup/SKILL.md            ← Writing agents, skills, instructions, PROSE compliance
│   └── playwright/SKILL.md          ← E2e config, POM, locators, test flows
└── ai/
    ├── PROJECT_CONTEXT.md           ← Domain model & business rules
    └── file-map.md                  ← File navigation index
```

## PROSE Compliance

| Constraint | How it's implemented |
|-----------|---------------------|
| Progressive Disclosure | Skills lazy-loaded by reference; agents load only what's relevant |
| Reduced Scope | Specialist agents (frontend/backend) scope work to one domain |
| Orchestrated Composition | Small primitives (instructions + skills + agents) compose |
| Safety Boundaries | Orchestrator has no `editFiles`; agents have explicit `applyTo` |
| Explicit Hierarchy | Global copilot-instructions → domain skills → scoped instructions |

