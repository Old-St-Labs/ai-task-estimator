---
applyTo: "app/**/actions.ts"
description: Server Action conventions, security rules, and return type contract.
---

# Server Actions

## File Convention

```typescript
// app/<feature>/actions.ts  — always at the top
"use server";

import type { ActionState } from "../types";
// or from "app/types" if shared
```

## Security Checklist (apply to every action)

- [ ] Sanitize ALL string inputs before use (strip control chars, cap length)
- [ ] Validate shape and type of every `formData` value
- [ ] Never log sensitive data (keys, tokens, full request bodies)
- [ ] Cap numeric inputs to safe ranges: `Math.max(min, Math.min(max, Number(val)))`
- [ ] Allowlist-validate enum fields: `const VALID = new Set(["A","B"]); if (!VALID.has(val)) ...`
- [ ] Catch all async errors — never let an uncaught throw reach the client

## Return Type Contract

All Server Actions in this project must return `ActionState`:

```typescript
type ActionState =
  | { status: "idle" }
  | { status: "success"; result: <SuccessPayload> }
  | { status: "error"; message: string };
```

**Never throw from a Server Action.** Catch errors and return `{ status: "error", message: "..." }`.

## Validate Before Acting

```typescript
export async function myAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Extract
  const raw = formData.get("field");

  // 2. Type-check
  if (typeof raw !== "string" || !raw.trim()) {
    return { status: "error", message: "Field is required." };
  }

  // 3. Sanitize
  const value = raw.replace(/[<>"']/g, "").trim().slice(0, 500);

  // 4. Business logic
  try {
    const result = await doWork(value);
    return { status: "success", result };
  } catch (err) {
    console.error("myAction failed:", err);
    return { status: "error", message: "Something went wrong." };
  }
}
```

## After Mutations

Use `revalidatePath()` or `revalidateTag()` after any mutation:

```typescript
import { revalidatePath } from "next/cache";

export async function createAction(formData: FormData): Promise<ActionState> {
  // ... create ...
  revalidatePath("/page-that-shows-this-data");
  return { status: "success", result };
}
```

## Environment Variables

Access env vars in Server Actions safely:

```typescript
const apiKey = process.env.AI_API_KEY; // string | undefined
const model = process.env.AI_MODEL ?? "default-model";
```

Never expose env vars to the client — they'll be visible in the bundle.
