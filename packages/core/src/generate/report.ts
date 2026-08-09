import type { MonetreadySpec } from "../schema/monetready-spec.js";
import type { MonetreadyScoreResult } from "../score/types.js";
import { escapeHtml } from "./html.js";
import { fontLinks } from "./motion.js";
import { buildThemeStyles } from "./theme.js";

const CATEGORY_LABELS: Record<string, string> = {
  pricing: "Pricing",
  onboarding: "Onboarding",
  conversion: "Conversion",
  distribution: "Distribution",
  integrations: "Integrations",
  differentiation: "Differentiation",
};

export function generateReadinessReport(
  spec: MonetreadySpec,
  score: MonetreadyScoreResult,
  checklist: string[],
  nextSteps: string[],
): string {
  const pct = Math.round((score.total / score.maxTotal) * 100);
  const name = escapeHtml(spec.product.name);
  const grade = score.grade;
  const ready = score.readyToLaunch;

  const categories = score.categories
    .map((cat) => {
      const label = CATEGORY_LABELS[cat.category] ?? cat.category;
      const catPct = Math.round((cat.score / cat.maxScore) * 100);
      return `
      <div class="cat-row">
        <div class="cat-label">${label}</div>
        <div class="cat-bar"><div class="cat-fill" style="width:${catPct}%"></div></div>
        <div class="cat-pct">${catPct}%</div>
      </div>`;
    })
    .join("");

  const findings = score.categories
    .flatMap((c) => c.findings)
    .filter((f) => f.severity !== "pass")
    .map(
      (f) => `
    <div class="finding ${f.severity}">
      <strong>${escapeHtml(f.title)}</strong>
      <p>${escapeHtml(f.recommendation)}</p>
    </div>`,
    )
    .join("");

  const checklistHtml = checklist
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const stepsHtml = nextSteps
    .map((step, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(step)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revenue Readiness Report — ${name}</title>
  ${fontLinks()}
  <style>
    ${buildThemeStyles()}
    body { padding: 2rem 1rem 4rem; }
    .report { max-width: 800px; margin: 0 auto; }
    .report-header {
      text-align: center;
      padding: 2rem 0 3rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .score-big {
      font-family: var(--display);
      font-size: 4rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .grade-badge {
      display: inline-block;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-weight: 700;
      margin-top: 0.5rem;
      border: 1px solid ${ready ? "var(--success)" : "var(--warning)"};
      color: ${ready ? "var(--success)" : "var(--warning)"};
    }
    .section { margin-bottom: 2.5rem; }
    .section h2 {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-bottom: 1rem;
    }
    .cat-row {
      display: grid;
      grid-template-columns: 120px 1fr 48px;
      gap: 1rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .cat-label { font-size: 0.9rem; }
    .cat-bar {
      height: 8px;
      background: var(--border);
      border-radius: 999px;
      overflow: hidden;
    }
    .cat-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      border-radius: 999px;
    }
    .cat-pct { font-size: 0.85rem; color: var(--muted); text-align: right; }
    .finding {
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 0.75rem;
      border-left: 3px solid var(--border);
      background: var(--surface);
    }
    .finding.critical { border-left-color: var(--danger); }
    .finding.warning { border-left-color: var(--warning); }
    .finding.info { border-left-color: #3b82f6; }
    .finding p { color: var(--muted); font-size: 0.9rem; margin-top: 0.25rem; }
    ul { list-style: none; }
    li { padding: 0.4rem 0; color: var(--muted); font-size: 0.95rem; }
    .unique-badge {
      text-align: center;
      padding: 1rem;
      background: var(--accent-soft);
      border: 1px solid rgba(249,115,22,0.3);
      border-radius: 12px;
      font-size: 0.85rem;
      color: var(--muted);
      margin-top: 2rem;
    }
    @media print {
      .bg-mesh, .orb { display: none; }
      body { background: #fff; color: #111; }
    }
  </style>
</head>
<body>
  <div class="bg-mesh"></div>
  <div class="report">
    <div class="report-header">
      <p style="color:var(--muted);margin-bottom:0.5rem;">Revenue Readiness Report</p>
      <h1 style="font-size:2rem;margin-bottom:0.5rem;">${name}</h1>
      <div class="score-big">${pct}</div>
      <div>out of 100 · Grade ${grade}</div>
      <div class="grade-badge">${ready ? "✓ Launch-ready" : "Not yet launch-ready"}</div>
      <p style="color:var(--muted);margin-top:1rem;font-size:0.85rem;">Generated ${new Date().toLocaleDateString()} by Monetready</p>
    </div>

    <div class="section">
      <h2>Score breakdown</h2>
      ${categories}
    </div>

    <div class="section">
      <h2>Priority fixes</h2>
      ${findings || "<p style='color:var(--muted)'>All checks passed.</p>"}
    </div>

    <div class="section">
      <h2>Launch checklist</h2>
      <ul>${checklistHtml}</ul>
    </div>

    <div class="section">
      <h2>Next steps</h2>
      <ul>${stepsHtml}</ul>
    </div>

    <div class="unique-badge">
      This report is unique to Monetready — a single score for your entire revenue readiness, not just code quality.
    </div>
  </div>
</body>
</html>`;
}
