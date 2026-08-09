import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { loadMonetreadySpec, type MonetreadySpec } from "@monetready/core";

export const getSiteSpec = cache(async (): Promise<MonetreadySpec> => {
  const paths = [
    join(process.cwd(), "../../monetready.yaml"),
    join(process.cwd(), "monetready.yaml"),
  ];

  for (const specPath of paths) {
    try {
      return await loadMonetreadySpec(specPath);
    } catch {
      // try next path
    }
  }

  const { createDefaultSpec } = await import("@monetready/core");
  return createDefaultSpec({
    product: {
      name: "Monetready",
      tagline: "Turn raw ideas into revenue-ready products",
      problem: "Indie hackers ship MVPs but fail at pricing, distribution, and conversion",
      solution: "Monetready audits, automates, and launches your product with business-aware tooling",
    },
  });
});

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function productEmail(spec: MonetreadySpec, prefix: string): string {
  return `${prefix}@${slugify(spec.product.name)}.com`;
}
