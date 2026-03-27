# Debug Tricks

## MCP Endpoint (Dev Server)

Next.js 16 exposes `/_next/mcp` in dev — enabled by default, no config needed.
First check the actual port from `yarn dev` output.

```bash
# Template — replace <port> and <tool-name>
curl -X POST http://localhost:<port>/_next/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"<tool-name>","arguments":{}}}'
```

| Tool | What it returns |
|---|---|
| `get_errors` | Build + runtime errors with source-mapped stacks |
| `get_routes` | All App Router routes (add `"routerType":"app"` to arguments) |
| `get_project_metadata` | Project path and dev server URL |
| `get_logs` | Path to `<distDir>/logs/next-development.log` |
| `get_page_metadata` | Segment tree for the current page (needs active browser) |

---

## Rebuild a Specific Route

```bash
yarn build --debug-build-paths "/projects/[id]"
yarn build --debug-build-paths "/api/projects/[id]/analyze"
```

Faster iteration on build errors than a full rebuild.

---

## Common Build Errors

| Symptom | Fix |
|---|---|
| `Module not found: Can't resolve 'better-sqlite3'` | Add `serverExternalPackages: ["better-sqlite3"]` to `next.config.ts` |
| `params should be awaited before using its properties` | Add `Promise<{...}>` type + `await params` — see `create-api-endpoint.md` or `create-page/SKILL.md` |
| Node built-ins (`fs`, `crypto`) in browser bundle | A `"use client"` file is importing `db` or `gemini` — move the import to a Server Component or Route Handler |
