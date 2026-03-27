import { type Page, type Locator } from "@playwright/test";

export class EstimatorPage {
  readonly page: Page;
  readonly userStoriesInput: Locator;
  readonly memberInput: Locator;
  readonly submitButton: Locator;
  readonly summarySection: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userStoriesInput = page.getByLabel("User Stories");
    this.memberInput = page.getByPlaceholder("e.g. Alice");
    this.submitButton = page.getByRole("button", { name: "Generate Estimates" });
    this.summarySection = page.getByText("Summary");
    this.errorBanner = page.getByTestId("error-banner");
  }

  async goto() { await this.page.goto("/"); }

  async addMember(name: string) {
    await this.memberInput.fill(name);
    await this.memberInput.press("Enter");
  }

  async fillStories(stories: string) {
    await this.userStoriesInput.fill(stories);
  }

  async submit() { await this.submitButton.click(); }

  async waitForResults() {
    await this.summarySection.waitFor({ state: "visible", timeout: 30000 });
  }
}
