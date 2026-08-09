import { cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(rootDir, "templates/default");
const targetDir = join(rootDir, "packages/create-monetready/template");

await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });
console.log(`Synced template -> ${targetDir}`);
