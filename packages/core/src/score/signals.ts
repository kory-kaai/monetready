import { access, readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import type { ProjectSignals } from "./types.js";

async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function findFile(
  root: string,
  candidates: string[],
  maxDepth = 3,
): Promise<string | null> {
  for (const candidate of candidates) {
    const direct = join(root, candidate);
    if (await pathExists(direct)) {
      return direct;
    }
  }

  if (maxDepth <= 0) {
    return null;
  }

  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".git" || entry === "dist") {
      continue;
    }

    const fullPath = join(root, entry);
    const entryStat = await stat(fullPath);
    if (!entryStat.isDirectory()) {
      continue;
    }

    const found = await findFile(fullPath, candidates, maxDepth - 1);
    if (found) {
      return found;
    }
  }

  return null;
}

async function fileContains(filePath: string, patterns: RegExp[]): Promise<boolean> {
  try {
    const content = await readFile(filePath, "utf-8");
    return patterns.some((pattern) => pattern.test(content));
  } catch {
    return false;
  }
}

async function scanDirectoryForPatterns(
  root: string,
  patterns: RegExp[],
  maxFiles = 200,
): Promise<boolean> {
  let scanned = 0;

  function shouldSkipDir(entry: string, fullPath: string): boolean {
    if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === ".monetready") {
      return true;
    }

    const rel = relative(root, fullPath).replace(/\\/g, "/");
    if (
      rel.startsWith("packages/core/") ||
      rel.startsWith("packages/cli/") ||
      rel.startsWith("packages/create-monetready/") ||
      rel.startsWith("playbooks/")
    ) {
      return true;
    }

    return false;
  }

  async function walk(dir: string, depth: number): Promise<boolean> {
    if (depth > 4 || scanned >= maxFiles) {
      return false;
    }

    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return false;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const entryStat = await stat(fullPath);

      if (entryStat.isDirectory()) {
        if (shouldSkipDir(entry, fullPath)) {
          continue;
        }
        if (await walk(fullPath, depth + 1)) {
          return true;
        }
        continue;
      }

      if (!/\.(tsx?|jsx?|mdx?|html|vue|svelte)$/i.test(entry)) {
        continue;
      }

      scanned += 1;
      if (await fileContains(fullPath, patterns)) {
        return true;
      }
    }

    return false;
  }

  return walk(root, 0);
}

export async function detectProjectSignals(projectRoot: string): Promise<ProjectSignals> {
  const readmePath =
    (await findFile(projectRoot, ["README.md", "readme.md", "Readme.md"])) ?? null;

  let readmeContent = "";
  if (readmePath) {
    readmeContent = await readFile(readmePath, "utf-8");
  }

  const hasStripeIntegration = await scanDirectoryForPatterns(projectRoot, [
    /stripe/i,
    /@stripe\//,
    /STRIPE_/,
  ]);

  const hasAnalytics = await scanDirectoryForPatterns(projectRoot, [
    /posthog/i,
    /plausible/i,
    /mixpanel/i,
    /@vercel\/analytics/,
    /gtag\(/,
  ]);

  const hasEmailIntegration = await scanDirectoryForPatterns(projectRoot, [
    /resend/i,
    /sendgrid/i,
    /postmark/i,
    /@react-email/,
  ]);

  const hasOnboardingFlow = await scanDirectoryForPatterns(projectRoot, [
    /onboarding/i,
    /welcome/i,
    /getting.?started/i,
    /setup.?wizard/i,
  ]);

  const monetreadyLandingPath = join(projectRoot, ".monetready", "pages", "index.html");
  const monetreadyPricingPath = join(projectRoot, ".monetready", "pages", "pricing.html");

  const hasMonetreadyPages = await pathExists(monetreadyLandingPath);

  const hasPricingPage =
    hasMonetreadyPages ||
    (await pathExists(monetreadyPricingPath)) ||
    (await scanDirectoryForPatterns(projectRoot, [/pricing/i, /\/price/i]));

  const hasLandingPage =
    hasMonetreadyPages ||
    (await scanDirectoryForPatterns(projectRoot, [/landing/i, /hero/i, /get.?started/i]));

  const ctaPatterns = [/get started|sign up|try free|start free|book a demo/i];
  let hasCallToAction = ctaPatterns.some((pattern) => pattern.test(readmeContent));
  if (!hasCallToAction && hasMonetreadyPages) {
    hasCallToAction = await fileContains(monetreadyLandingPath, ctaPatterns);
  }

  let hasFaq = /##\s*faq|frequently asked/i.test(readmeContent);
  if (!hasFaq && hasMonetreadyPages) {
    hasFaq = await fileContains(monetreadyLandingPath, [/faq|frequently asked/i]);
  }

  let hasSocialProof = /testimonial|trusted by|used by|\d+\+?\s*(users|customers|teams)/i.test(
    readmeContent,
  );
  if (!hasSocialProof && hasMonetreadyPages) {
    hasSocialProof = await fileContains(monetreadyLandingPath, [
      /testimonial|trusted by|used by|\d+\+?\s*(users|customers|teams)/i,
    ]);
  }

  return {
    hasReadme: readmePath !== null,
    hasLicense: await pathExists(join(projectRoot, "LICENSE")),
    hasPricingPage,
    hasLandingPage,
    hasStripeIntegration,
    hasAnalytics,
    hasEmailIntegration,
    hasOnboardingFlow,
    hasTests: await pathExists(join(projectRoot, "vitest.config.ts"))
      || await pathExists(join(projectRoot, "jest.config.js"))
      || await pathExists(join(projectRoot, "playwright.config.ts")),
    hasCi: await pathExists(join(projectRoot, ".github", "workflows")),
    readmeWordCount: readmeContent.split(/\s+/).filter(Boolean).length,
    hasCallToAction,
    hasFaq,
    hasSocialProof,
  };
}
