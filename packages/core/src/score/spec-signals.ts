import type { MonetreadySpec } from "../schema/monetready-spec.js";
import type { ProjectSignals } from "./types.js";

/** Infer filesystem-like signals from a monetready.yaml spec (cloud / no repo access). */
export function deriveSignalsFromSpec(spec: MonetreadySpec): ProjectSignals {
  const readmeText = [spec.product.problem, spec.product.solution ?? "", spec.product.tagline ?? ""]
    .join(" ")
    .trim();

  return {
    hasReadme: readmeText.length > 40,
    hasLicense: false,
    hasPricingPage: spec.pricing.tiers.length > 0,
    hasLandingPage: Boolean(spec.product.name && spec.product.tagline),
    hasStripeIntegration: spec.integrations.stripe,
    hasAnalytics: spec.integrations.analytics !== "none",
    hasEmailIntegration: spec.integrations.email !== "none",
    hasOnboardingFlow: Boolean(spec.product.solution),
    hasTests: false,
    hasCi: Boolean(spec.integrations.github),
    readmeWordCount: readmeText.split(/\s+/).filter(Boolean).length,
    hasCallToAction: spec.pricing.tiers.length > 0,
    hasFaq: false,
    hasSocialProof: Boolean(spec.gtm.unfair_advantage),
  };
}

export function mergeProjectSignals(
  base: ProjectSignals,
  overrides?: Partial<ProjectSignals>,
): ProjectSignals {
  if (!overrides) {
    return base;
  }
  return { ...base, ...overrides };
}
