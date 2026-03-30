---
name: backend-add-task-queries
description: Scaffold a new GET query handler file under src/app/Task/queries/. Use this when adding a new GET endpoint to the TaskController. Enforces the dot-notation file naming convention and handler class structure used in this codebase.
---

# Add Task Query

> **Prerequisite:** The `add-api-endpoints` skill **must be run first** to create the controller before this skill is used. Do not run this skill if the controller does not already exist.

All GET endpoint logic lives under:

```
apps/task-estimator/task-estimator-api-service/src/app/Task/queries/
```

---

## File Naming

Format: `<verb>.<noun>.<qualifier>.query.ts`

| Endpoint | File name |
|---|---|
| `GET /tasks/:taskId` | `get.task.by.id.query.ts` |
| `GET /tasks?title=` | `get.task.by.title.query.ts` |
| `GET /tasks/by-status` | `list.tasks.by.status.query.ts` |
| `GET /tasks/by-status-and-assignee` | `list.tasks.by.status.and.assignee.query.ts` |
| `GET /tasks/search?task=&estimatedHours=&status=` | `list.tasks.query.ts` |

Rules:
- Use `get.` prefix for single-resource lookups
- Use `list.` prefix for collection queries
- All lowercase, dot-separated
- Always suffix with `.query.ts`

---

## Database Layer

Every query handler uses `JsonModel` directly from `@ai-task-estimator/database-service`. Instantiate it as a private field — no injection or module required.

```typescript
private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);
```

`JsonModel` exposes these methods relevant to queries:

| Method | Signature | When to use |
|---|---|---|
| `get` | `get(key, value): Promise<Entity \| null>` | Single-resource lookup by a field |
| `getAll` | `getAll(): Promise<Entity[]>` | Fetch all records, then filter in-memory |

---

## Query Handler Class Structure

Each file exports one class decorated with `@Injectable()` and an `execute` method. Params match the route inputs (path params + query params). Instantiate `JsonModel` as a private field and call the appropriate method.

> **DTO import rule:** Always import DTOs from the `@dto` alias. Never use relative `../../` paths.
> **DB import rule:** Import `JsonModel` from `@ai-task-estimator/database-service`.

```typescript
// get.task.by.id.query.ts
import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class GetTaskByIdQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string): Promise<TaskEstimatorDto | null> {
        return this.model.get('taskEstimatorId', taskId);
    }
}
```

**Sample response** (`GET /tasks/:taskId`):
```json
{
  "taskEstimatorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "task": "Build login page",
  "estimatedHours": 8,
  "status": "IN_PROGRESS",
  "AIResponse": "Estimated 8 hours based on complexity."
}
```

---

```typescript
// get.task.by.title.query.ts
import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class GetTaskByTitleQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(title: string): Promise<TaskEstimatorDto | null> {
        return this.model.get('task', title);
    }
}
```

**Sample response** (`GET /tasks?title=Build login page`):
```json
{
  "taskEstimatorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "task": "Build login page",
  "estimatedHours": 8,
  "status": "IN_PROGRESS",
  "AIResponse": null
}
```

---

```typescript
// list.tasks.by.status.query.ts
import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class ListTasksByStatusQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    async execute(status: StateStatus): Promise<TaskEstimatorDto[]> {
        const all = await this.model.getAll();
        return all.filter(t => t.status === status);
    }
}
```

**Sample response** (`GET /tasks/by-status?status=IN_PROGRESS`):
```json
[
  {
    "taskEstimatorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "task": "Build login page",
    "estimatedHours": 8,
    "status": "IN_PROGRESS",
    "AIResponse": null
  },
  {
    "taskEstimatorId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "task": "Write unit tests",
    "estimatedHours": 4,
    "status": "IN_PROGRESS",
    "AIResponse": null
  }
]
```

---

```typescript
// list.tasks.query.ts
import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class ListTasksQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    async execute(filters: {
        task?: string;
        estimatedHours?: number;
        status?: StateStatus;
    }): Promise<TaskEstimatorDto[]> {
        const all = await this.model.getAll();
        return all.filter(t => {
            if (filters.task && !t.task.toLowerCase().includes(filters.task.toLowerCase())) return false;
            if (filters.estimatedHours !== undefined && t.estimatedHours !== filters.estimatedHours) return false;
            if (filters.status && t.status !== filters.status) return false;
            return true;
        });
    }
}
```

**Sample response** (`GET /tasks/search?task=login&status=IN_PROGRESS`):
```json
[
  {
    "taskEstimatorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "task": "Build login page",
    "estimatedHours": 8,
    "status": "IN_PROGRESS",
    "AIResponse": null
  }
]
```

> All filters are optional and combinable. `task` is matched case-insensitively as a substring. `estimatedHours` is an exact match. `status` must be a valid `StateStatus` enum value.
> The controller receives `estimatedHours` as a query string and must convert it: `estimatedHours !== undefined ? Number(estimatedHours) : undefined`.

---

## Two-Phase Workflow — Read This First

The `add-api-endpoints` skill runs **before** this skill and leaves the controller as a skeleton with stub route methods. **This skill completes Phase 2**: it creates the query handler file and then replaces the matching controller stub with real wiring.

| Phase | Skill | What it does |
|---|---|---|
| 1 | `add-api-endpoints` | Skeleton controller — stubs only, no handlers |
| **2** | `add-task-queries` *(this skill)* | Create query handler file + wire it into the controller |

---

## Controller Wiring Rule

Every query handler file **must** be connected in all three places. A handler that exists only as a file is incomplete.

| Location | What to do |
|---|---|
| `queries/<name>.query.ts` | Create class with `@Injectable()` and `execute()` |
| `app.module.ts` `providers` | Add the query handler class |
| `task.controller.ts` constructor | Inject via `private readonly` and replace the stub with `handler.execute()` |

### Registration in AppModule

```typescript
// app.module.ts
import { GetTaskByIdQuery } from './Task/queries/get.task.by.id.query';

@Module({
    providers: [
        AppService,
        GetTaskByIdQuery, // ← add new query handler here
    ],
})
export class AppModule {}
```

### Wiring in TaskController

```typescript
// task.controller.ts
import { TaskEstimatorDto } from '@dto';

constructor(
    private readonly getTaskByIdQuery: GetTaskByIdQuery, // ← inject
) {}

@Get(':taskId')
@ApiParam({ name: 'taskId', type: String })
@ApiOkResponse({ type: TaskEstimatorDto })
getTaskById(@Param('taskId') taskId: string): Promise<TaskEstimatorDto | null> {
    return this.getTaskByIdQuery.execute(taskId); // ← call execute()
}
```

---

## Steps

1. Determine the GET endpoint being added to `task.controller.ts`
2. Derive the file name using the naming rules above
3. Create the file under `src/app/Task/queries/` with `@Injectable()` on the class
4. Add `private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto)` and call the appropriate method (`get` or `getAll`)
5. Register the handler in `app.module.ts` `providers` array
6. Inject the handler into `TaskController` constructor and **replace the stub route method body** with `handler.execute()`

> Step 6 is the only step that modifies the controller. The skeleton from Phase 1 already has the correct route decorator, Swagger annotations, and parameter decorators — only the method body changes.

---

## Current Query Files

```
src/app/Task/queries/
├── get.task.by.id.query.ts
├── get.task.by.title.query.ts
├── list.tasks.by.status.query.ts
├── list.tasks.by.status.and.assignee.query.ts
└── list.tasks.query.ts
```
