---
name: add-api-endpoints
description: Design and implement REST API endpoints in a NestJS controller. Use this when adding new routes, reviewing existing routes, or designing the API surface for a new domain. Enforces industry-standard REST conventions and the specific patterns used in this codebase.
---

# Adding API Endpoints

Canonical reference: `apps/task-estimator/task-estimator-api-service/src/app/app.controller.ts`

---

## Prerequisites

This skill must be run **after** `/initial-setup`. The workspace must already be scaffolded as an Nx monorepo before adding any API endpoints.

---

## Two-Phase Workflow — Read This First

This skill only completes **Phase 1**. The controller it produces is intentionally temporary.

| Phase | Skill | What it does |
|---|---|---|
| **0** | `initial-setup` | Scaffold the Nx monorepo workspace — must run first |
| **1** | `add-api-endpoints` *(this skill)* | Scaffold a skeleton controller with stub route methods. No handlers are injected. |
| **2** | `add-task-commands` or `add-task-queries` | Create the handler file **and** wire it into the controller. |

> **Do not inject handlers or call `.execute()` inside this skill.** Leave every route method as a stub. The wiring happens in Phase 2.

---

## Directory & File Structure

All task-related code lives under `src/app/Task/`. For file naming conventions and class structure:

- **GET queries endpoints** → see `add-task-queries` skill
- **POST / PUT / PATCH / DELETE commands endpoints** → see `add-task-commands` skill

---

> **Swagger is mandatory.** Every controller created or modified by this skill must be fully documented using the `swagger-controller-docs` skill. Read that skill file before writing any controller. A controller without Swagger decorators is considered incomplete.

---

## Resource Naming Rules

| Rule | Correct | Wrong |
|---|---|---|
| Use plural nouns | `/tasks`, `/orders`| `/task`, `/getTasks` |
| Use kebab-case for multi-word | `/task-items`| `/taskItems`, `/task_items` |
| Lowercase only | `/tasks` | `/Tasks` |
| No verbs in resource names | `/tasks/:id/complete` | `/completeTask` |

---

## HTTP Verb Table

| Intent | Method | Example | Status Code |
|---|---|---|---|
| Create resource | `POST` | `POST /tasks` | `201 Created` |
| Read collection | `GET` | `GET /tasks` | `200 OK` |
| Read single resource | `GET` | `GET /tasks/:taskId` | `200 OK` |
| Full replace | `PUT` | `PUT /tasks/:taskId` | `200 OK` |
| Partial update | `PATCH` | `PATCH /tasks/:taskId` | `200 OK` |
| Delete | `DELETE` | `DELETE /tasks/:taskId` | `204 No Content` |
| Trigger action/state change | `POST` | `POST /tasks/:taskId/complete` | `200 OK` |

---

## Path Parameters vs Query Strings

| Use case | Where it goes | Example |
|---|---|---|
| Identity / lookup by ID | Path param | `GET /tasks/:taskId` |
| Filtering by attribute | Query param | `GET /tasks?status=active` |
| Sorting | Query param | `GET /tasks?sortBy=dateCreated` |
| Pagination page  | Query param | `GET /tasks?page=1&limit=20` |
| Search text | Query param | `GET /tasks?q=keyboard` |

**Never put filter values in the path.** `/tasks/active` is wrong. `/tasks?status=active` is correct.

Exception: structural sub-resource access backed by a dedicated GSI is acceptable: `/tasks/by-status?status=active`.

---

## State-Changing Actions — Sub-Resource Pattern

State transitions and actions use `POST` with a verb sub-resource:

```typescript
// Correct
POST /tasks/:taskId/complete
POST /tasks/:taskId/reopen
POST /tasks/:taskId/estimate

// Wrong
PATCH /tasks/:taskId/status        ← use PATCH only for field updates, not state transitions
GET  /tasks/:taskId/complete       ← actions are never GET
PUT  /tasks/:taskId                ← do not use PUT for partial state change
```

Field-level updates use `PATCH`:
```typescript
PATCH /tasks/:taskId               ← update task fields
```

---

## Response Status Codes

| Scenario | Code | NestJS decorator |
|---|---|---|
| Resource created | `201 Created` | `@HttpCode(HttpStatus.CREATED)` |
| Success with body | `200 OK` | (default) |
| Success, no body (delete) | `204 No Content` | `@HttpCode(HttpStatus.NO_CONTENT)` |
| Validation error | `400 Bad Request` | thrown by NestJS validation pipe |
| Not found | `404 Not Found` | thrown by `{Entity}NotFoundError` → `DomainExceptionFilter` |
| Conflict (duplicate, wrong state) | `409 Conflict` | thrown by domain exception → `DomainExceptionFilter` |
| Internal error | `500 Internal Server Error` | default fallback in `DomainExceptionFilter` |

---

## Versioning

- Prefix all publicly exposed or cross-client routes with `/v1/`: e.g. `@Controller('v1/tasks')`
- Internal service-to-service APIs within the monorepo may omit versioning.
- Every controller **must** include `@ApiTags('task')` immediately above `@Controller(...)`. Import from `@nestjs/swagger`.

```typescript
import { ApiTags } from '@nestjs/swagger';

@ApiTags('task')
@Controller('v1/tasks')
export class TaskController { ... }
```

---

## NestJS Static Route Ordering — Critical

NestJS matches routes in declaration order. Static paths must be declared **before** dynamic `/:param` routes, or they will be captured by the dynamic handler first.

```typescript
@Controller('tasks')
export class TaskController {

  // ── STATIC PATHS — declare first ──────────────────────────────────────────
  @Get('by-status')
  listTasksByStatus(@Query(...) query) { ... }

  @Get('by-title')                                 // GET /tasks?title=
  getTaskByTitle(@Query(...) query) { ... }

  // ── DYNAMIC /:taskId PATHS — declare after all static paths ───────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTask(@Body(...) body) { ... }

  @Get(':taskId')                        // must come after all static GET routes
  getTaskById(@Param('taskId') id: string) { ... }

  @Patch(':taskId')
  updateTask(...) { ... }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(...) { ... }

  @Post(':taskId/complete')
  completeTask(@Param('taskId') id: string) { ... }
}
```

---

## Temporary Controller Output (Phase 1)

When this skill runs, every route method must be a **stub** — no handler injection, no `execute()` call:

```typescript
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateTaskEstimator, TaskEstimatorDto } from '@dto';

@ApiTags('task')
@Controller('v1/tasks')
export class TaskController {
  // No constructor — handlers are injected in Phase 2 (add-task-commands / add-task-queries)

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateTaskEstimator })
  createTask(@Body() body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
    // TODO: wire CreateTaskHandler — run add-task-commands skill
    return Promise.resolve({} as TaskEstimatorDto);
  }

  @Get(':taskId')
  getTaskById(@Param('taskId') taskId: string): Promise<TaskEstimatorDto> {
    // TODO: wire GetTaskByIdHandler — run add-task-queries skill
    return Promise.resolve({} as TaskEstimatorDto);
  }

  // ... remaining stubs follow the same pattern
}
```

> After Phase 1 the controller compiles but every route returns an empty stub. Run `add-task-commands` or `add-task-queries` next to replace stubs with real wiring.

---

## Parameter Decorators

Use standard NestJS parameter decorators. No custom validation pipe is applied at the decorator level.

```typescript
// Body
@Post()
createTask(@Body() body: CreateTaskInput) {}

// Query params
@Get('by-status')
listByStatus(@Query('status') status: string, @Query('cursor') cursor?: string) {}

// Path params
@Get(':taskId')
getTaskById(@Param('taskId') taskId: string) {}

// Multiple query params — destructure from the full query object
@Get()
listTasks(@Query() query: ListTasksQuery) {}
```

---

## DTO Boundary Rule

Controllers must **never** return or receive domain entities. Only DTOs from `libs/dto/src/lib/task-estimator/` cross the presentation boundary.

Available DTOs:

| Import | Use for |
|---|---|
| `CreateTaskEstimator` from `create.task-estimator.dto.ts` | `POST` body — omits `taskEstimatorId` and `status` |
| `TaskEstimatorDto` from `task-estimator.dto.ts` | `PATCH` body, `GET` response |
| `StateStatus` from `task-estimator.enum.ts` | Enum values: `FAILED`, `COMPLETED`, `IN_PROGRESS` |

Import using the `@dto` path alias — **never use relative `../../` paths for DTOs**:
```typescript
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';
```

> The `@dto` alias maps to `libs/dto/src/index.ts` via `tsconfig.base.json`. All DTO symbols are re-exported from that barrel file.

---

## Task Service Route Reference

The complete task service route table as a reference for new services:

| Method | Path | Description | Status |
|---|---|---|---|
| `POST` | `/tasks` | Create task | 201 |
| `GET` | `/tasks?title=` | Lookup by title | 200 |
| `GET` | `/tasks/:taskId` | Get single task | 200 |
| `PATCH` | `/tasks/:taskId` | Update task fields | 200 |
| `DELETE` | `/tasks/:taskId` | Delete | 204 |
| `POST` | `/tasks/:taskId/complete` | Complete | 200 |
| `POST` | `/tasks/:taskId/reopen` | Reopen | 200 |
| `POST` | `/tasks/:taskId/estimate` | Request AI estimate | 200 |

---

## Swagger Annotation Obligation

Every endpoint added or modified by this skill **must** be annotated before the task is considered complete. Use the `swagger-controller-docs` skill for the full rules. Minimum per method:

| What you added | Required Swagger decorator(s) |
|---|---|
| Any route method | `@ApiOperation({ summary })` + success response decorator + `@ApiInternalServerErrorResponse` |
| `@Body()` parameter | `@ApiBody({ type: CreateTaskEstimator })` — use the DTO class directly, never inline `schema: { type: 'object' as const, ... }` |
| `@Query()` enum param (status, role) | `@ApiQuery({ name, required: true, enum: [...], description })` |
| `@Query()` pagination param | `@ApiQuery({ name, required: false, ... })` |
| `@Param()` path segment | `@ApiParam({ name, description, example })` |
| Entity lookup by ID | `@ApiNotFoundResponse` |
| Body or required query | `@ApiBadRequestResponse` |
| State transition / uniqueness | `@ApiConflictResponse` |
