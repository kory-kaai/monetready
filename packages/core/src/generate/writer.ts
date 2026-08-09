import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildLaunchChecklist } from "../launch/checklist.js";
import type { MonetreadySpec } from "../schema/monetready-spec.js";
import type { MonetreadyScoreResult } from "../score/types.js";
import { generatePages } from "./pages.js";
import { generateAllLegalPages } from "./legal.js";
import { generateReadinessReport } from "./report.js";

export interface GeneratePagesOptions {
  outputDir: string;
  includeReport?: boolean;
  score?: MonetreadyScoreResult;
  checklist?: string[];
  nextSteps?: string[];
}

export interface GeneratePagesResult {
  outputDir: string;
  files: string[];
}

export async function writeGeneratedPages(
  spec: MonetreadySpec,
  options: GeneratePagesOptions,
): Promise<GeneratePagesResult> {
  const { landing, pricing } = generatePages(spec);
  const outputDir = options.outputDir;

  await mkdir(outputDir, { recursive: true });

  const files: Array<{ name: string; content: string }> = [
    { name: "index.html", content: landing },
    { name: "pricing.html", content: pricing },
  ];

  const legalPages = generateAllLegalPages(spec);
  for (const [name, content] of Object.entries(legalPages)) {
    files.push({ name, content });
  }

  if (options.includeReport && options.score) {
    const fire = options.checklist
      ? { checklist: options.checklist, nextSteps: options.nextSteps ?? [] }
      : buildLaunchChecklist(spec, options.score);

    files.push({
      name: "readiness-report.html",
      content: generateReadinessReport(
        spec,
        options.score,
        fire.checklist,
        fire.nextSteps,
      ),
    });
  }

  for (const file of files) {
    await writeFile(join(outputDir, file.name), file.content, "utf-8");
  }

  return {
    outputDir,
    files: files.map((f) => f.name),
  };
}
