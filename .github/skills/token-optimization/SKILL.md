---
name: token-optimization
description: Strategies to minimize AI API token usage and cost. Activate when writing or reviewing AI prompts, model config, or response parsing logic.
---

# Token Optimization

## Model Selection — Use the Cheapest That Works

| Use case | Model | Note |
|----------|-------|------|
| Task breakdown (structured JSON) | `gpt-4o-mini` | Default — use this |
| Complex multi-step reasoning | `gpt-4o` | Only if mini quality is insufficient |
| Simple classification | `gpt-4o-mini` | Never overkill with large model |

Always make this configurable via `AI_MODEL` env var. Never hardcode a model name.

## Prompt Efficiency Rules

### 1. Force JSON output
```typescript
// Eliminates preamble tokens (saves 20–60 tokens per call)
response_format: { type: "json_object" }
```

### 2. Low temperature for structured output
```typescript
temperature: 0.2 // Deterministic = less hedging = fewer tokens
```

### 3. Keep system prompt under 50 words
```typescript
// Verbose (wastes tokens)
"You are an expert senior technical project manager with 20 years of experience..."

// Tight (same effect)
"You are a technical PM. Respond with valid JSON only — no markdown."
```

### 4. Concise JSON schema description
```
// Over-documented
"estimatedHours: integer representing hours, must be whole number between 1 and 40"

// Concise
"estimatedHours: integer 1-40"
```

### 5. Cap user input before building prompt
```typescript
// Already enforced in src/infrastructure/sanitize.ts
const MAX_INPUT_CHARS = 3000;
```

### 6. Bound output size in the prompt itself
Add: `"Include 2-4 tasks per user story"` — open-ended requests generate more tokens.

## Cost Reference

| Model | Input / 1M tokens | Output / 1M tokens |
|-------|--------------------------|-------|
| `gpt-4o-mini` | ~$0.15 | ~$0.60 |
| `gpt-4o` | ~$2.50 | ~$10.00 |

Typical call (5 stories, 3 members): ~500 input + ~400 output tokens
- Cost with `gpt-4o-mini`: **under $0.001 per call**
- Cost with `gpt-4o`: **~$0.006 per call** — 6x more expensive for same result

## Checklist

- [ ] Using `gpt-4o-mini` (or cheaper) as default
- [ ] `response_format: { type: "json_object" }` set
- [ ] `temperature` at 0.2–0.3
- [ ] System prompt is under 50 words
- [ ] JSON schema description is concise
- [ ] User input is capped before prompt injection
- [ ] Task count is bounded in the prompt
- [ ] No duplicate instructions across system and user prompt
