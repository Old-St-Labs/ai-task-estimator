# AI Task Estimator — Task List

> Derived from `product-requirements.md`. Each phase maps to a skill that will be created.

---

## Phase 1: Database Schema

| #   | Task                                                                                                                                    | Skill                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Define `projects` table (id, name, description, createdAt)                                                                              | `add-drizzle-schema` ✅ |
| 2   | Define `developers` table (id, projectId, name, role, skills[], capacityHours)                                                          | `add-drizzle-schema` ✅ |
| 3   | Define `user_stories` table (id, projectId, title, description, acceptanceCriteria, priority)                                           | `add-drizzle-schema` ✅ |
| 4   | Define `tasks` table (id, userStoryId, sprintId, developerId, title, description, estimatedHours, layer, status)                        | `add-drizzle-schema` ✅ |
| 5   | Define `sprints` table (id, projectId, sprintNumber, startDate, endDate)                                                                | `add-drizzle-schema` ✅ |

---

## Phase 2: CRUD API Endpoints

| #   | Task                                                                                      | Skill                                              |
| --- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 6   | Projects CRUD — `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/[id]`           | `create-api-endpoint` ✅                           |
| 7   | Developers CRUD — `GET/POST /api/developers`, `GET/PATCH/DELETE /api/developers/[id]`     | `create-api-endpoint` + `developer-roster` ✅      |
| 8   | User Stories CRUD — `GET/POST /api/user-stories`, `GET/PATCH/DELETE /api/user-stories/[id]` | `create-api-endpoint` + `user-story-management` ✅ |
| 9   | Tasks CRUD — `GET/POST /api/tasks`, `PATCH /api/tasks/[id]` (manual override)             | `create-api-endpoint` + `manual-task-override` ✅  |

---

## Phase 3: AI Integration

| #   | Task                                                                                                                         | Skill                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 10  | Build Gemini prompt for requirement gap analysis (identify missing implicit requirements)                                    | `llm-integration` + `ai-task-analysis` ✅ |
| 11  | Build Gemini prompt for task breakdown + smart assignment + time estimation (single combined call returning structured JSON) | `llm-integration` + `ai-task-analysis` ✅ |
| 12  | Create `POST /api/projects/[id]/analyze` route — sends stories + developers to Gemini, persists generated tasks              | `ai-task-analysis` ✅                    |
| 13  | Zod schema for validating and parsing Gemini's JSON response                                                                 | `llm-integration` ✅                     |

---

## Phase 4: Sprint Planning Engine

| #   | Task                                                                                                 | Skill              |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| 14  | Capacity-packing algorithm — assign tasks to 2-week sprints respecting 70–80 hr/dev limit            | `sprint-planning` ✅ |
| 15  | Dependency ordering — group backend/infra tasks before frontend tasks within sprints                 | `sprint-planning` ✅ |
| 16  | Create `POST /api/projects/[id]/sprints` route — runs the algorithm, persists sprint assignments     | `sprint-planning` ✅ |

---

## Phase 5: Frontend UI

| #   | Task                                                                                        | Skill                                                      |
| --- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 17  | Project setup page — create project, add developers with skills & capacity                  | `create-page` + `create-form` + `developer-roster` ✅     |
| 18  | User stories input page — add/edit/delete stories per project                               | `create-page` + `create-form` + `user-story-management` ✅ |
| 19  | Review page — display AI-generated tasks with assignments & estimates, support manual edits | `create-page` + `manual-task-override` + `create-ui-component` ✅ |
| 20  | Sprint board view — visualize sprints as columns with dev workload per sprint               | `create-page` + `sprint-board` ✅                         |

---

## Skills Summary

| Skill                    | Covers tasks | Status            |
| ------------------------ | ------------ | ----------------- |
| `add-drizzle-schema`     | #1–5         | ✅ Exists         |
| `create-api-endpoint`    | #6–9         | ✅ Exists         |
| `developer-roster`       | #7, #17      | ✅ Exists         |
| `user-story-management`  | #8, #18      | ✅ Exists         |
| `manual-task-override`   | #9, #19      | ✅ Exists         |
| `llm-integration`        | #10–11, #13  | ✅ Exists         |
| `ai-task-analysis`       | #10–12       | ✅ Exists         |
| `sprint-planning`        | #14–16       | ✅ Exists         |
| `create-page`            | #17–20       | ✅ Exists         |
| `create-form`            | #17–18       | ✅ Exists         |
| `create-ui-component`    | #19          | ✅ Exists         |
| `sprint-board`           | #20          | ✅ Exists         |
| `crud-resource`          | #6–9         | ✅ Exists         |
