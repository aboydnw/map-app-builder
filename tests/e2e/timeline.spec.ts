import { test, expect } from "@playwright/test";

test.describe("AnimationTimeline", () => {
  test("timeline renders with controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Animation timeline" })).toBeVisible();
    await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
  });

  test("timeline play button toggles", async ({ page }) => {
    await page.goto("/");
    const playButton = page.getByRole("button", { name: "Play" });
    await playButton.click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  });
});
