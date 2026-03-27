---
name: react19
description: React 19 APIs — useActionState, useFormStatus, useOptimistic, use(), and Server Actions integration. Activate when writing forms, optimistic UI, or async state in React components.
---

# React 19 APIs

## useActionState

Replaces the older `useFormState`. Integrates a Server Action with a form, managing pending state and the result.

```tsx
"use client";
import { useActionState } from "react";
import { myServerAction } from "../actions";

const initialState = { status: "idle" };

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myServerAction, initialState);

  return (
    <form action={formAction}>
      <input name="value" />
      <button disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
      {state.status === "error" && <p>{state.message}</p>}
    </form>
  );
}
```

- `state` is the return value of the last Server Action call (or `initialState`).
- `formAction` is passed to `<form action={...}>`.
- `isPending` is `true` while the action is in-flight.

## useFormStatus

Reads the pending state of the nearest ancestor `<form>`. **Must be in a child component of the form**, not the form component itself.

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting…" : "Submit"}
    </button>
  );
}

// Used inside a form:
function MyForm() {
  return (
    <form action={serverAction}>
      <input name="value" />
      <SubmitButton />  {/* ✅ child of form — can read status */}
    </form>
  );
}
```

## useOptimistic

Show instant UI feedback before the server confirms. Takes current state + an updater function.

```tsx
"use client";
import { useOptimistic, useTransition } from "react";

function TodoList({ todos, addTodoAction }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (currentTodos, newTodo) => [...currentTodos, { ...newTodo, pending: true }]
  );
  const [, startTransition] = useTransition();

  function handleAdd(text: string) {
    startTransition(async () => {
      addOptimistic({ text });
      await addTodoAction(text);
    });
  }

  return (
    <ul>
      {optimisticTodos.map((t) => (
        <li key={t.text} style={{ opacity: t.pending ? 0.5 : 1 }}>{t.text}</li>
      ))}
    </ul>
  );
}
```

## use()

Unwrap a Promise or Context inside any component (including Server Components). Enables Suspense-based data loading.

```tsx
import { use, Suspense } from "react";

async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

function UserProfile({ userPromise }) {
  const user = use(userPromise); // suspends until resolved
  return <p>{user.name}</p>;
}

export default function Page({ params }) {
  const userPromise = fetchUser(params.id);
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

## useTransition

Wrap non-urgent state updates. Keeps the UI responsive during heavy renders.

```tsx
"use client";
import { useTransition } from "react";

function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  function handleChange(e) {
    startTransition(() => setQuery(e.target.value));
  }

  return <input onChange={handleChange} style={{ opacity: isPending ? 0.7 : 1 }} />;
}
```

## Key Rules

- `useFormStatus` must be in a **child** of the form — not the form component itself.
- `useOptimistic` should be paired with `useTransition` for async Server Actions.
- `use()` can be called conditionally (unlike hooks) — it's not a hook.
- Avoid mixing `useActionState` with manual `useState` for the same server data.
