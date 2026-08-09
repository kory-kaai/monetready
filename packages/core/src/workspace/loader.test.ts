import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveWorkspaceProducts } from "./loader.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("resolveWorkspaceProducts", () => {
  it("falls back to monetready.yaml product when no workspace file exists", async () => {
    const products = await resolveWorkspaceProducts(repoRoot, null);

    expect(products.length).toBe(1);
    expect(products[0]?.name).toBe("Monetready");
  });

  it("resolves workspace product paths relative to workspace root", async () => {
    const products = await resolveWorkspaceProducts(repoRoot, {
      version: "1",
      products: [
        { id: "monetready", name: "Monetready", path: "." },
      ],
    });

    expect(products).toHaveLength(1);
    expect(products[0]?.id).toBe("monetready");
    expect(products[0]?.path).toBe(repoRoot);
  });

  it("rejects workspace products with missing paths", async () => {
    await expect(
      resolveWorkspaceProducts(repoRoot, {
        version: "1",
        products: [{ id: "demo", name: "Demo SaaS", path: "examples/demo" }],
      }),
    ).rejects.toThrow('Workspace product "demo" path does not exist');
  });
});
