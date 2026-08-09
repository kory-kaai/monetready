import { access, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { loadMonetreadySpec } from "../spec/loader.js";
import type { MonetreadySpec } from "../schema/monetready-spec.js";
import { WorkspaceSchema, type Workspace, type WorkspaceProduct } from "./types.js";

export async function loadWorkspace(workspaceRoot: string): Promise<Workspace | null> {
  const workspacePath = join(workspaceRoot, ".monetready", "workspace.yaml");

  try {
    await access(workspacePath);
  } catch {
    return null;
  }

  const raw = await readFile(workspacePath, "utf-8");
  return WorkspaceSchema.parse(parseYaml(raw));
}

export async function resolveWorkspaceProducts(
  workspaceRoot: string,
  workspace: Workspace | null,
): Promise<WorkspaceProduct[]> {
  if (workspace) {
    const products = workspace.products.map((product) => ({
      ...product,
      path: resolve(workspaceRoot, product.path),
    }));

    for (const product of products) {
      await validateWorkspaceProduct(product);
    }

    return products;
  }

  try {
    const spec = await loadMonetreadySpec(join(workspaceRoot, "monetready.yaml"));
    return [
      {
        id: slugifyProductId(spec.product.name),
        name: spec.product.name,
        path: resolve(workspaceRoot),
      },
    ];
  } catch {
    return [
      {
        id: "default",
        name: basename(workspaceRoot) || "Project",
        path: resolve(workspaceRoot),
      },
    ];
  }
}

export async function resolveWorkspaceProduct(
  workspaceRoot: string,
  productId?: string,
): Promise<WorkspaceProduct> {
  const workspace = await loadWorkspace(workspaceRoot);
  const products = await resolveWorkspaceProducts(workspaceRoot, workspace);

  if (!productId) {
    return products[0];
  }

  const match = products.find((product) => product.id === productId);
  if (!match) {
    throw new Error(`Workspace product "${productId}" not found`);
  }

  return match;
}

export async function loadWorkspaceOverview(workspaceRoot: string): Promise<{
  workspace: Workspace | null;
  products: Array<WorkspaceProduct & { spec?: MonetreadySpec }>;
}> {
  const workspace = await loadWorkspace(workspaceRoot);
  const products = await resolveWorkspaceProducts(workspaceRoot, workspace);

  const enriched = await Promise.all(
    products.map(async (product) => {
      try {
        const spec = await loadMonetreadySpec(join(product.path, "monetready.yaml"));
        return { ...product, spec };
      } catch {
        return product;
      }
    }),
  );

  return { workspace, products: enriched };
}

function slugifyProductId(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function validateWorkspaceProduct(product: WorkspaceProduct): Promise<void> {
  try {
    await access(product.path);
  } catch {
    throw new Error(`Workspace product "${product.id}" path does not exist: ${product.path}`);
  }

  try {
    await access(join(product.path, "monetready.yaml"));
  } catch {
    throw new Error(`Workspace product "${product.id}" is missing monetready.yaml at ${product.path}`);
  }
}
