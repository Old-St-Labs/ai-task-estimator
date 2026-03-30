---
name: backend-integrate-openai
description: Integrate OpenAI into the task-estimator API service so that creating a task automatically calls OpenAI to populate the `estimatedHours` field. Run this skill after `backend-add-api-endpoints` and `backend-add-task-commands` are complete. Installs the `openai` package, scaffolds an injectable `OpenAIService`, and wires it into `CreateTaskHandler`.
---

# Integrate OpenAI — Auto-Estimate on Task Creation

## Prerequisites

This skill must run **after** both of the following skills have completed:

| Skill | What it does |
|---|---|
| `backend-add-api-endpoints` | Scaffolds the `TaskController` |
| `backend-add-task-commands` | Creates `CreateTaskHandler` and wires it into the controller |

The `CreateTaskHandler` file at `src/app/Task/commands/create.task.handler.ts` must already exist before applying this skill.

---

## Overview

When a task is created via `POST /api/v1/tasks`, OpenAI is called with the task name and returns a numeric hour estimate. That estimate is stored in the `estimatedHours` field of the persisted `TaskEstimatorDto`. The raw AI response text is stored in `AIResponse`.

**Flow:**

```
POST /api/v1/tasks
  └─ CreateTaskHandler.execute(body)
       └─ OpenAIService.estimateHours(taskName)   ← NEW
            └─ openai.chat.completions.create(...)
       └─ model.create({ ...body, estimatedHours, AIResponse, ... })
```

---

## Step 1 — Install the `openai` Package

Run the following command from the workspace root:

```bash
pnpm add openai
```

Verify the package appears under `dependencies` in `package.json` before continuing.

---

## Step 2 — Add the `OPENAI_API_KEY` Environment Variable

The service reads `process.env.OPENAI_API_KEY` at runtime. No additional config module is required.

Add the variable to your local environment file (e.g. `.env.local`, `.env`, or your shell profile) so the NestJS dev server picks it up:

```
OPENAI_API_KEY=sk-...
```

> **Never commit the API key.** Ensure `.env` and `.env.local` are listed in `.gitignore`.

---

## Step 3 — Create `OpenAIService`

Create the file at:

```
apps/task-estimator/task-estimator-api-service/src/app/openai/openai.service.ts
```

### Rules

- Decorated with `@Injectable()` — no constructor parameters are needed.
- Instantiates the `OpenAI` client using `process.env.OPENAI_API_KEY` inside the class body (not in the constructor).
- The public method is `estimateHours(taskName: string): Promise<{ estimatedHours: number; rawResponse: string }>`.
- Uses model `gpt-4o-mini` for cost efficiency.
- The prompt asks for a JSON object with a single numeric field `estimatedHours`.
- Parses the JSON from the assistant message and returns both the number and the raw string.
- Falls back to `estimatedHours: 0` and includes an error message in `rawResponse` if parsing fails.

### Implementation

```typescript
// openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    async estimateHours(taskName: string): Promise<{ estimatedHours: number; rawResponse: string }> {
        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a software project estimation expert. ' +
                            'Given a task name, respond with ONLY a JSON object in the format: ' +
                            '{"estimatedHours": <number>}. ' +
                            'The number should be a realistic estimate of developer hours required. ' +
                            'Do not include any explanation or extra text.',
                    },
                    {
                        role: 'user',
                        content: `Estimate the hours required to complete the following task: "${taskName}"`,
                    },
                ],
                response_format: { type: 'json_object' },
            });

            const rawResponse = completion.choices[0]?.message?.content ?? '';
            const parsed = JSON.parse(rawResponse) as { estimatedHours: number };
            return { estimatedHours: parsed.estimatedHours, rawResponse };
        } catch (err) {
            this.logger.error('OpenAI estimation failed', err);
            return { estimatedHours: 0, rawResponse: `Error: ${String(err)}` };
        }
    }
}
```

---

## Step 4 — Update `CreateTaskHandler`

Modify `src/app/Task/commands/create.task.handler.ts` to:

1. Inject `OpenAIService` via the constructor.
2. Call `openAIService.estimateHours(body.task)` before persisting.
3. Use the returned `estimatedHours` and `rawResponse` when building the entity (overrides any value the caller may have passed).
4. Change `execute` to `async`.

### Implementation

```typescript
// create.task.handler.ts
import { Injectable } from '@nestjs/common';
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class CreateTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    constructor(private readonly openAIService: OpenAIService) {}

    async execute(body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
        const { estimatedHours, rawResponse } = await this.openAIService.estimateHours(body.task);
        const entity: TaskEstimatorDto = {
            ...body,
            taskEstimatorId: crypto.randomUUID(),
            status: StateStatus.IN_PROGRESS,
            estimatedHours,
            AIResponse: rawResponse,
        };
        return this.model.create(entity);
    }
}
```

> **Import rule:** Import `OpenAIService` using a relative path from the commands directory (`../openai/openai.service`). The `@dto` and `@ai-task-estimator/database-service` aliases remain unchanged.

---

## Step 5 — Register `OpenAIService` in `AppModule`

Add `OpenAIService` to the `providers` array in `app.module.ts`. Import it from its relative path.

### Implementation

```typescript
// app.module.ts  (relevant diff — add the two highlighted lines)
import { OpenAIService } from './openai/openai.service';   // ← add import

@Module({
    imports: [],
    controllers: [AppController, TaskController],
    providers: [
        AppService,
        OpenAIService,          // ← add provider
        CreateTaskHandler,
        UpdateTaskHandler,
        DeleteTaskHandler,
        CompleteTaskHandler,
        ReopenTaskHandler,
        EstimateTaskHandler,
        GetTaskByIdQuery,
        GetTaskByTitleQuery,
        ListTasksByStatusQuery,
        ListTasksByStatusAndAssigneeQuery,
        ListTasksQuery,
    ],
})
export class AppModule {}
```

---

## Step 6 — Make `estimatedHours` Optional in `CreateTaskEstimator`

Since OpenAI now provides `estimatedHours` automatically, the field should no longer be required in the create body. Update `CreateTaskEstimator` in `libs/dto/src/lib/task-estimator/create.task-estimator.dto.ts` to omit `estimatedHours`:

```typescript
// create.task-estimator.dto.ts
import { OmitType } from '@nestjs/swagger';
import { TaskEstimatorDto } from './task-estimator.dto';

export class CreateTaskEstimator extends OmitType(TaskEstimatorDto, [
    'taskEstimatorId',
    'status',
    'estimatedHours',
    'AIResponse',
] as const) {}
```

This keeps the `POST /tasks` request body minimal — callers only need to provide `task`.

---

## Directory Layout After This Skill

```
src/app/
├── openai/
│   └── openai.service.ts          ← NEW
├── Task/
│   └── commands/
│       └── create.task.handler.ts  ← MODIFIED (inject OpenAIService, async)
├── app.module.ts                   ← MODIFIED (add OpenAIService provider)
libs/dto/src/lib/task-estimator/
└── create.task-estimator.dto.ts    ← MODIFIED (omit estimatedHours + AIResponse)
```

---

## Output Checklist

Before finishing, verify all of the following:

- [ ] `openai` appears in `package.json` `dependencies`
- [ ] `OPENAI_API_KEY` is documented and NOT committed to source control
- [ ] `openai.service.ts` exists at `src/app/openai/openai.service.ts`
- [ ] `OpenAIService` is decorated with `@Injectable()`
- [ ] `CreateTaskHandler.execute()` is `async` and calls `openAIService.estimateHours()`
- [ ] `estimatedHours` and `AIResponse` on the created entity come from the OpenAI response
- [ ] `OpenAIService` is listed in `app.module.ts` `providers`
- [ ] `CreateTaskEstimator` omits `estimatedHours` and `AIResponse`
- [ ] `POST /api/v1/tasks` with only `{ "task": "Build login page" }` returns a `TaskEstimatorDto` with a non-zero `estimatedHours`
