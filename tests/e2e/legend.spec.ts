import { test, expect } from "@playwright/test";

test.describe("MapLegend", () => {
  test("legend is visible on the map", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Map legend" })).toBeVisible();
  });

  test("legend collapses and expands", async ({ page }) => {
    await page.goto("/");
    const legend = page.getByRole("region", { name: "Map legend" });
    const toggle = legend.getByRole("button", { name: /legend/i });
    await toggle.click();
    await expect(legend.getByText("COG values")).not.toBeVisible();
    await toggle.click();
    await expect(legend.getByText("COG values")).toBeVisible();
  });
});
