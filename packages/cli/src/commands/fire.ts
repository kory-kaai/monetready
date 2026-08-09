import { buildLaunchChecklist, loadMonetreadySpec, scoreProject } from "@monetready/core";
import chalk from "chalk";
import { Command } from "commander";
import { join } from "node:path";
import ora from "ora";
import { formatScoreReport } from "../ui/score-report.js";

export const fireCommand = new Command("fire")
  .description("Launch pipeline — score, checklist, and next steps")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .action(async (options: { path: string }) => {
    const spinner = ora("Firing up launch pipeline…").start();

    try {
      const { result } = await scoreProject(options.path);
      const specPath = join(options.path, "monetready.yaml");
      const spec = await loadMonetreadySpec(specPath).catch(() => {
        throw new Error("monetready.yaml not found. Run `monetready init` first.");
      });

      const fire = buildLaunchChecklist(spec, result);
      spinner.succeed("Launch pipeline ready");

      console.log();
      console.log(chalk.bold.red("  🔥 MONETREADY FIRE — Launch Pipeline"));
      console.log(chalk.dim("  ─────────────────────────────────"));
      console.log();
      console.log(formatScoreReport(spec.product.name, fire.score));
      console.log();
      console.log(chalk.bold("  Launch Checklist"));
      for (const item of fire.checklist) {
        console.log(`  ${item}`);
      }
      console.log();
      console.log(chalk.bold("  Top Next Steps"));
      fire.nextSteps.forEach((step, i) => {
        console.log(`  ${chalk.cyan(`${i + 1}.`)} ${step}`);
      });
      console.log();
      console.log(chalk.dim(`  GTM channels: ${spec.gtm.channels.join(", ") || "none defined"}`));
      if (spec.gtm.launch_date) {
        console.log(chalk.dim(`  Launch date: ${spec.gtm.launch_date}`));
      }
      console.log();
    } catch (error) {
      spinner.fail("Fire pipeline failed");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
