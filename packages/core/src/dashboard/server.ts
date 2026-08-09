import type { ServerResponse } from "node:http";
import { createServer } from "node:http";
import { join } from "node:path";
import { access } from "node:fs/promises";
import { buildLaunchChecklist } from "../launch/checklist.js";
import { loadPlaybookById, loadPlaybooks } from "../playbooks/loader.js";
import { runPlaybook } from "../playbooks/runner.js";
import { findPlaybooksDir, scoreProject } from "../project.js";
import {
  loadWorkspaceOverview,
  resolveWorkspaceProduct,
} from "../workspace/loader.js";
import { buildDashboardHtml } from "./ui.js";

export interface DashboardServerOptions {
  port?: number;
  host?: string;
  projectRoot: string;
  allowPlaybookExecute?: boolean;
}

export function resolveDashboardExecuteEnabled(
  env: NodeJS.ProcessEnv = process.env,
  option?: boolean,
): boolean {
  if (option !== undefined) {
    return option;
  }

  return env.MONETREADY_DASHBOARD_EXECUTE === "true";
}

export interface DashboardServerHandle {
  port: number;
  close: () => Promise<void>;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendHtml(res: ServerResponse, html: string): void {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

export async function startDashboardServer(
  options: DashboardServerOptions,
): Promise<DashboardServerHandle> {
  const port = options.port ?? 3721;
  const host = options.host ?? "127.0.0.1";
  const workspaceRoot = options.projectRoot;
  const allowPlaybookExecute = resolveDashboardExecuteEnabled(
    process.env,
    options.allowPlaybookExecute,
  );

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${host}`);
    const pathname = url.pathname;
    const productId = url.searchParams.get("product") ?? undefined;

    try {
      if (req.method === "GET" && pathname === "/") {
        sendHtml(res, buildDashboardHtml());
        return;
      }

      if (req.method === "GET" && pathname === "/api/health") {
        sendJson(res, 200, { status: "ok", service: "monetready-dashboard" });
        return;
      }

      if (req.method === "GET" && pathname === "/api/workspace") {
        const overview = await loadWorkspaceOverview(workspaceRoot);
        sendJson(res, 200, {
          multiProduct: overview.workspace !== null || overview.products.length > 1,
          products: overview.products.map((product) => ({
            id: product.id,
            name: product.name,
          })),
        });
        return;
      }

      if (req.method === "GET" && pathname === "/api/overview") {
        const product = await resolveWorkspaceProduct(workspaceRoot, productId);
        const projectRoot = product.path;

        const { spec, result } = await scoreProject(projectRoot);
        const fire = buildLaunchChecklist(spec, result);
        const playbooksDir = await findPlaybooksDir(projectRoot);
        const allPlaybooks = playbooksDir ? await loadPlaybooks(playbooksDir) : [];
        const pagesDir = join(projectRoot, ".monetready", "pages");
        let pagesGenerated = false;
        try {
          await access(join(pagesDir, "index.html"));
          pagesGenerated = true;
        } catch {
          // not generated yet
        }

        sendJson(res, 200, {
          product: {
            id: product.id,
            name: product.name,
            path: product.path,
          },
          playbookExecuteEnabled: allowPlaybookExecute,
          spec,
          score: result,
          checklist: fire.checklist,
          nextSteps: fire.nextSteps,
          pagesGenerated,
          pagesPath: ".monetready/pages",
          playbooks: allPlaybooks.map((pb) => ({
            id: pb.id,
            name: pb.name,
            description: pb.description,
            category: pb.category,
            trigger: pb.trigger,
            enabled: spec.playbooks.includes(pb.id),
          })),
        });
        return;
      }

      const playbookMatch = pathname.match(/^\/api\/playbooks\/([^/]+)\/run$/);
      if (req.method === "POST" && playbookMatch) {
        const playbookId = decodeURIComponent(playbookMatch[1]);
        const execute = url.searchParams.get("execute") === "true";
        const product = await resolveWorkspaceProduct(workspaceRoot, productId);
        const projectRoot = product.path;
        const playbooksDir = await findPlaybooksDir(projectRoot);
        if (!playbooksDir) {
          sendJson(res, 500, { error: "Playbooks directory not found" });
          return;
        }

        const { spec } = await scoreProject(projectRoot);
        const playbook = await loadPlaybookById(playbooksDir, playbookId);

        if (!playbook) {
          sendJson(res, 404, { error: `Playbook "${playbookId}" not found` });
          return;
        }

        if (execute && !allowPlaybookExecute) {
          sendJson(res, 403, {
            error:
              "Live playbook execution is disabled. Set MONETREADY_DASHBOARD_EXECUTE=true or use monetready dashboard --allow-execute.",
          });
          return;
        }

        const result = await runPlaybook(playbook, spec, { dryRun: !execute });
        sendJson(res, 200, result);
        return;
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });

  const address = server.address();
  const boundPort = typeof address === "object" && address ? address.port : port;

  return {
    port: boundPort,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

export function getDefaultDashboardDataPath(projectRoot: string): string {
  return join(projectRoot, ".monetready");
}
