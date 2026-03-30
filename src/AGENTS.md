# Src Layer - Domain and Application Context

This directory implements **clean architecture** across three strict layers.
Dependencies flow inward only - outer layers may import from inner layers, never the reverse.

```
src/
  domain/              <- innermost: pure types + interfaces, no framework imports
    task.ts            <- Task, TaskType, TeamMember, TeamMemberRole, EstimationResult
    estimator.port.ts  <- IEstimator port interface
  application/         <- use cases, depends only on domain
    estimate-tasks.use-case.ts
  infrastructure/      <- adapters, implements ports, depends on domain + application
    estimator-factory.ts  <- createEstimator(): MockEstimator | AiEstimator
    sanitize.ts           <- input sanitization utilities
```

## Dependency Rules (strict - never break)

| Layer | May import from | May NOT import from |
|-------|----------------|---------------------|
| domain/ | nothing | application/, infrastructure/, app/ |
| application/ | domain/ only | infrastructure/, app/ |
| infrastructure/ | domain/, application/ | app/ |

## Key Types

- `TaskType` - `"FE" | "BE" | "Fullstack" | "DevOps" | "QA"`
- `TeamMemberRole` - `"FE" | "BE" | "Fullstack"`
- `TeamMember` - `{ name: string; role: TeamMemberRole }`
- `Task` - `{ title, description, type, assignee, estimatedHours, storyReference }`
- `EstimationResult` - `{ tasks, totalHours, byMember }`

## AI Integration

`estimator-factory.ts` returns a `MockEstimator` when `AI_API_KEY` is absent, or an
`AiEstimator` using the OpenAI-compatible API.

- Provider: Groq (`llama-3.3-70b-versatile`) via `AI_BASE_URL=https://api.groq.com/openai/v1`
- Response format: `json_object`, temperature `0.2`
- Max estimated hours per task: **16h**
- Role-filtered assignment: FE tasks -> FE/Fullstack members; BE tasks -> BE/Fullstack members

See [ai-integration skill](../.github/skills/ai-integration/SKILL.md) before modifying the estimator.
