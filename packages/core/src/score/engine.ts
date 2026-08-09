import type { MonetreadySpec } from "../schema/monetready-spec.js";
import type {
  CategoryScore,
  MonetreadyScoreResult,
  ProjectSignals,
  ScoreFinding,
  ScoreSeverity,
} from "./types.js";

function gradeFromScore(total: number, maxTotal: number): MonetreadyScoreResult["grade"] {
  const ratio = total / maxTotal;
  if (ratio >= 0.9) return "A";
  if (ratio >= 0.75) return "B";
  if (ratio >= 0.6) return "C";
  if (ratio >= 0.45) return "D";
  return "F";
}

function finding(
  id: string,
  category: ScoreFinding["category"],
  severity: ScoreSeverity,
  title: string,
  description: string,
  recommendation: string,
  points: number,
  maxPoints: number,
): ScoreFinding {
  return { id, category, severity, title, description, recommendation, points, maxPoints };
}

function auditPricing(spec: MonetreadySpec, signals: ProjectSignals): CategoryScore {
  const findings: ScoreFinding[] = [];
  let score = 0;
  const maxScore = 20;

  const paidTiers = spec.pricing.tiers.filter((tier) => tier.price > 0);
  if (paidTiers.length > 0) {
    score += 8;
    findings.push(
      finding(
        "pricing-tiers",
        "pricing",
        "pass",
        "Paid tiers defined",
        `You have ${paidTiers.length} paid tier(s) in monetready.yaml.`,
        "Keep tiers simple — 2–3 options convert best.",
        8,
        8,
      ),
    );
  } else {
    findings.push(
      finding(
        "pricing-tiers",
        "pricing",
        "critical",
        "No paid tiers defined",
        "Your monetready.yaml has no paid pricing tiers.",
        "Add at least one paid tier with a clear value proposition.",
        0,
        8,
      ),
    );
  }

  if (signals.hasPricingPage || signals.hasStripeIntegration) {
    score += 7;
    findings.push(
      finding(
        "pricing-implementation",
        "pricing",
        "pass",
        "Pricing is implemented",
        "Stripe or a pricing page was detected in your codebase.",
        "A/B test your default highlighted tier.",
        7,
        7,
      ),
    );
  } else {
    findings.push(
      finding(
        "pricing-implementation",
        "pricing",
        "warning",
        "Pricing not implemented in code",
        "monetready.yaml defines pricing but no Stripe integration or pricing page was found.",
        "Run `monetready launch` or `monetready generate pages` to create pricing assets and wire Stripe.",
        0,
        7,
      ),
    );
  }

  if (spec.pricing.model !== "free") {
    score += 5;
    findings.push(
      finding(
        "pricing-model",
        "pricing",
        "pass",
        "Monetization model set",
        `Model: ${spec.pricing.model}`,
        "Document what triggers an upgrade in your onboarding.",
        5,
        5,
      ),
    );
  } else {
    findings.push(
      finding(
        "pricing-model",
        "pricing",
        "warning",
        "Free-only model",
        "Your pricing model is set to free with no upgrade path.",
        "Consider freemium with a clear paid tier.",
        0,
        5,
      ),
    );
  }

  return { category: "pricing", score, maxScore, findings };
}

function auditOnboarding(spec: MonetreadySpec, signals: ProjectSignals): CategoryScore {
  const findings: ScoreFinding[] = [];
  let score = 0;
  const maxScore = 15;

  if (signals.hasOnboardingFlow) {
    score += 8;
    findings.push(
      finding(
        "onboarding-flow",
        "onboarding",
        "pass",
        "Onboarding flow detected",
        "Your codebase includes onboarding or welcome patterns.",
        "Measure time-to-first-value — aim for under 5 minutes.",
        8,
        8,
      ),
    );
  } else {
    findings.push(
      finding(
        "onboarding-flow",
        "onboarding",
        "warning",
        "No onboarding flow found",
        "New users may not reach their first 'aha' moment quickly.",
        "Add a guided setup wizard or checklist on first login.",
        0,
        8,
      ),
    );
  }

  if (spec.product.solution && spec.product.solution.length > 20) {
    score += 4;
    findings.push(
      finding(
        "solution-clarity",
        "onboarding",
        "pass",
        "Solution is documented",
        "Your monetready.yaml describes how the product solves the problem.",
        "Mirror this messaging in your in-app onboarding copy.",
        4,
        4,
      ),
    );
  } else {
    findings.push(
      finding(
        "solution-clarity",
        "onboarding",
        "info",
        "Solution needs detail",
        "A vague solution makes onboarding copy harder to write.",
        "Expand `product.solution` in monetready.yaml with concrete outcomes.",
        0,
        4,
      ),
    );
  }

  if (signals.hasCallToAction) {
    score += 3;
    findings.push(
      finding(
        "cta-present",
        "onboarding",
        "pass",
        "Call-to-action in README",
        "Your README includes a clear CTA.",
        "Repeat the same CTA in-app and on your landing page.",
        3,
        3,
      ),
    );
  } else {
    findings.push(
      finding(
        "cta-present",
        "onboarding",
        "warning",
        "Missing call-to-action",
        "No clear CTA found in your README.",
        'Add "Get started" or "Try free" with a link above the fold.',
        0,
        3,
      ),
    );
  }

  return { category: "onboarding", score, maxScore, findings };
}

function auditConversion(spec: MonetreadySpec, signals: ProjectSignals): CategoryScore {
  const findings: ScoreFinding[] = [];
  let score = 0;
  const maxScore = 20;

  if (signals.hasAnalytics || spec.integrations.analytics !== "none") {
    score += 8;
    findings.push(
      finding(
        "analytics",
        "conversion",
        "pass",
        "Analytics configured",
        `Analytics: ${spec.integrations.analytics !== "none" ? spec.integrations.analytics : "detected in code"}`,
        "Track signup → activation → payment as funnel events.",
        8,
        8,
      ),
    );
  } else {
    findings.push(
      finding(
        "analytics",
        "conversion",
        "critical",
        "No analytics",
        "You can't optimize what you don't measure.",
        "Add PostHog or Plausible and define 3 core funnel events.",
        0,
        8,
      ),
    );
  }

  if (signals.hasEmailIntegration || spec.integrations.email !== "none") {
    score += 6;
    findings.push(
      finding(
        "email",
        "conversion",
        "pass",
        "Email integration ready",
        "Transactional email provider detected or configured.",
        "Enable the `new-subscriber-welcome` and `trial-ending-upgrade` playbooks.",
        6,
        6,
      ),
    );
  } else {
    findings.push(
      finding(
        "email",
        "conversion",
        "warning",
        "No email integration",
        "Lifecycle emails drive upgrades and reduce churn.",
        "Connect Resend or Postmark in monetready.yaml integrations.",
        0,
        6,
      ),
    );
  }

  if (spec.playbooks.length >= 2) {
    score += 6;
    findings.push(
      finding(
        "playbooks",
        "conversion",
        "pass",
        "Revenue playbooks enabled",
        `${spec.playbooks.length} playbook(s) configured.`,
        "Run `monetready playbooks list` to review and activate them.",
        6,
        6,
      ),
    );
  } else {
    findings.push(
      finding(
        "playbooks",
        "conversion",
        "info",
        "Few playbooks enabled",
        "Automated revenue playbooks recover trials and reduce churn.",
        "Add playbooks in monetready.yaml — start with trial-ending-upgrade.",
        0,
        6,
      ),
    );
  }

  return { category: "conversion", score, maxScore, findings };
}

function auditDistribution(spec: MonetreadySpec, signals: ProjectSignals): CategoryScore {
  const findings: ScoreFinding[] = [];
  let score = 0;
  const maxScore = 20;

  if (signals.hasReadme && signals.readmeWordCount >= 150) {
    score += 6;
    findings.push(
      finding(
        "readme-quality",
        "distribution",
        "pass",
        "README is substantial",
        `${signals.readmeWordCount} words — enough context for GitHub discovery.`,
        "Add a demo GIF or screenshot above the fold.",
        6,
        6,
      ),
    );
  } else {
    findings.push(
      finding(
        "readme-quality",
        "distribution",
        "warning",
        "README needs work",
        signals.hasReadme
          ? `Only ${signals.readmeWordCount} words — thin for launch.`
          : "No README found.",
        "Write a README with problem, solution, quickstart, and pricing.",
        0,
        6,
      ),
    );
  }

  if (signals.hasLandingPage) {
    score += 5;
    findings.push(
      finding(
        "landing-page",
        "distribution",
        "pass",
        "Landing page detected",
        "A marketing landing page exists in your codebase.",
        "Ensure hero copy matches your monetready.yaml problem statement.",
        5,
        5,
      ),
    );
  } else {
    findings.push(
      finding(
        "landing-page",
        "distribution",
        "warning",
        "No landing page",
        "GitHub stars alone won't convert visitors to customers.",
        "Run `monetready launch` or `monetready generate pages` to scaffold a landing page from your spec.",
        0,
        5,
      ),
    );
  }

  if (spec.gtm.channels.length >= 2) {
    score += 5;
    findings.push(
      finding(
        "gtm-channels",
        "distribution",
        "pass",
        "GTM channels planned",
        `Channels: ${spec.gtm.channels.join(", ")}`,
        "Prepare channel-specific copy before launch day.",
        5,
        5,
      ),
    );
  } else {
    findings.push(
      finding(
        "gtm-channels",
        "distribution",
        "info",
        "Limited GTM plan",
        "Fewer than 2 launch channels defined.",
        "Add github, hackernews, and one niche community channel.",
        0,
        5,
      ),
    );
  }

  if (signals.hasSocialProof) {
    score += 4;
    findings.push(
      finding(
        "social-proof",
        "distribution",
        "pass",
        "Social proof present",
        "Testimonials or usage stats found in README.",
        "Update social proof monthly as you grow.",
        4,
        4,
      ),
    );
  } else {
    findings.push(
      finding(
        "social-proof",
        "distribution",
        "info",
        "No social proof yet",
        "Early products can still show beta user quotes or waitlist size.",
        'Add a "Trusted by" or early adopter quote section.',
        0,
        4,
      ),
    );
  }

  return { category: "distribution", score, maxScore, findings };
}

function auditIntegrations(spec: MonetreadySpec, signals: ProjectSignals): CategoryScore {
  const findings: ScoreFinding[] = [];
  let score = 0;
  const maxScore = 15;

  if (spec.integrations.stripe || signals.hasStripeIntegration) {
    score += 8;
    findings.push(
      finding(
        "stripe",
        "integrations",
        "pass",
        "Stripe connected",
        "Payment infrastructure is in place.",
        "Set up webhook handlers for subscription lifecycle events.",
        8,
        8,
      ),
    );
  } else {
    findings.push(
      finding(
        "stripe",
        "integrations",
        "critical",
        "Stripe not connected",
        "No payment provider detected.",
        "Set integrations.stripe: true and add Stripe checkout.",
        0,
        8,
      ),
    );
  }

  if (signals.hasLicense) {
    score += 3;
    findings.push(
      finding(
        "license",
        "integrations",
        "pass",
        "Open source license present",
        "LICENSE file found — builds trust for OSS products.",
        "Match license to your monetization strategy (MIT for max adoption).",
        3,
        3,
      ),
    );
  } else {
    findings.push(
      finding(
        "license",
        "integrations",
        "info",
        "No LICENSE file",
        "OSS projects without a license create legal uncertainty.",
        "Add an MIT or Apache 2.0 LICENSE file.",
        0,
        3,
      ),
    );
  }

  if (signals.hasCi) {
    score += 4;
    findings.push(
      finding(
        "ci",
        "integrations",
        "pass",
        "CI/CD configured",
        "GitHub Actions or similar CI detected.",
        "Add a release workflow for automated deploys.",
        4,
        4,
      ),
    );
  } else {
    findings.push(
      finding(
        "ci",
        "integrations",
        "info",
        "No CI detected",
        "Automated tests on every PR prevent launch-day bugs.",
        "Add a basic GitHub Actions workflow.",
        0,
        4,
      ),
    );
  }

  return { category: "integrations", score, maxScore, findings };
}

function auditDifferentiation(spec: MonetreadySpec): CategoryScore {
  const findings: ScoreFinding[] = [];
  let score = 0;
  const maxScore = 10;

  const advantage = spec.gtm.unfair_advantage?.trim() ?? "";
  const audience = spec.gtm.target_audience?.trim() ?? "";
  const problem = spec.product.problem.trim();

  if (advantage.length >= 30 && !advantage.toLowerCase().includes("don't")) {
    score += 5;
    findings.push(
      finding(
        "unfair-advantage",
        "differentiation",
        "pass",
        "Unfair advantage documented",
        advantage.slice(0, 80) + (advantage.length > 80 ? "…" : ""),
        "Lead every pitch and landing page with this wedge.",
        5,
        5,
      ),
    );
  } else {
    findings.push(
      finding(
        "unfair-advantage",
        "differentiation",
        "warning",
        "Unfair advantage not defined",
        "Without a wedge, you compete on features alone.",
        "Fill in gtm.unfair_advantage — what do you know that others don't?",
        0,
        5,
      ),
    );
  }

  if (audience.length >= 15) {
    score += 3;
    findings.push(
      finding(
        "target-audience",
        "differentiation",
        "pass",
        "Target audience is specific",
        audience.slice(0, 80) + (audience.length > 80 ? "…" : ""),
        "Write all copy as if speaking to this one person.",
        3,
        3,
      ),
    );
  } else {
    findings.push(
      finding(
        "target-audience",
        "differentiation",
        "warning",
        "Target audience too vague",
        '"Everyone" is not an audience.',
        "Define gtm.target_audience as a specific role + pain.",
        0,
        3,
      ),
    );
  }

  if (problem.length >= 30) {
    score += 2;
    findings.push(
      finding(
        "problem-depth",
        "differentiation",
        "pass",
        "Problem statement is clear",
        "You articulate a real pain, not just a feature list.",
        "Validate this problem with 5 user conversations before scaling GTM.",
        2,
        2,
      ),
    );
  } else {
    findings.push(
      finding(
        "problem-depth",
        "differentiation",
        "info",
        "Problem statement needs depth",
        "A shallow problem leads to shallow positioning.",
        "Expand product.problem with the cost of NOT solving it.",
        0,
        2,
      ),
    );
  }

  return { category: "differentiation", score, maxScore, findings };
}

export function calculateMonetreadyScore(
  spec: MonetreadySpec,
  signals: ProjectSignals,
): MonetreadyScoreResult {
  const categories = [
    auditPricing(spec, signals),
    auditOnboarding(spec, signals),
    auditConversion(spec, signals),
    auditDistribution(spec, signals),
    auditIntegrations(spec, signals),
    auditDifferentiation(spec),
  ];

  const total = categories.reduce((sum, cat) => sum + cat.score, 0);
  const maxTotal = categories.reduce((sum, cat) => sum + cat.maxScore, 0);

  const allFindings = categories.flatMap((cat) => cat.findings);
  const topActions = allFindings
    .filter((f) => f.severity === "critical" || f.severity === "warning")
    .sort((a, b) => a.points / a.maxPoints - b.points / b.maxPoints)
    .slice(0, 5)
    .map((f) => f.recommendation);

  return {
    total,
    maxTotal,
    grade: gradeFromScore(total, maxTotal),
    categories,
    topActions,
    readyToLaunch: total >= maxTotal * 0.6 && !allFindings.some((f) => f.severity === "critical"),
  };
}
