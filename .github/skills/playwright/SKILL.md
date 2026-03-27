---
name: playwright
description: Playwright e2e testing patterns for this Next.js 16 app. Covers setup, config, test structure, locator strategy, Page Object Model, and testing the estimation flow. Activate when writing, reviewing, or debugging any file in e2e/ or playwright.config.ts.
---

# Playwright — E2E Testing

## Setup (first-time)

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

Add to `package.json` scripts:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug"
```

## Config — `playwright.config.ts` (project root)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

**Key rules:**
- `webServer` auto-starts Next.js dev server before tests run — no manual setup needed.
- Tests run against demo mode (no `AI_API_KEY`) by default; mock engine is deterministic.
- Always set `screenshot: "only-on-failure"` — saves CI storage.

## File Structure

```
e2e/
  pages/                    ← Page Object Models
    HomePage.ts
    EstimatorPage.ts
  fixtures/
    index.ts                ← Custom fixture definitions
  estimation.spec.ts        ← Main user flow tests
  form-validation.spec.ts   ← Input validation edge cases
playwright.config.ts
```

## Locator Strategy (priority order)

Always prefer accessible locators — they also validate accessibility.

```typescript
// 1. By role (best — semantic, resilient)
page.getByRole("button", { name: "Generate Estimates" })
page.getByRole("textbox", { name: "User Stories" })

// 2. By label (form inputs)
page.getByLabel("User Stories")

// 3. By placeholder
page.getByPlaceholder("As a user, I want to...")

// 4. By text
page.getByText("Summary")

// 5. By test id (last resort — add data-testid to element)
page.getByTestId("task-card")

// ❌ Avoid: CSS selectors, nth-child, XPath
page.locator(".rounded-xl > h3")  // ← brittle, breaks on Tailwind changes
```

## Page Object Model

```typescript
// e2e/pages/EstimatorPage.ts
import { type Page, type Locator } from "@playwright/test";

export class EstimatorPage {
  readonly page: Page;
  readonly userStoriesInput: Locator;
  readonly memberInput: Locator;
  readonly addMemberButton: Locator;
  readonly submitButton: Locator;
  readonly summarySection: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userStoriesInput = page.getByLabel("User Stories");
    this.memberInput = page.getByPlaceholder("e.g. Alice");
    this.addMemberButton = page.getByRole("button", { name: "Add" });
    this.submitButton = page.getByRole("button", { name: "Generate Estimates" });
    this.summarySection = page.getByText("Summary");
    this.errorBanner = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/");
  }

  async addMember(name: string) {
    await this.memberInput.fill(name);
    await this.memberInput.press("Enter");
  }

  async fillStories(stories: string) {
    await this.userStoriesInput.fill(stories);
  }

  async submit() {
    await this.submitButton.click();
  }

  async waitForResults() {
    await this.summarySection.waitFor({ state: "visible", timeout: 15_000 });
  }
}
```

## Key Test Flows for This App

### 1. Happy path — end-to-end estimation
```typescript
test("generates task breakdown from user stories", async ({ page }) => {
  const estimator = new EstimatorPage(page);
  await estimator.goto();
  await estimator.addMember("Alice");
  await estimator.addMember("Bob");
  await estimator.fillStories(
    "As a user, I want to log in with my email and password"
  );
  await estimator.submit();
  await estimator.waitForResults();

  await expect(page.getByText("Summary")).toBeVisible();
  await expect(page.getByText("Alice")).toBeVisible();
});
```

### 2. Validation — empty form submissions
```typescript
test("shows error when user stories are empty", async ({ page }) => {
  const estimator = new EstimatorPage(page);
  await estimator.goto();
  await estimator.addMember("Alice");
  await estimator.submit();
  await expect(estimator.errorBanner).toBeVisible();
});

test("shows error when no team members added", async ({ page }) => {
  const estimator = new EstimatorPage(page);
  await estimator.goto();
  await estimator.fillStories("As a user, I want to log in");
  await estimator.submit();
  await expect(estimator.errorBanner).toBeVisible();
});
```

### 3. Team member tag input
```typescript
test("adds and removes team members", async ({ page }) => {
  const estimator = new EstimatorPage(page);
  await estimator.goto();
  await estimator.addMember("Alice");
  await expect(page.getByText("Alice")).toBeVisible();

  await page.getByRole("button", { name: "Remove Alice" }).click();
  await expect(page.getByText("Alice")).not.toBeVisible();
});
```

## Assertions Reference

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();
await expect(locator).toBeHidden();

// Content
await expect(locator).toHaveText("exact text");
await expect(locator).toContainText("partial");
await expect(locator).toHaveValue("input value");

// State
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();

// URL
await expect(page).toHaveURL("/estimates");
await expect(page).toHaveURL(/\/estimates\/[\w-]+/);

// Count
await expect(page.getByTestId("task-card")).toHaveCount(3);
```

## CI Integration

Add to `.github/workflows/e2e.yml`:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run e2e tests
  run: npm run test:e2e
  env:
    CI: true
    # No AI_API_KEY — tests run in mock mode

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

## Checklist

- [ ] `playwright.config.ts` at project root with `webServer` configured
- [ ] Tests live in `e2e/` directory
- [ ] Page Objects in `e2e/pages/` for every page under test
- [ ] Locators use `getByRole` / `getByLabel` — no raw CSS selectors
- [ ] Tests run in mock mode (no `AI_API_KEY`) for determinism
- [ ] Happy path + validation + edge cases covered
- [ ] `screenshot: "only-on-failure"` in config
- [ ] CI workflow uploads the HTML report as an artifact
