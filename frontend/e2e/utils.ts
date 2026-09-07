import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Page, ConsoleMessage } from "@playwright/test";

export interface CapturedIssue {
  type: "console" | "network" | "pageerror";
  message: string;
  url?: string;
  status?: number;
}

export function attachConsoleWatcher(page: Page, issues: CapturedIssue[]) {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      issues.push({ type: "console", message: msg.text() });
    }
  });

  page.on("pageerror", (error) => {
    issues.push({ type: "pageerror", message: error.message });
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      issues.push({
        type: "network",
        message: `${response.request().method()} ${response.url()} -> ${response.status()}`,
        url: response.url(),
        status: response.status(),
      });
    }
  });
}

export interface BugReport {
  title: string;
  steps: string[];
  issues: CapturedIssue[];
  screenshotPath: string;
  timestamp: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, "..", "qa-agent-report");

export async function reportBug(
  page: Page,
  title: string,
  steps: string[],
  issues: CapturedIssue[],
): Promise<BugReport> {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const screenshotPath = path.join(
    REPORT_DIR,
    `${timestamp}-${slugify(title)}.png`,
  );

  await page.screenshot({ path: screenshotPath, fullPage: true });

  const bug: BugReport = { title, steps, issues, screenshotPath, timestamp };

  const jsonPath = path.join(REPORT_DIR, "report.json");
  const existing: BugReport[] = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
    : [];
  existing.push(bug);
  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2));

  return bug;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50);
}
