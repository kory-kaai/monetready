import chalk from "chalk";
import { Command } from "commander";
import { join } from "node:path";
import ora from "ora";
import {
  findPlaybooksDir,
  getAnalyticsEventMappings,
  getStripeEventMappings,
  loadMonetreadySpec,
  loadPlaybooks,
  resolveMonetreadyWebhookSecret,
  resolveStripeWebhookSecret,
  startWebhookServer,
  type PlaybookRunResult,
} from "monetready-core";

export const serveCommand = new Command("serve")
  .description("Start webhook server for live playbook execution")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("--port <port>", "Port to listen on", "4242")
  .option("--host <host>", "Host to bind", "127.0.0.1")
  .option(
    "--allow-unsigned-stripe",
    "Accept Stripe webhooks without signature verification (local dev only)",
  )
  .action(async (options: { path: string; port: string; host: string; allowUnsignedStripe?: boolean }) => {
    const spinner = ora("Starting Monetready webhook server…").start();

    try {
      const specPath = join(options.path, "monetready.yaml");
      const spec = await loadMonetreadySpec(specPath);

      const playbooksDir = await findPlaybooksDir(options.path);
      if (!playbooksDir) {
        spinner.fail("No playbooks directory found.");
        process.exit(1);
      }

      const playbooks = await loadPlaybooks(playbooksDir);
      const stripeSecret = resolveStripeWebhookSecret();
      const monetreadySecret = resolveMonetreadyWebhookSecret();
      const port = Number.parseInt(options.port, 10);

      const handle = await startWebhookServer({
        port,
        host: options.host,
        projectRoot: options.path,
        playbooksDir,
        spec,
        stripeWebhookSecret: stripeSecret,
        monetreadyWebhookSecret: monetreadySecret,
        allowUnsignedStripe: options.allowUnsignedStripe ?? !stripeSecret,
        onPlaybookRun: (result: PlaybookRunResult, event: string) => {
          const statusColor = result.status === "failed" ? chalk.red : chalk.green;
          console.log(statusColor(`\n  Playbook ${result.playbookId} (${result.status}) for ${event}`));
          for (const action of result.actions) {
            const prefix = action.status === "error" ? chalk.red("[error]") : chalk.dim(`[${action.type}]`);
            console.log(`    ${prefix} ${action.output.split("\n")[0]}`);
          }
        },
      });

      spinner.succeed(`Monetready webhook server running at http://${options.host}:${handle.port}`);

      console.log();
      console.log(chalk.bold("  Endpoints"));
      console.log(`  ${chalk.cyan("GET")}  /health`);
      console.log(`  ${chalk.cyan("POST")} /webhooks/stripe`);
      console.log(`  ${chalk.cyan("POST")} /webhooks/analytics`);
      console.log(`  ${chalk.cyan("POST")} /webhooks/github`);
      console.log();
      console.log(chalk.bold("  Stripe event mapping"));
      for (const mapping of getStripeEventMappings(playbooks)) {
        const enabled = spec.playbooks.includes(mapping.playbookId);
        const badge = enabled ? chalk.green("enabled") : chalk.dim("disabled");
        console.log(`  ${chalk.dim(mapping.event)} -> ${mapping.playbookId} ${badge}`);
      }
      console.log();
      console.log(chalk.bold("  Analytics event mapping"));
      for (const mapping of getAnalyticsEventMappings(playbooks)) {
        const enabled = spec.playbooks.includes(mapping.playbookId);
        const badge = enabled ? chalk.green("enabled") : chalk.dim("disabled");
        const condition = mapping.condition ? chalk.dim(` if ${mapping.condition}`) : "";
        console.log(`  ${chalk.dim(mapping.event)} -> ${mapping.playbookId} ${badge}${condition}`);
      }
      console.log();
      console.log(chalk.bold("  Environment"));
      console.log(
        `  ${stripeSecret ? chalk.green("STRIPE_WEBHOOK_SECRET set") : chalk.yellow("STRIPE_WEBHOOK_SECRET not set")}`,
      );
      console.log(
        `  ${monetreadySecret ? chalk.green("MONETREADY_WEBHOOK_SECRET set") : chalk.yellow("MONETREADY_WEBHOOK_SECRET not set (analytics/github open)")}`,
      );
      console.log();
      console.log(chalk.dim("  Forward Stripe webhooks:"));
      console.log(
        chalk.dim(`  stripe listen --forward-to localhost:${handle.port}/webhooks/stripe`),
      );
      console.log(chalk.dim("  Analytics example:"));
      console.log(
        chalk.dim(
          `  curl -X POST localhost:${handle.port}/webhooks/analytics -H "Content-Type: application/json" -d '{"event":"user.inactive_48h","properties":{"signup_completed":false}}'`,
        ),
      );
      console.log();
      console.log(chalk.dim("  Press Ctrl+C to stop"));

      await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
          console.log(chalk.dim("\n  Shutting down…"));
          void handle.close().then(resolve);
        });
      });
    } catch (error) {
      spinner.fail("Failed to start server");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
