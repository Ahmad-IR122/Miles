import { test, expect } from "@playwright/test";
import { attachConsoleWatcher, CapturedIssue, reportBug } from "./utils";

const PROTECTED_ROUTES = ["/trips", "/itinerary/1"];
const ROUTES_TO_EXPLORE = ["/", "/plan-trip", "/discover", "/trips"];

const HOSTILE_INPUTS = [
  "<script>alert(1)</script>",
  "' OR '1'='1",
  "a".repeat(5000),
  "   ",
  "😀🔥💥",
  "",
];

test.describe("qa-agent: protected routes while signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // force signed-out

  for (const route of PROTECTED_ROUTES) {
    test(`redirects or blocks ${route} when signed out`, async ({ page }) => {
      const issues: CapturedIssue[] = [];
      attachConsoleWatcher(page, issues);

      await page.goto(route);

      let blocked = false;
      try {
        await expect(async () => {
          const url = page.url();
          blocked =
            url.includes("/sign-in") ||
            url.includes("/login") ||
            (await page
              .getByText(/sign in/i)
              .isVisible()
              .catch(() => false));
          expect(blocked).toBeTruthy();
        }).toPass({ timeout: 8000 });
      } catch {
        await reportBug(
          page,
          `Protected route ${route} accessible while signed out`,
          [
            "Sign out",
            `Navigate directly to ${route}`,
            "Observe page loads without redirect",
          ],
          issues,
        );
      }

      expect(blocked, `Expected ${route} to require sign-in`).toBeTruthy();
    });
  }
});

test.describe("qa-agent: authenticated exploration", () => {
  for (const route of ROUTES_TO_EXPLORE) {
    test(`explore ${route}: click every control, watch console/network`, async ({
      page,
    }) => {
      const issues: CapturedIssue[] = [];
      attachConsoleWatcher(page, issues);

      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const clickable = page.locator(
        "button:visible, a:visible, [role='button']:visible",
      );
      const count = await clickable.count();

      for (let i = 0; i < count; i++) {
        const el = clickable.nth(i);
        const label = (await el.textContent())?.trim() || `element #${i}`;

        try {
          await el.click({ trial: true, timeout: 1000 });
        } catch {
          continue;
        }

        const urlBefore = page.url();
        await el.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(300); // let async errors/network settle

        if (page.url() !== urlBefore) {
          await page.goBack().catch(() => {});
          await page.waitForTimeout(300);
        }

        if (issues.length > 0) {
          await reportBug(
            page,
            `Issue after clicking "${label}" on ${route}`,
            [`Go to ${route}`, `Click "${label}"`],
            [...issues],
          );
          issues.length = 0;
        }
      }
    });
  }
});

test.describe("qa-agent: form fuzzing", () => {
  for (const route of ROUTES_TO_EXPLORE) {
    test(`fuzz forms on ${route}`, async ({ page }) => {
      const issues: CapturedIssue[] = [];
      attachConsoleWatcher(page, issues);

      await page.goto(route);
      const forms = page.locator("form");
      const formCount = await forms.count();

      for (let f = 0; f < formCount; f++) {
        const form = forms.nth(f);
        const inputs = form.locator("input:visible, textarea:visible");
        const inputCount = await inputs.count();

        for (const value of HOSTILE_INPUTS) {
          for (let i = 0; i < inputCount; i++) {
            await inputs
              .nth(i)
              .fill(value)
              .catch(() => {});
          }

          const submit = form
            .locator("button[type='submit'], input[type='submit']")
            .first();
          if (await submit.count()) {
            await submit.click().catch(() => {});
            await page.waitForTimeout(300);

            await submit.click().catch(() => {});
            await page.waitForTimeout(300);
          }

          if (issues.length > 0) {
            await reportBug(
              page,
              `Issue fuzzing form #${f} on ${route} with input "${value.slice(0, 20)}"`,
              [
                `Go to ${route}`,
                `Fill form fields with: ${value || "(empty)"}`,
                "Submit twice",
              ],
              [...issues],
            );
            issues.length = 0;
          }
        }
      }
    });
  }
});

test.describe("qa-agent: responsive check", () => {
  const viewports = [
    { width: 375, height: 667, name: "mobile" },
    { width: 768, height: 1024, name: "tablet" },
    { width: 1440, height: 900, name: "desktop" },
  ];

  for (const vp of viewports) {
    test(`layout at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      const issues: CapturedIssue[] = [];
      attachConsoleWatcher(page, issues);

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForTimeout(500);

      if (issues.length > 0) {
        await reportBug(
          page,
          `Console/network errors at ${vp.name} viewport`,
          [`Resize to ${vp.width}x${vp.height}`, "Load /"],
          issues,
        );
      }
    });
  }
});
