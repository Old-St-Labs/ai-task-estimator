---
name: next-best-practices
description: Next.js 16 App Router best practices — RSC boundaries, async params/searchParams, data fetching patterns, route handlers, error handling, and debug tricks. Use this when writing or reviewing any Next.js page, layout, component boundary, or data fetching code.
user-invocable: false
---

# Next.js Best Practices

This is a **locally run** Next.js 16 app with a local SQLite DB (`local.db`). No auth,
no CORS, no remote services. `fetch('/api/...')` from client components always hits the
same Next.js process.

For patterns already covered by other skills, use those:
- Page scaffolding, `loading.tsx`, `error.tsx`, `not-found.tsx`, async `params` in pages → `create-page/SKILL.md`
- Route handler structure, async `params` in handlers, Zod validation, response helpers → `create-api-endpoint.md`
- `"use client"` forms, `fetch` to API, response `code` checking → `create-form/SKILL.md`
- `"use client"` decision, component colocation → `create-ui-component/SKILL.md`

---

## Things Specific to This Project

### After a client mutation, refresh Server Components

This app has no client cache (no React Query, no SWR). After a successful API call that
modifies data, call `router.refresh()` so the nearest Server Component re-runs its DB query.

```tsx
"use client";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({ projectId }: { projectId: number }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    const body = await res.json();
    if (body.code === "200") {
      router.refresh(); // re-runs the parent Server Component's db query
    }
  }
  // ...
}
```

### `better-sqlite3` must not be bundled into the client

If you see `Module not found: Can't resolve 'better-sqlite3'` at build time,
add this to `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};
```

### `db` and `gemini` are server-only — never import in `"use client"` files

Both `@/db` (uses `better-sqlite3`) and `@/lib/gemini` (uses a private API key) will
crash the browser bundle if imported in a Client Component. If you need to trigger an AI
call from the UI, `POST` to an API route handler — never call `gemini` directly.

---

## Debug

See [debug-tricks.md](./debug-tricks.md) for the `/_next/mcp` dev endpoint and
project-specific build error fixes.
