#!/usr/bin/env node

import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDefaultSpec, serializeMonetreadySpec } from "monetready-core";
import prompts from "prompts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "../template");

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const projectName = args[0];

  let name = projectName;
  let problem: string | undefined;
  let audience: string | undefined;

  if (!name) {
    const answers = await prompts([
      {
        type: "text",
        name: "name",
        message: "Product name",
        initial: "my-saas",
        validate: (v: string) => v.length > 0 || "Name is required",
      },
      {
        type: "text",
        name: "problem",
        message: "What problem does it solve?",
        initial: "Teams waste hours on manual workflows",
      },
      {
        type: "text",
        name: "audience",
        message: "Who is your target audience?",
        initial: "Indie hackers and small dev teams",
      },
    ]);

    if (!answers.name) {
      console.log("Cancelled.");
      process.exit(0);
    }

    name = answers.name as string;
    problem = answers.problem as string;
    audience = answers.audience as string;
  }

  const targetDir = resolve(process.cwd(), name!);

  try {
    await access(targetDir);
    console.error(`Error: directory "${name}" already exists.`);
    process.exit(1);
  } catch {
    // good
  }

  console.log(`\n🔥 Forging ${name}…\n`);

  await mkdir(targetDir, { recursive: true });
  await cp(TEMPLATE_DIR, targetDir, { recursive: true });

  const spec = createDefaultSpec({
    product: {
      name: name!,
      tagline: `The better way to solve ${problem?.toLowerCase() ?? "this problem"}`,
      problem: problem ?? "Describe the pain your users feel today",
      solution: `A focused tool that helps ${audience ?? "your audience"} ship faster`,
    },
    gtm: {
      channels: ["github", "hackernews", "devto"],
      unfair_advantage: "Deep understanding of the problem from personal experience",
      target_audience: audience ?? "Indie hackers and small dev teams",
    },
    integrations: {
      stripe: false,
      analytics: "posthog",
      email: "resend",
    },
  });

  await writeFile(join(targetDir, "monetready.yaml"), serializeMonetreadySpec(spec), "utf-8");

  // Patch package.json name
  const pkgPath = join(targetDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  pkg.name = name!.toLowerCase().replace(/\s+/g, "-");
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

  console.log("✓ Project scaffolded");
  console.log();
  console.log("Next steps:");
  console.log(`  cd ${name}`);
  console.log("  npm install");
  console.log("  monetready score     # audit revenue readiness");
  console.log("  monetready launch     # full launch pipeline");
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
