---
mode: agent
description: End-to-end workflow for implementing a new feature in AI Task Estimator. Guides from planning through backend implementation, frontend build, and validation.
tools: ["codebase", "editFiles", "problems", "search", "usages"]
---

# New Feature Workflow

## Phase 0 — Requirements

Before loading any context or writing any code, confirm the spec is complete.

Load the [requirements skill](.github/skills/requirements/SKILL.md) and apply the **Definition of Ready checklist**:

- [ ] What the user sees/does is described concretely
- [ ] At least 2 acceptance criteria written as testable Given/When/Then statements
- [ ] Loading and error states addressed (even if "N/A")
- [ ] Data requirements clear — read-only vs. write, persistent vs. ephemeral
- [ ] Out-of-scope items listed

If any item is unchecked: **ask the user, don't assume**. Use the question banks in the skill to elicit only what is missing.

🚨 **STOP — do not proceed to Phase 1 until the spec is confirmed by the user.**

---

## Context Loading Phase

Before writing any code:
1. Review [PROJECT_CONTEXT.md](.github/ai/PROJECT_CONTEXT.md) — domain model and business rules
2. Review [file-map.md](.github/ai/file-map.md) — existing files and structure
3. Load relevant skills (only what applies):
   - UI changes → [react19](.github/skills/react19/SKILL.md) + [tailwind-v4](.github/skills/tailwind-v4/SKILL.md)
   - Routing / data → [nextjs16](.github/skills/nextjs16/SKILL.md)
   - AI / actions → [ai-integration](.github/skills/ai-integration/SKILL.md)

## Phase 1 — Plan

Search the codebase to understand what already exists:
- Find related components: `codebase` search for relevant type names or route patterns
- Check `app/types.ts` for existing types that should be reused or extended
- Check `app/actions.ts` for existing actions

Produce a scoped plan:
```
### Types needed
- [ ] Add/modify in `app/types.ts`: ...

### Server Actions needed
- [ ] Add to `app/actions.ts`: ...

### Components needed
- [ ] Create `app/_components/...`: ...
- [ ] Modify `app/page.tsx`: ...
```

🚨 **STOP — present plan and get approval before proceeding.**

## Phase 2 — Backend (types + actions)

1. Update `app/types.ts` — add any new types
2. Update or create `app/actions.ts`:
   - [x] `"use server"` at top
   - [x] All inputs sanitized
   - [x] Returns `ActionState`
   - [x] Errors caught, never thrown
   - [x] Secrets never logged

## Phase 3 — Frontend (components + wiring)

1. Create/update components in `app/_components/`
2. Wire to action via `useActionState` in the form component
3. Apply Tailwind using existing project patterns (indigo + zinc scale)
4. Ensure correct SC/CC boundary

Component checklist:
- [ ] `"use client"` only where hooks/events are needed
- [ ] All props typed (no `any`)
- [ ] Accessible (labels, `aria-label`, `role="alert"` for errors)
- [ ] Loading state shown while `isPending`

## Phase 4 — Validate

- [ ] Run `npm run lint` — zero errors
- [ ] Check TypeScript: no `any`, all types resolve
- [ ] Test both demo mode (no `AI_API_KEY`) and live mode
- [ ] Verify error states display correctly
- [ ] Confirm `app/globals.css` is the only Tailwind configuration (no `tailwind.config.js` created)

## Phase 5 — Update Index

- [ ] Update [file-map.md](.github/ai/file-map.md) with any new files created
