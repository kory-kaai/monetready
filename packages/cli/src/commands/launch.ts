import { join } from "node:path";
import { buildLaunchChecklist, scoreProject, writeGeneratedPages } from "@monetready/core";
import chalk from "chalk";
import { Command } from "commander";
import { access } from "node:fs/promises";
import ora from "ora";
import { formatScoreReport } from "../ui/score-report.js";

export const launchCommand = new Command("launch")
  .description("Full launch pipeline — score, pages, report, and checklist")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("-o, --out <dir>", "Pages output directory", ".monetready/pages")
  .option("--skip-pages", "Skip page generation")
  .action(async (options: { path: string; out: string; skipPages?: boolean }) => {
    console.log();
    console.log(chalk.bold.red("  🔥 MONETREADY LAUNCH"));
    console.log(chalk.dim("  Your one-command path to revenue-ready\n"));

    try {
      await access(join(options.path, "monetready.yaml"));
    } catch {
      console.log(chalk.yellow("  No monetready.yaml found. Run `monetready setup` first.\n"));
      process.exit(1);
    }

    try {
      const scoreSpinner = ora("Running Monetready Score audit…").start();
      const { spec, result } = await scoreProject(options.path);
      scoreSpinner.succeed(`Monetready Score: ${result.total}/${result.maxTotal} (${result.grade})`);

      console.log();
      console.log(formatScoreReport(spec.product.name, result));

      if (!options.skipPages) {
        const pagesSpinner = ora("Generating landing pages + readiness report…").start();
        const fire = buildLaunchChecklist(spec, result);
        const outputDir = join(options.path, options.out);
        const generated = await writeGeneratedPages(spec, {
          outputDir,
          includeReport: true,
          score: result,
          checklist: fire.checklist,
          nextSteps: fire.nextSteps,
        });
        pagesSpinner.succeed(`Generated ${generated.files.length} files`);
        console.log();
        for (const file of generated.files) {
          console.log(`  ${chalk.cyan(join(outputDir, file))}`);
        }
      }

      const fire = buildLaunchChecklist(spec, result);
      console.log();
      console.log(chalk.bold("  Launch checklist"));
      for (const item of fire.checklist) {
        console.log(`  ${item}`);
      }

      console.log();
      console.log(chalk.bold("  Top next steps"));
      fire.nextSteps.forEach((step, i) => {
        console.log(`  ${chalk.cyan(`${i + 1}.`)} ${step}`);
      });

      console.log();
      console.log(chalk.bold("  Go further"));
      console.log(`  ${chalk.cyan("npx serve " + join(options.path, options.out))}  Preview your pages`);
      console.log(`  ${chalk.cyan("monetready dashboard --open")}              Open your dashboard`);
      console.log(`  ${chalk.cyan("monetready serve")}                          Start Stripe webhooks`);
      console.log();

      if (!result.readyToLaunch) {
        console.log(chalk.yellow("  Tip: Fix critical findings above, then run `monetready launch` again."));
        console.log();
      }
    } catch (error) {
      console.error(chalk.red("Launch failed:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
