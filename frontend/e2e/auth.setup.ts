import { test as setup } from "@playwright/test";
import { clerkSetup, clerk } from "@clerk/testing/playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate as Clerk test user", async ({ page }) => {
  await clerkSetup();

  await page.goto("/");

  await clerk.signIn({
    page,
    emailAddress: process.env.QA_CLERK_TEST_EMAIL!,
  });

  await page.waitForURL("/");

  await page.context().storageState({ path: authFile });
});
