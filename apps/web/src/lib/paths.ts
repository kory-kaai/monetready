import { existsSync } from "node:fs";
import { join } from "node:path";

export function getMonorepoRoot(): string {
  const candidates = [
    join(process.cwd(), "../.."),
    join(process.cwd(), ".."),
    process.cwd(),
  ];

  for (const candidate of candidates) {
    if (existsSync(join(candidate, "monetready.yaml"))) {
      return candidate;
    }
  }

  return join(process.cwd(), "../..");
}
