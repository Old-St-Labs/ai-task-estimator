# AI Task Estimator — Task List

> Derived from `product-requirements.md`. Each phase maps to a skill that will be created.

---

## Phase 1: Database Schema

| #   | Task                                                                                                                                       | Skill            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1   | Define `projects` table (id, name, description, createdAt)                                                                                 | `drizzle-schema` |
| 2   | Define `developers` table (id, projectId, name, role, skills[], capacityHours)                                                             | `drizzle-schema` |
| 3   | Define `user_stories` table (id, projectId, title, description, acceptanceCriteria, priority)                                              | `drizzle-schema` |
| 4   | Define `generated_tasks` table (id, userStoryId, projectId, title, description, estimatedHours, assignedDeveloperId, sprintNumber, status) | `drizzle-schema` |
| 5   | Define `sprints` table (id, projectId, sprintNumber, startDate, endDate)                                                                   | `drizzle-schema` |

---

## Phase 2: CRUD API Endpoints

| #   | Task                                                                                      | Skill                    |
| --- | ----------------------------------------------------------------------------------------- | ------------------------ |
| 6   | Projects CRUD — `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/[id]`             | `create-api-endpoint` ✅ |
| 7   | Developers CRUD — `GET/POST /api/developers`, `GET/PUT/DELETE /api/developers/[id]`       | `create-api-endpoint` ✅ |
| 8   | User Stories CRUD — `GET/POST /api/user-stories`, `GET/PUT/DELETE /api/user-stories/[id]` | `create-api-endpoint` ✅ |
| 9   | Generated Tasks CRUD — `GET/POST /api/tasks`, `PATCH /api/tasks/[id]` (manual override)   | `create-api-endpoint` ✅ |

---

## Phase 3: AI Integration

| #   | Task                                                                                                                         | Skill            |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 10  | Build Gemini prompt for requirement gap analysis (identify missing implicit requirements)                                    | `ai-integration` |
| 11  | Build Gemini prompt for task breakdown + smart assignment + time estimation (single combined call returning structured JSON) | `ai-integration` |
| 12  | Create `POST /api/projects/[id]/analyze` route — sends stories + developers to Gemini, persists generated tasks              | `ai-integration` |
| 13  | Zod schema for validating and parsing Gemini's JSON response                                                                 | `ai-integration` |

---

## Phase 4: Sprint Planning Engine

| #   | Task                                                                                                  | Skill             |
| --- | ----------------------------------------------------------------------------------------------------- | ----------------- |
| 14  | Capacity-packing algorithm — assign tasks to 2-week sprints respecting 70–80 hr/dev limit             | `sprint-planning` |
| 15  | Dependency ordering — group backend/infra tasks before frontend tasks within sprints                  | `sprint-planning` |
| 16  | Create `POST /api/projects/[id]/plan-sprints` route — runs the algorithm, persists sprint assignments | `sprint-planning` |

---

## Phase 5: Frontend UI

| #   | Task                                                                                        | Skill      |
| --- | ------------------------------------------------------------------------------------------- | ---------- |
| 17  | Project setup page — create project, add developers with skills & capacity                  | `ui-pages` |
| 18  | User stories input page — add/edit/delete stories per project                               | `ui-pages` |
| 19  | Review page — display AI-generated tasks with assignments & estimates, support manual edits | `ui-pages` |
| 20  | Sprint board view — visualize sprints as columns with dev workload per sprint               | `ui-pages` |

---

## Skills Summary

| Skill                 | Covers tasks | Status            |
| --------------------- | ------------ | ----------------- |
| `drizzle-schema`      | #1–5         | ❌ To create      |
| `create-api-endpoint` | #6–9         | ✅ Already exists |
| `ai-integration`      | #10–13       | ❌ To create      |
| `sprint-planning`     | #14–16       | ❌ To create      |
| `ui-pages`            | #17–20       | ❌ To create      |
