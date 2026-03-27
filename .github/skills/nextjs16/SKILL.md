---
name: nextjs16
description: Next.js 16 App Router patterns, breaking changes, and data-fetching conventions. Activate when writing routes, layouts, middleware, Server Components, or any Next.js-specific API.
---

# Next.js 16 — App Router

> **This is NOT the Next.js from your training data.** Breaking changes exist in v16. When in doubt, read `node_modules/next/dist/docs/` before writing code.

## Route Conventions

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout (wraps `children`) |
| `app/page.tsx` | Route page (default export required) |
| `app/loading.tsx` | Streaming loading UI |
| `app/error.tsx` | Error boundary (`"use client"`) |
| `app/not-found.tsx` | 404 page |
| `app/<segment>/page.tsx` | Nested route |

## Server vs. Client Components

- All `app/**/*.tsx` files are **Server Components by default**.
- Add `"use client"` only when you need: browser APIs, React hooks, event handlers.
- **Never** add `"use client"` to a file that only renders markup or reads server data.
- Server Components can `await` directly — no `useEffect` for data fetching.

```tsx
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchFromDB();
  return <div>{data.name}</div>;
}

// ✅ Client Component (only when needed)
"use client";
export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

## Data Fetching

```tsx
// In Server Components — fetch directly
export default async function Page() {
  const res = await fetch("https://...", { next: { revalidate: 60 } });
  const data = await res.json();
  return <List items={data} />;
}
```

- Use `cache: "no-store"` for dynamic data.
- Use `{ next: { revalidate: N } }` for ISR-like caching.
- Tag-based revalidation: `{ next: { tags: ["my-tag"] } }`.

## Server Actions

```typescript
// app/<feature>/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function myAction(formData: FormData) {
  // validate → mutate → revalidate
  revalidatePath("/path");
}
```

- Must be in a file with `"use server"` at the top, OR an inline function with `"use server"` as first statement.
- Call only from Client Components or via `<form action={...}>`.
- Always validate inputs — never trust `formData` directly.

## Metadata

```tsx
// Static
export const metadata: Metadata = { title: "Page Title" };

// Dynamic
export async function generateMetadata({ params }) {
  return { title: `Item ${params.id}` };
}
```

## Layouts

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Layouts **do not re-render** on navigation — they persist across child route changes.

## Breaking Changes in v16

- `fetch()` is no longer auto-cached by default — opt-in explicitly.
- `cookies()` and `headers()` are async — always `await` them.
- `params` in page components is a Promise — `await params` before use.
- Check `node_modules/next/dist/docs/` for the authoritative list.
