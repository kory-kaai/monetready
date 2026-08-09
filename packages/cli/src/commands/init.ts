import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createDefaultSpec, serializeMonetreadySpec } from "monetready-core";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

export const initCommand = new Command("init")
  .description("Create a monetready.yaml product spec in the current directory")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("-n, --name <name>", "Product name")
  .option("-f, --force", "Overwrite existing monetready.yaml")
  .action(async (options: { path: string; name?: string; force?: boolean }) => {
    const spinner = ora("Forging monetready.yaml…").start();
    const specPath = join(options.path, "monetready.yaml");

    if (!options.force) {
      try {
        const { access } = await import("node:fs/promises");
        await access(specPath);
        spinner.fail("monetready.yaml already exists. Use --force to overwrite.");
        process.exit(1);
      } catch {
        // file doesn't exist — good
      }
    }

    const spec = createDefaultSpec(
      options.name ? { product: { ...createDefaultSpec().product, name: options.name } } : {},
    );

    await writeFile(specPath, serializeMonetreadySpec(spec), "utf-8");
    spinner.succeed(chalk.green("monetready.yaml created"));

    console.log();
    console.log(chalk.bold("Next steps:"));
    console.log(`  1. Run ${chalk.cyan("monetready setup")} for a guided wizard (recommended)`);
    console.log(`  2. Or edit ${chalk.cyan("monetready.yaml")} manually`);
    console.log(`  3. Run ${chalk.cyan("monetready launch")} for the full pipeline`);
    console.log();
  });
