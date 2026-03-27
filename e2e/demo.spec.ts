import { test, expect } from "@playwright/test";
import { EstimatorPage } from "./pages/EstimatorPage";

test.describe("AI Task Estimator — Demo", () => {
  test("full estimation walkthrough", async ({ page }) => {
    const estimator = new EstimatorPage(page);

    // 1. Land on the homepage
    await estimator.goto();
    await expect(page).toHaveTitle(/AI Task Estimator/);

    // 2. Add team members
    await estimator.addMember("Alice");
    await expect(page.getByText("Alice")).toBeVisible();

    await estimator.addMember("Bob");
    await expect(page.getByText("Bob")).toBeVisible();

    await estimator.addMember("Charlie");
    await expect(page.getByText("Charlie")).toBeVisible();

    // 3. Fill in user stories
    await estimator.fillStories(
      "As a user, I want to log in with my email and password\n" +
      "As a user, I want to reset my password via email\n" +
      "As an admin, I want to view a dashboard of all active users"
    );

    // 4. Submit and wait for AI estimates
    await estimator.submit();
    await estimator.waitForResults();

    // 5. Verify results are displayed
    await expect(page.getByText("Summary")).toBeVisible();
  });

  test("shows validation error for empty stories", async ({ page }) => {
    const estimator = new EstimatorPage(page);
    await estimator.goto();
    await estimator.addMember("Alice");
    // Remove the HTML `required` so the form submits to the server action
    await page.evaluate(() => {
      document.querySelector("textarea[name='userStories']")?.removeAttribute("required");
    });
    await estimator.submit();
    await expect(estimator.errorBanner).toBeVisible();
  });

  test("shows validation error with no team members", async ({ page }) => {
    const estimator = new EstimatorPage(page);
    await estimator.goto();
    await estimator.fillStories("As a user, I want to log in");
    await estimator.submit();
    await expect(estimator.errorBanner).toBeVisible();
  });
});
