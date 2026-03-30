# Project Memory - AI Task Estimator

Institutional knowledge accumulated through development.
Read this before making architectural decisions to avoid rediscovering known solutions.

---

## Architecture Decisions

### 1. OpenAI-Compatible AI Layer via Port Pattern
**Decision**: `IEstimator` port in `src/domain/estimator.port.ts`; `createEstimator()` factory
in `src/infrastructure/estimator-factory.ts`.
**Rationale**: Decouples AI provider from business logic. Switching providers requires only env
var changes - zero code change.
**Current provider**: Groq (`llama-3.3-70b-versatile`) at `https://api.groq.com/openai/v1`

### 2. TeamMember Roles as Discriminated Union
**Decision**: `TeamMemberRole = "FE" | "BE" | "Fullstack"` mapped to `TaskType` for role-filtered
assignment.
**Rationale**: Enables the estimator to assign FE tasks only to FE/Fullstack developers, BE
tasks to BE/Fullstack developers.
**Files**: `src/domain/task.ts`, `src/infrastructure/estimator-factory.ts` (pickMember role
filter), `app/_components/TeamMembersInput.tsx` (role badges).

### 3. Server Actions Never Throw
**Decision**: `estimateTasksAction` in `app/actions.ts` always returns `ActionState` - never throws.
**Rationale**: React 19 `useActionState` cannot catch thrown errors from Server Actions;
all errors must be returned as data.

---

## Known Gotchas

### Next.js 16 Breaking Changes
- `params` and `searchParams` in layouts/pages are **Promises** - must `await`:
  `const { id } = await params`
- `cookies()` and `headers()` are **async**: `const cookieStore = await cookies()`
- `fetch()` is **not** cached by default - no automatic deduplication
- Full list: `.github/skills/nextjs16/SKILL.md`

### TypeScript Role Narrowing Pitfall
**Problem**: Conditional expression `condition ? "FE" : "BE"` widens to `string`,
breaking `TeamMember["role"]`.
**Fix**: Use `VALID_ROLES = new Set(["FE", "BE", "Fullstack"] as const)` guard,
then `as TeamMember["role"]` cast.
**Location**: `app/actions.ts`

### Tailwind v4 Has No Config File
**Problem**: `tailwind.config.js` does not exist and must not be created.
**Fix**: All theme tokens live under `@theme` in `app/globals.css`.

---

## Successful Patterns

### AI-Adjusted Estimates (task-category calibration)
Prompt instructs the AI to reduce estimates by category:
- Boilerplate / CRUD / standard UI -> 40-60% reduction
- Logic-heavy / architecture / integration -> 20-30% reduction
- Novel / external APIs / uncertain -> minimal reduction
- Max cap per task: **16h**

Location: system prompt in `src/infrastructure/estimator-factory.ts`

### Role-Based Mock Assignment
`MockEstimator.pickMember(taskType)` filters eligible members by role before selecting
the one with fewest assigned hours. FE tasks -> FE or Fullstack; BE tasks -> BE or
Fullstack; DevOps/QA -> Fullstack only.

---

## What Was Tried and Abandoned

### `dev.md` Generic Developer Agent
Made redundant when orchestrator gained `editFiles` + `runCommands` and direct-implementation
mode. **Deleted.**

### `playwright.md` Agent Name
Named after a tool, not a role. **Renamed to `e2e.md`.**
