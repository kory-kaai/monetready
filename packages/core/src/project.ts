import { join, resolve, dirname } from "node:path";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { calculateMonetreadyScore } from "./score/engine.js";
import { detectProjectSignals } from "./score/signals.js";
import type { MonetreadyScoreResult } from "./score/types.js";
import { createDefaultSpec, loadMonetreadySpec } from "./spec/loader.js";
import type { MonetreadySpec } from "./schema/monetready-spec.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function findPlaybooksDir(startDir: string): Promise<string | null> {
  let current = resolve(startDir);

  for (let i = 0; i < 8; i++) {
    const candidate = join(current, "playbooks");
    try {
      await access(candidate);
      return candidate;
    } catch {
      // continue upward
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  const bundled = resolve(__dirname, "../playbooks");
  try {
    await access(bundled);
    return bundled;
  } catch {
    // Monorepo dev fallback
  }

  const monorepoBundled = resolve(__dirname, "../../../playbooks");
  try {
    await access(monorepoBundled);
    return monorepoBundled;
  } catch {
    return null;
  }
}

export async function scoreProject(
  projectRoot: string,
  specPath?: string,
): Promise<{ spec: MonetreadySpec; result: MonetreadyScoreResult }> {
  const monetreadyYaml = specPath ?? join(projectRoot, "monetready.yaml");
  let spec: MonetreadySpec;

  try {
    spec = await loadMonetreadySpec(monetreadyYaml);
  } catch {
    spec = createDefaultSpec();
  }

  const signals = await detectProjectSignals(projectRoot);
  const result = calculateMonetreadyScore(spec, signals);

  return { spec, result };
}
