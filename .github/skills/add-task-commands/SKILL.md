---
name: add-task-commands
description: Scaffold a new command handler file under src/app/Task/commands/. Use this when adding a new POST, PUT, PATCH, or DELETE endpoint to the TaskController. Enforces the dot-notation file naming convention and handler class structure used in this codebase.
---

# Add Task Command

> **Prerequisite:** The `add-api-endpoints` skill **must be run first** to create the controller before this skill is used. Do not run this skill if the controller does not already exist.

All POST / PUT / PATCH / DELETE endpoint logic lives under:

```
apps/task-estimator/task-estimator-api-service/src/app/Task/commands/
```

---

## File Naming

Format: `<verb>.<noun>.<qualifier>.handler.ts`

| Endpoint | File name |
|---|---|
| `POST /tasks` | `create.task.handler.ts` |
| `PATCH /tasks/:taskId` | `update.task.handler.ts` |
| `DELETE /tasks/:taskId` | `delete.task.handler.ts` |
| `POST /tasks/:taskId/complete` | `complete.task.handler.ts` |
| `POST /tasks/:taskId/reopen` | `reopen.task.handler.ts` |
| `POST /tasks/:taskId/estimate` | `estimate.task.handler.ts` |

Rules:
- Verb matches the action: `create`, `update`, `delete`, `complete`, `reopen`, `estimate`
- All lowercase, dot-separated
- Always suffix with `.handler.ts`
- Include the sub-resource qualifier when the action targets a nested attribute (e.g. `update.task.assignee.handler.ts`)

---

## Handler Class Structure

Each file exports one class decorated with `@Injectable()` and an `execute` method. Params match the route inputs (path params + body).

> **DTO import rule:** Always import DTOs from the `@dto` alias. Never use relative `../../` paths.

```typescript
// create.task.handler.ts
import { Injectable } from '@nestjs/common';
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';

@Injectable()
export class CreateTaskHandler {
    execute(body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve({ taskEstimatorId: 'task-1', status: StateStatus.IN_PROGRESS, ...body });
    }
}
```

```typescript
// update.task.handler.ts
import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';

@Injectable()
export class UpdateTaskHandler {
    execute(taskId: string, body: TaskEstimatorDto): Promise<TaskEstimatorDto> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve({ ...body, taskEstimatorId: taskId });
    }
}
```

```typescript
// delete.task.handler.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteTaskHandler {
    execute(taskId: string): Promise<void> {
        // TODO: implement when Task entity and DTO are ready
        return Promise.resolve();
    }
}
```

```typescript
// complete.task.handler.ts  (state-transition — no body)
import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';

@Injectable()
export class CompleteTaskHandler {
    execute(taskId: string): Promise<Partial<TaskEstimatorDto>> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve({ taskEstimatorId: taskId, status: StateStatus.COMPLETED });
    }
}
```

---

## Two-Phase Workflow — Read This First

The `add-api-endpoints` skill runs **before** this skill and leaves the controller as a skeleton with stub route methods. **This skill completes Phase 2**: it creates the handler file and then replaces the matching controller stub with real wiring.

| Phase | Skill | What it does |
|---|---|---|
| 1 | `add-api-endpoints` | Skeleton controller — stubs only, no handlers |
| **2** | `add-task-commands` *(this skill)* | Create handler file + wire it into the controller |

---

## Controller Wiring Rule

Every command handler file **must** be connected in all three places. A handler that exists only as a file is incomplete.

| Location | What to do |
|---|---|
| `commands/<name>.handler.ts` | Create class with `@Injectable()` and `execute()` |
| `app.module.ts` `providers` | Add the handler class |
| `task.controller.ts` constructor | Inject via `private readonly` and replace the stub with `handler.execute()` |

---

## Steps

1. Determine the POST / PUT / PATCH / DELETE endpoint being added to `task.controller.ts`
2. Derive the file name using the naming rules above
3. Create the file under `src/app/Task/commands/` with `@Injectable()` on the class
4. Export a single class with an `execute` method whose params match the route inputs
5. Register the handler in `app.module.ts` `providers` array
6. Inject the handler into `TaskController` constructor and **replace the stub route method body** with `handler.execute()`
7. Add a `// TODO: implement when Task entity and DTO are ready` comment if the implementation is pending

> **Stub logic is intentionally temporary.** DTOs already exist under `libs/dto/src/lib/task-estimator/`. Use `CreateTaskEstimator` for POST body params and `TaskEstimatorDto` for PATCH body params. Once the repository layer is ready, replace the stub `Promise.resolve(...)` with the real implementation. The handler signature (params, return type) should not change — only the body.

> Step 6 is the only step that modifies the controller. The skeleton from Phase 1 already has the correct route decorator, Swagger annotations, and parameter decorators — only the method body changes.

### Registration in AppModule

```typescript
// app.module.ts
import { CreateTaskHandler } from './Task/commands/create.task.handler';

@Module({
    providers: [
        AppService,
        CreateTaskHandler, // ← add new handler here
    ],
})
export class AppModule {}
```

### Wiring in TaskController

```typescript
// task.controller.ts
import { CreateTaskEstimator } from '@dto';

constructor(
    private readonly createTaskHandler: CreateTaskHandler, // ← inject
) {}

@Post()
@HttpCode(HttpStatus.CREATED)
@ApiBody({ type: CreateTaskEstimator })       // ← use DTO class, not inline schema
createTask(@Body() body: CreateTaskEstimator) {
    return this.createTaskHandler.execute(body); // ← call execute()
}
```

---

## Current Command Files

```
src/app/Task/commands/
├── create.task.handler.ts
├── update.task.handler.ts
├── delete.task.handler.ts
├── complete.task.handler.ts
├── reopen.task.handler.ts
├── estimate.task.handler.ts
```
