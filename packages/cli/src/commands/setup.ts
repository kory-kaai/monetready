import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createDefaultSpec,
  DEFAULT_PLAYBOOK_IDS,
  serializeMonetreadySpec,
  type MonetreadySpec,
} from "@monetready/core";
import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";

export const setupCommand = new Command("setup")
  .description("Interactive wizard — define your product in minutes")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("-f, --force", "Overwrite existing monetready.yaml")
  .action(async (options: { path: string; force?: boolean }) => {
    const specPath = join(options.path, "monetready.yaml");

    if (!options.force) {
      try {
        await access(specPath);
        const { overwrite } = await prompts({
          type: "confirm",
          name: "overwrite",
          message: "monetready.yaml already exists. Overwrite?",
          initial: false,
        });
        if (!overwrite) {
          console.log(chalk.dim("Setup cancelled."));
          return;
        }
      } catch {
        // no file — continue
      }
    }

    console.log();
    console.log(chalk.bold("  🔥 Monetready Setup Wizard"));
    console.log(chalk.dim("  Answer a few questions — we'll forge your monetready.yaml\n"));

    const answers = await prompts([
      {
        type: "text",
        name: "name",
        message: "Product name",
        initial: "My Product",
        validate: (v: string) => v.length > 0 || "Required",
      },
      {
        type: "text",
        name: "tagline",
        message: "One-line tagline (what you do)",
        initial: "Solve a real problem for a specific audience",
      },
      {
        type: "text",
        name: "problem",
        message: "What pain do your users feel?",
        initial: "Teams waste hours on manual work",
      },
      {
        type: "text",
        name: "solution",
        message: "How does your product fix it?",
        initial: "Automate the workflow in minutes",
      },
      {
        type: "text",
        name: "audience",
        message: "Who specifically pays for this?",
        initial: "Indie hackers and solo founders",
      },
      {
        type: "text",
        name: "advantage",
        message: "Your unfair advantage (what competitors lack)",
        initial: "Deep personal experience with this problem",
      },
      {
        type: "number",
        name: "proPrice",
        message: "Pro tier price ($/month)",
        initial: 19,
        min: 0,
      },
      {
        type: "multiselect",
        name: "channels",
        message: "Launch channels (space to select)",
        choices: [
          { title: "GitHub", value: "github" },
          { title: "Hacker News", value: "hackernews" },
          { title: "Reddit", value: "reddit" },
          { title: "Dev.to", value: "devto" },
          { title: "Product Hunt", value: "producthunt" },
          { title: "Twitter/X", value: "twitter" },
        ],
        instructions: false,
      },
      {
        type: "toggle",
        name: "stripe",
        message: "Will you use Stripe for payments?",
        initial: true,
        active: "yes",
        inactive: "no",
      },
      {
        type: "select",
        name: "analytics",
        message: "Analytics provider",
        choices: [
          { title: "Firebase / Google Analytics", value: "firebase" },
          { title: "PostHog", value: "posthog" },
          { title: "Plausible", value: "plausible" },
          { title: "None yet", value: "none" },
        ],
      },
      {
        type: "select",
        name: "email",
        message: "Email provider",
        choices: [
          { title: "Amazon SES", value: "ses" },
          { title: "Resend", value: "resend" },
          { title: "SendGrid", value: "sendgrid" },
          { title: "None yet", value: "none" },
        ],
      },
    ]);

    if (!answers.name) {
      console.log(chalk.dim("Setup cancelled."));
      return;
    }

    const spinner = ora("Forging monetready.yaml…").start();

    const spec: MonetreadySpec = createDefaultSpec({
      product: {
        name: answers.name as string,
        tagline: answers.tagline as string,
        problem: answers.problem as string,
        solution: answers.solution as string,
      },
      pricing: {
        model: "freemium",
        currency: "usd",
        tiers: [
          { name: "Free", price: 0, interval: "month", features: ["Core features", "Community support"] },
          {
            name: "Pro",
            price: answers.proPrice as number,
            interval: "month",
            features: ["Everything in Free", "Priority support", "Advanced features"],
          },
        ],
      },
      gtm: {
        channels: (answers.channels as MonetreadySpec["gtm"]["channels"]) ?? ["github", "hackernews"],
        unfair_advantage: answers.advantage as string,
        target_audience: answers.audience as string,
      },
      integrations: {
        stripe: answers.stripe as boolean,
        analytics: answers.analytics as MonetreadySpec["integrations"]["analytics"],
        email: answers.email as MonetreadySpec["integrations"]["email"],
      },
      playbooks: [...DEFAULT_PLAYBOOK_IDS],
    });

    await writeFile(specPath, serializeMonetreadySpec(spec), "utf-8");
    spinner.succeed(chalk.green("monetready.yaml created"));

    console.log();
    console.log(chalk.bold("  You're set up! Run these next:"));
    console.log(`  ${chalk.cyan("monetready score")}           Audit revenue readiness`);
    console.log(`  ${chalk.cyan("monetready generate pages")}  Create landing + pricing pages`);
    console.log(`  ${chalk.cyan("monetready launch")}         Full launch pipeline (recommended)`);
    console.log(`  ${chalk.cyan("monetready dashboard")}       Visual dashboard`);
    console.log();
  });
