import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(rootDir, "playbooks");
const targets = [
  join(rootDir, "packages/core/playbooks"),
  join(rootDir, "templates/default/playbooks"),
];

async function copyPlaybooks(source, destination) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });

  const files = await readdir(source);
  for (const file of files) {
    if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      await cp(join(source, file), join(destination, file));
    }
  }
}

const sourceFiles = await readdir(sourceDir);
const yamlCount = sourceFiles.filter((file) => file.endsWith(".yaml") || file.endsWith(".yml")).length;

if (yamlCount === 0) {
  console.error("No playbook YAML files found in playbooks/");
  process.exit(1);
}

for (const target of targets) {
  await copyPlaybooks(sourceDir, target);
  console.log(`Synced ${yamlCount} playbooks -> ${target}`);
}
