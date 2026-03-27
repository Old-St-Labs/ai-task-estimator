---
name: e2e-testing
description: Guide for writing Playwright E2E tests for the AI Task Estimator. Use this when asked to add, write, or scaffold any Playwright test, test helper, or test config.
---

# E2E Testing with Playwright

---

## Setup (run once)

```bash
yarn add -D @playwright/test
npx playwright install chromium
```

Add to `package.json`:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

---

## File Structure

```
e2e/
  global-setup.ts       ← resets test.db before the suite
  projects.spec.ts
  developers.spec.ts
  user-stories.spec.ts
  analyze.spec.ts       ← AI flow (mocked)
  sprints.spec.ts
playwright.config.ts
```

---

## `playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      DB_PATH: "test.db", // ← isolated test database
    },
  },
});
```

---

## DB Isolation (one-time code change)

Change `db/index.ts` to read from an env var so tests use a separate file:

```ts
// db/index.ts — change the one hardcoded line
const sqlite = new Database(process.env.DB_PATH ?? "local.db");
```

Also update `drizzle.config.ts` for `yarn db:push` against test.db when needed:
```ts
dbCredentials: { url: process.env.DB_PATH ?? "local.db" },
```

---

## `e2e/global-setup.ts`

Runs once before the full suite. Drops and re-creates all tables in `test.db`.

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export default async function globalSetup() {
  const sqlite = new Database("test.db");
  const db = drizzle(sqlite);
  // Apply all schema migrations to the fresh test DB
  migrate(db, { migrationsFolder: "./db/migrations" });
  sqlite.close();
}
```

> **Note:** Requires generated migrations. Run `yarn db:generate` (add script: `drizzle-kit generate`) once to produce `db/migrations/`. If you don't want migrations, call `db:push` with `DB_PATH=test.db yarn db:push` instead of using the migrator.

Each spec file cleans up its own data in `afterEach` by deleting via the API — no
direct DB access in tests.

---

## Test Pattern

```ts
// e2e/projects.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Projects", () => {
  let projectId: number;

  test.afterEach(async ({ request }) => {
    // Clean up — always delete what this test created
    if (projectId) {
      await request.delete(`/api/projects/${projectId}`);
    }
  });

  test("creates a project", async ({ page, request }) => {
    await page.goto("/projects/new");
    await page.getByLabel("Name").fill("Sprint Test Project");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/projects\/\d+/);

    // Capture the id for cleanup
    projectId = Number(page.url().split("/").pop());
  });

  test("lists projects on /projects", async ({ page, request }) => {
    const res = await request.post("/api/projects", {
      data: { name: "List Test", description: "" },
    });
    const body = await res.json();
    projectId = body.data.id;

    await page.goto("/projects");
    await expect(page.getByText("List Test")).toBeVisible();
  });
});
```

---

## Mocking the Gemini Analyze Endpoint

The AI call must never hit the real Gemini API in tests. Use `page.route()` to
intercept the request and return a deterministic fixture.

```ts
// e2e/analyze.spec.ts
import { test, expect } from "@playwright/test";

const MOCK_ANALYZE_RESPONSE = {
  code: "200",
  data: {
    gaps: ["Missing password reset flow"],
    tasks: [
      {
        title: "Build login API",
        description: "POST /api/auth/login",
        estimatedHours: 4,
        layer: "backend",
        developerName: "Alice",
      },
    ],
  },
};

test("analyze & estimate returns mocked tasks", async ({ page }) => {
  // Intercept before navigating
  await page.route("**/api/projects/*/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_ANALYZE_RESPONSE),
    })
  );

  await page.goto("/projects/1"); // assumes seed data or prior test
  await page.getByRole("button", { name: "Analyze & Estimate" }).click();

  await expect(page.getByText("Build login API")).toBeVisible();
  await expect(page.getByText("Missing password reset flow")).toBeVisible();
});
```

---

## Critical Flows to Cover

| Spec file | Flows |
|---|---|
| `projects.spec.ts` | Create project, edit name, delete project, list |
| `developers.spec.ts` | Add developer to project, edit capacity, delete |
| `user-stories.spec.ts` | Add story, set priority, edit, delete |
| `analyze.spec.ts` | Analyze & Estimate button (mocked), tasks rendered, gaps rendered |
| `sprints.spec.ts` | Generate sprints, sprint board shows developer lanes |

---

## Rules

- **Never** hit the real Gemini API — always mock `/api/projects/*/analyze` with `page.route()`.
- **Always** clean up created records in `afterEach` via the API (not direct DB).
- Use the **API request fixture** (`{ request }`) to seed data — faster than UI interactions for setup.
- Prefer `getByRole` and `getByLabel` over CSS selectors.
- Keep each test independent — no shared state between `test()` calls.
