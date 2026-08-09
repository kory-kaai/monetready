import { readFile } from "node:fs/promises";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { DEFAULT_MONETREADY_SPEC, MonetreadySpec, MonetreadySpecSchema } from "../schema/monetready-spec.js";

export async function loadMonetreadySpec(filePath: string): Promise<MonetreadySpec> {
  const raw = await readFile(filePath, "utf-8");
  const parsed = parseYaml(raw);
  return MonetreadySpecSchema.parse(parsed);
}

export function serializeMonetreadySpec(spec: MonetreadySpec): string {
  return stringifyYaml(spec, { lineWidth: 0 });
}

export function createDefaultSpec(overrides: Partial<MonetreadySpec> = {}): MonetreadySpec {
  return MonetreadySpecSchema.parse({
    ...DEFAULT_MONETREADY_SPEC,
    ...overrides,
    product: { ...DEFAULT_MONETREADY_SPEC.product, ...overrides.product },
    pricing: { ...DEFAULT_MONETREADY_SPEC.pricing, ...overrides.pricing },
    gtm: { ...DEFAULT_MONETREADY_SPEC.gtm, ...overrides.gtm },
    integrations: { ...DEFAULT_MONETREADY_SPEC.integrations, ...overrides.integrations },
  });
}
