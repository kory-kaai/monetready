import { join } from "node:path";

export function getMonorepoRoot(): string {
  return join(process.cwd(), "../..");
}
