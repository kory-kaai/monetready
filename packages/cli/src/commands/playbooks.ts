import {
  findPlaybooksDir,
  loadMonetreadySpec,
  loadPlaybookById,
  loadPlaybooks,
  pollAnalyticsPlaybooks,
  runPlaybook,
  runScheduledPlaybooks,
} from "@monetready/core";
import chalk from "chalk";
import { Command } from "commander";
import { join } from "node:path";
import ora from "ora";

const playbooksCmd = new Command("playbooks")
  .description("Revenue playbooks — automated lifecycle actions");

playbooksCmd
  .command("list")
  .description("List available revenue playbooks")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .action(async (options: { path: string }) => {
    const playbooksDir = await findPlaybooksDir(options.path);
    if (!playbooksDir) {
      console.error(chalk.red("No playbooks directory found."));
      process.exit(1);
    }

    const playbooks = await loadPlaybooks(playbooksDir);
    console.log();
    console.log(chalk.bold("  Revenue Playbooks"));
    console.log(chalk.dim("  ─────────────────"));
    console.log();

    for (const pb of playbooks) {
      const badge = pb.category === "conversion" ? chalk.green("conversion")
        : pb.category === "retention" ? chalk.yellow("retention")
        : pb.category === "growth" ? chalk.blue("growth")
        : chalk.magenta("onboarding");

      console.log(`  ${chalk.bold(pb.name)} ${chalk.dim(`(${pb.id})`)}`);
      console.log(`  ${badge} · ${pb.description}`);
      console.log(`  ${chalk.dim(`Trigger: ${pb.trigger.type}/${pb.trigger.event}`)}`);
      console.log();
    }
  });

playbooksCmd
  .command("run <id>")
  .description("Run a playbook (dry-run by default)")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("--execute", "Actually execute actions (requires integrations)")
  .action(async (id: string, options: { path: string; execute?: boolean }) => {
    const spinner = ora(`Running playbook ${id}…`).start();

    try {
      const playbooksDir = await findPlaybooksDir(options.path);
      if (!playbooksDir) {
        spinner.fail("No playbooks directory found.");
        process.exit(1);
      }

      const playbook = await loadPlaybookById(playbooksDir, id);
      if (!playbook) {
        spinner.fail(`Playbook "${id}" not found. Run monetready playbooks list.`);
        process.exit(1);
      }

      const specPath = join(options.path, "monetready.yaml");
      const spec = await loadMonetreadySpec(specPath);
      const result = await runPlaybook(playbook, spec, { dryRun: !options.execute });

      const hasErrors = result.actions.some((action) => action.status === "error");
      spinner.succeed(
        options.execute
          ? hasErrors
            ? `Playbook ${id} finished with errors`
            : `Playbook ${id} executed`
          : `Playbook ${id} simulated (use --execute to run for real)`,
      );

      console.log();
      for (const action of result.actions) {
        const label =
          action.status === "error"
            ? chalk.red(`[${action.type}]`)
            : chalk.bold(`[${action.type}]`);
        console.log(label);
        console.log(action.output.split("\n").map((l) => `  ${l}`).join("\n"));
        console.log();
      }

      if (hasErrors) {
        process.exit(1);
      }
    } catch (error) {
      spinner.fail("Playbook run failed");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

playbooksCmd
  .command("poll")
  .description("Poll PostHog for inactive users and trigger matching playbooks")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("--execute", "Send emails and execute actions (requires integrations)")
  .option("--hours <hours>", "Inactive threshold in hours", "48")
  .action(async (options: { path: string; execute?: boolean; hours: string }) => {
    const spinner = ora("Polling PostHog for inactive users…").start();

    try {
      const playbooksDir = await findPlaybooksDir(options.path);
      if (!playbooksDir) {
        spinner.fail("No playbooks directory found.");
        process.exit(1);
      }

      const spec = await loadMonetreadySpec(join(options.path, "monetready.yaml"));
      const result = await pollAnalyticsPlaybooks({
        projectRoot: options.path,
        playbooksDir,
        spec,
        dryRun: !options.execute,
        inactiveHours: Number.parseInt(options.hours, 10),
      });

      spinner.succeed(
        `Found ${result.usersFound} inactive users · triggered ${result.playbooksTriggered} playbook run(s)`,
      );

      console.log();
      for (const run of result.runs) {
        console.log(
          chalk.bold(`  ${run.playbookId}`) +
            chalk.dim(` → ${run.user.distinctId}`) +
            (run.user.email ? chalk.dim(` (${run.user.email})`) : ""),
        );
        for (const action of run.result.actions) {
          const prefix = action.status === "error" ? chalk.red("[error]") : chalk.dim(`[${action.type}]`);
          console.log(`    ${prefix} ${action.output.split("\n")[0]}`);
        }
        console.log();
      }

      if (!options.execute) {
        console.log(chalk.dim("  Dry-run mode. Use --execute to send emails and run actions."));
      }
    } catch (error) {
      spinner.fail("Poll failed");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

playbooksCmd
  .command("schedule")
  .description("Run playbooks whose schedule trigger matches the current time")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("--execute", "Execute actions (default is dry-run preview)")
  .action(async (options: { path: string; execute?: boolean }) => {
    const spinner = ora("Checking scheduled playbooks…").start();

    try {
      const playbooksDir = await findPlaybooksDir(options.path);
      if (!playbooksDir) {
        spinner.fail("No playbooks directory found.");
        process.exit(1);
      }

      const spec = await loadMonetreadySpec(join(options.path, "monetready.yaml"));
      const result = await runScheduledPlaybooks({
        playbooksDir,
        spec,
        dryRun: !options.execute,
      });

      if (result.matched.length === 0) {
        spinner.succeed("No scheduled playbooks match the current time");
        return;
      }

      spinner.succeed(`Ran ${result.matched.length} scheduled playbook(s)`);
      console.log();
      for (const run of result.runs) {
        console.log(chalk.bold(`  ${run.playbookId}`) + chalk.dim(` (${run.status})`));
        for (const action of run.actions) {
          const prefix = action.status === "error" ? chalk.red("[error]") : chalk.dim(`[${action.type}]`);
          console.log(`    ${prefix} ${action.output.split("\n")[0]}`);
        }
        console.log();
      }
    } catch (error) {
      spinner.fail("Schedule run failed");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const playbooksCommand = playbooksCmd;
