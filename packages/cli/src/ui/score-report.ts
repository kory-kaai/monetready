import type { MonetreadyScoreResult } from "@monetready/core";
import chalk from "chalk";

const CATEGORY_LABELS: Record<string, string> = {
  pricing: "Pricing",
  onboarding: "Onboarding",
  conversion: "Conversion",
  distribution: "Distribution",
  integrations: "Integrations",
  differentiation: "Differentiation",
};

const SEVERITY_ICON: Record<string, string> = {
  critical: chalk.red("✗"),
  warning: chalk.yellow("!"),
  info: chalk.blue("i"),
  pass: chalk.green("✓"),
};

function scoreBar(score: number, max: number, width = 20): string {
  const filled = Math.round((score / max) * width);
  const empty = width - filled;
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? chalk.green : pct >= 50 ? chalk.yellow : chalk.red;
  return color("█".repeat(filled)) + chalk.dim("░".repeat(empty)) + chalk.dim(` ${pct}%`);
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return chalk.green.bold(grade);
    case "B":
      return chalk.green(grade);
    case "C":
      return chalk.yellow(grade);
    case "D":
      return chalk.red(grade);
    default:
      return chalk.red.bold(grade);
  }
}

export function formatScoreReport(productName: string, result: MonetreadyScoreResult): string {
  const lines: string[] = [];
  const totalPct = Math.round((result.total / result.maxTotal) * 100);

  lines.push(chalk.bold(`  Monetready Score — ${productName}`));
  lines.push(chalk.dim("  ─────────────────────────────"));
  lines.push("");
  lines.push(
    `  ${chalk.bold("Score:")} ${chalk.bold.white(`${result.total}/${result.maxTotal}`)} ` +
    `(${totalPct}%)  Grade: ${gradeColor(result.grade)}` +
    (result.readyToLaunch ? chalk.green("  ✓ Launch-ready") : ""),
  );
  lines.push("");

  for (const cat of result.categories) {
    const label = CATEGORY_LABELS[cat.category] ?? cat.category;
    lines.push(`  ${chalk.bold(label.padEnd(16))} ${scoreBar(cat.score, cat.maxScore)}`);
  }

  lines.push("");
  lines.push(chalk.bold("  Findings"));

  const important = result.categories
    .flatMap((c) => c.findings)
    .filter((f) => f.severity !== "pass")
    .slice(0, 8);

  if (important.length === 0) {
    lines.push(chalk.green("  ✓ All checks passed — you're in great shape."));
  } else {
    for (const f of important) {
      const icon = SEVERITY_ICON[f.severity] ?? "·";
      lines.push(`  ${icon} ${chalk.bold(f.title)}`);
      lines.push(`    ${chalk.dim(f.recommendation)}`);
    }
  }

  return lines.join("\n");
}
