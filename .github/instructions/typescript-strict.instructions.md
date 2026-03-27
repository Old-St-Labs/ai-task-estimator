---
applyTo: "**/*.{ts,tsx}"
description: TypeScript strict mode conventions for this project.
---

# TypeScript — Strict Mode

## Rules

- **Zero `any`**. Use `unknown` and narrow with type guards.
- `type` for data shapes; `interface` for extensible contracts (rarely needed).
- Co-locate types in the same file unless 3+ files share them — then put in `app/types.ts`.
- Export types with `type` keyword: `export type { Foo }`.

## Narrowing Patterns

```typescript
// Unknown from external sources → narrow before use
function processInput(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected string");
  return value.trim();
}

// Type guards
function isTask(obj: unknown): obj is Task {
  return typeof obj === "object" && obj !== null && "title" in obj;
}

// Discriminated unions
type Result =
  | { status: "ok"; data: string }
  | { status: "error"; message: string };

function handle(r: Result) {
  if (r.status === "ok") return r.data; // TypeScript knows r.data exists
  return r.message;
}
```

## Naming

- Types/interfaces: `PascalCase`
- Type parameters: single uppercase letter or descriptive (`T`, `TData`, `TError`)
- Avoid prefixing with `I` for interfaces

## Common Patterns in This Codebase

```typescript
// app/types.ts — shared types
export type TaskType = "FE" | "BE";

export type Task = {
  title: string;
  description: string;
  type: TaskType;
  estimatedHours: number;
  assignedTo: string;
  userStory: string;
};

// Discriminated union for Server Action state
export type ActionState =
  | { status: "idle" }
  | { status: "success"; result: EstimationResult }
  | { status: "error"; message: string };
```

## What to Avoid

```typescript
// ❌ Never
const data: any = fetchData();
function process(x: any) { ... }

// ✅ Instead
const data: unknown = fetchData();
function process(x: unknown): string {
  if (typeof x !== "string") throw new Error("...");
  return x;
}
```
