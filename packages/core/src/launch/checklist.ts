import type { MonetreadySpec } from "../schema/monetready-spec.js";
import type { MonetreadyScoreResult } from "../score/types.js";

export interface FireResult {
  score: MonetreadyScoreResult;
  checklist: string[];
  nextSteps: string[];
}

export function buildLaunchChecklist(spec: MonetreadySpec, score: MonetreadyScoreResult): FireResult {
  const checklist = [
    `[ ] Problem validated: "${spec.product.problem.slice(0, 60)}…"`,
    `[ ] Unfair advantage defined: ${spec.gtm.unfair_advantage ? "✓" : "✗"}`,
    `[ ] Pricing tiers configured (${spec.pricing.tiers.length} tiers)`,
    `[ ] Stripe integration ${spec.integrations.stripe ? "✓" : "✗"}`,
    `[ ] Analytics ${spec.integrations.analytics !== "none" ? "✓" : "✗"}`,
    `[ ] Email provider ${spec.integrations.email !== "none" ? "✓" : "✗"}`,
    `[ ] GTM channels: ${spec.gtm.channels.join(", ") || "none"}`,
    `[ ] Monetready Score ≥ 60% (current: ${Math.round((score.total / score.maxTotal) * 100)}%)`,
    `[ ] ${spec.playbooks.length} revenue playbook(s) enabled`,
  ];

  const nextSteps = score.topActions.length > 0
    ? score.topActions
    : [
        "Run `monetready playbooks run trial-ending-upgrade` to preview lifecycle emails",
        "Share on your top GTM channel",
        "Track signup → activation → payment funnel events",
      ];

  return { score, checklist, nextSteps };
}
