import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { Playbook, PlaybookSchema } from "./types.js";

export async function loadPlaybooks(playbooksDir: string): Promise<Playbook[]> {
  let files: string[];
  try {
    files = await readdir(playbooksDir);
  } catch {
    return [];
  }

  const playbooks: Playbook[] = [];

  for (const file of files) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) {
      continue;
    }

    const raw = await readFile(join(playbooksDir, file), "utf-8");
    const parsed = parseYaml(raw);
    playbooks.push(PlaybookSchema.parse(parsed));
  }

  return playbooks.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadPlaybookById(
  playbooksDir: string,
  id: string,
): Promise<Playbook | null> {
  const playbooks = await loadPlaybooks(playbooksDir);
  return playbooks.find((p) => p.id === id) ?? null;
}
