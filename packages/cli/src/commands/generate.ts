import chalk from "chalk";
import { Command } from "commander";
import { join } from "node:path";
import ora from "ora";
import { loadMonetreadySpec, scoreProject, writeGeneratedPages } from "@monetready/core";

export const generateCommand = new Command("generate")
  .description("Generate launch assets from monetready.yaml");

generateCommand
  .command("pages")
  .description("Generate landing and pricing pages")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("-o, --out <dir>", "Output directory", ".monetready/pages")
  .option("--no-report", "Skip Revenue Readiness Report")
  .action(async (options: { path: string; out: string; noReport?: boolean }) => {
    const spinner = ora("Generating pages from monetready.yaml…").start();

    try {
      const specPath = join(options.path, "monetready.yaml");
      const spec = await loadMonetreadySpec(specPath);
      const outputDir = join(options.path, options.out);

      let scoreResult;
      if (!options.noReport) {
        const scored = await scoreProject(options.path);
        scoreResult = scored.result;
      }

      const result = await writeGeneratedPages(spec, {
        outputDir,
        includeReport: !options.noReport,
        score: scoreResult,
      });
      spinner.succeed(`Generated ${result.files.length} pages`);

      console.log();
      console.log(chalk.bold("  Output"));
      for (const file of result.files) {
        console.log(`  ${chalk.cyan(join(result.outputDir, file))}`);
      }
      console.log();
      console.log(chalk.dim("  Preview locally:"));
      console.log(chalk.dim(`  npx serve ${result.outputDir}`));
      console.log();
    } catch (error) {
      spinner.fail("Page generation failed");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
