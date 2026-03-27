---
applyTo: "app/**/*.tsx"
description: React Server Component vs Client Component boundary rules for Next.js 16 App Router.
---

# React Server Components (RSC)

## The Boundary Rule

**All `app/**/*.tsx` files are Server Components by default.**

Add `"use client"` at the very top ONLY when the component needs:
- Event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- React hooks (`useState`, `useEffect`, `useRef`, `useReducer`, etc.)
- Browser-only APIs (`window`, `localStorage`, `navigator`, etc.)
- `useActionState`, `useFormStatus`, `useOptimistic`

```tsx
// ✅ Server Component (no directive needed)
export default async function Page() {
  const data = await fetchData(); // direct async/await
  return <ClientForm initialData={data} />;
}

// ✅ Client Component
"use client";
export function ClientForm({ initialData }) {
  const [value, setValue] = useState(initialData.text);
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

## Composition Pattern

Pass data from Server → Client via props. Never fetch inside Client Components when you can fetch in a Server Component above.

```tsx
// ✅ Correct: server fetches, client renders
// app/page.tsx (Server Component)
export default async function Page() {
  const items = await db.getItems(); // runs on server
  return <ItemList items={items} />;  // props flow down
}

// app/_components/ItemList.tsx (Client Component for interactivity)
"use client";
export function ItemList({ items }) {
  const [selected, setSelected] = useState(null);
  // ...
}
```

## Forms with Server Actions

```tsx
// app/_components/MyForm.tsx
"use client";
import { useActionState } from "react";
import { myServerAction } from "../actions";

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myServerAction, { status: "idle" });

  return (
    <form action={formAction}>
      <input name="field" required />
      <SubmitButton />
      {state.status === "error" && <p role="alert">{state.message}</p>}
    </form>
  );
}

// SubmitButton MUST be a separate child component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus(); // from "react-dom"
  return <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}
```

## File Naming

| Location | Convention | RSC? |
|----------|-----------|------|
| `app/page.tsx` | Route page | ✅ Default server |
| `app/layout.tsx` | Layout | ✅ Default server |
| `app/_components/ThingCard.tsx` | Feature-local | Check: add `"use client"` only if needed |
| `app/components/ui/Button.tsx` | Shared primitive | Usually `"use client"` for events |

## Common Mistakes

```tsx
// ❌ useState in a Server Component
export default function Page() {
  const [open, setOpen] = useState(false); // Error: hooks only in client
}

// ❌ fetch in a useEffect (unnecessary)
"use client";
export function Page() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/data").then(...).then(setData); }, []); // ❌
}

// ✅ Just make it a Server Component and await directly
export default async function Page() {
  const data = await fetch("/api/data").then(r => r.json());
  return <Display data={data} />;
}
```
