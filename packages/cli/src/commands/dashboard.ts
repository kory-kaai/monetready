import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { startDashboardServer } from "monetready-core";

export const dashboardCommand = new Command("dashboard")
  .description("Start the local-first Monetready dashboard")
  .option("-p, --path <dir>", "Project directory", process.cwd())
  .option("--port <port>", "Port to listen on", "3721")
  .option("--host <host>", "Host to bind", "127.0.0.1")
  .option("--open", "Open dashboard in browser after start")
  .option("--allow-execute", "Allow live playbook execution from the dashboard UI")
  .action(async (options: { path: string; port: string; host: string; open?: boolean; allowExecute?: boolean }) => {
    const spinner = ora("Starting Monetready dashboard…").start();

    try {
      const port = Number.parseInt(options.port, 10);
      const handle = await startDashboardServer({
        port,
        host: options.host,
        projectRoot: options.path,
        allowPlaybookExecute: options.allowExecute,
      });

      const url = `http://${options.host}:${handle.port}`;
      spinner.succeed(`Monetready dashboard running at ${chalk.cyan(url)}`);

      console.log();
      console.log(chalk.bold("  Dashboard"));
      console.log(`  ${chalk.cyan(url)}`);
      console.log();
      console.log(chalk.dim("  Features: Monetready Score, findings, launch checklist, playbooks"));
      if (options.allowExecute || process.env.MONETREADY_DASHBOARD_EXECUTE === "true") {
        console.log(chalk.yellow("  Live playbook execution: enabled"));
      } else {
        console.log(chalk.dim("  Live execution: off (use --allow-execute or MONETREADY_DASHBOARD_EXECUTE=true)"));
      }
      console.log(chalk.dim("  Press Ctrl+C to stop"));
      console.log();

      if (options.open) {
        const open = (await import("node:child_process")).spawn;
        const cmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
        open(cmd, [url], { shell: true, detached: true, stdio: "ignore" }).unref();
      }

      await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
          console.log(chalk.dim("\n  Shutting down…"));
          void handle.close().then(resolve);
        });
      });
    } catch (error) {
      spinner.fail("Failed to start dashboard");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
