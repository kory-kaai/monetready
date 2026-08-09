import { scoreProject } from "@monetready/core";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { formatScoreReport } from "../ui/score-report.js";

export const scoreCommand = new Command("score")
  .description("Run Monetready Score — audit your product's revenue readiness")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("--json", "Output as JSON")
  .option(
    "--min-score <n>",
    "Exit with code 1 if total score is below this threshold (0–100)",
    (value) => Number.parseInt(value, 10),
  )
  .action(async (options: { path: string; json?: boolean; minScore?: number }) => {
    const spinner = ora("Analyzing project signals…").start();

    try {
      const { spec, result } = await scoreProject(options.path);
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify({ product: spec.product.name, ...result }, null, 2));
      } else {
        console.log();
        console.log(formatScoreReport(spec.product.name, result));
        console.log();

        if (!result.readyToLaunch) {
          console.log(chalk.yellow("Not launch-ready yet. Run `monetready fire` for a full checklist."));
        } else {
          console.log(chalk.green("You're launch-ready. Run `monetready fire` to go."));
        }
        console.log();
      }

      if (options.minScore !== undefined) {
        if (Number.isNaN(options.minScore)) {
          console.error(chalk.red("--min-score must be a number between 0 and 100."));
          process.exit(1);
        }

        if (result.total < options.minScore) {
          if (!options.json) {
            console.error(
              chalk.red(
                `Score ${result.total}/${result.maxTotal} is below minimum ${options.minScore}.`,
              ),
            );
          }
          process.exit(1);
        }
      }
    } catch (error) {
      spinner.fail("Score failed");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
