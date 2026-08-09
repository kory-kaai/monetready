import { describe, expect, it } from "vitest";
import { calculateMonetreadyScore } from "./engine.js";
import { createDefaultSpec } from "../spec/loader.js";
import type { ProjectSignals } from "./types.js";

const perfectSignals: ProjectSignals = {
  hasReadme: true,
  hasLicense: true,
  hasPricingPage: true,
  hasLandingPage: true,
  hasStripeIntegration: true,
  hasAnalytics: true,
  hasEmailIntegration: true,
  hasOnboardingFlow: true,
  hasTests: true,
  hasCi: true,
  readmeWordCount: 300,
  hasCallToAction: true,
  hasFaq: true,
  hasSocialProof: true,
};

describe("calculateMonetreadyScore", () => {
  it("returns a low score for empty defaults without project signals", () => {
    const spec = createDefaultSpec();
    const signals: ProjectSignals = {
      hasReadme: false,
      hasLicense: false,
      hasPricingPage: false,
      hasLandingPage: false,
      hasStripeIntegration: false,
      hasAnalytics: false,
      hasEmailIntegration: false,
      hasOnboardingFlow: false,
      hasTests: false,
      hasCi: false,
      readmeWordCount: 0,
      hasCallToAction: false,
      hasFaq: false,
      hasSocialProof: false,
    };

    const result = calculateMonetreadyScore(spec, signals);
    expect(result.total).toBeLessThan(result.maxTotal * 0.5);
    expect(result.grade).toMatch(/[CDF]/);
  });

  it("returns a high score when spec and signals are strong", () => {
    const spec = createDefaultSpec({
      integrations: { stripe: true, analytics: "posthog", email: "resend" },
      gtm: {
        channels: ["github", "hackernews", "devto"],
        unfair_advantage: "Deep domain expertise from 5 years building in this niche",
        target_audience: "Solo founders shipping their first SaaS product",
      },
      playbooks: ["trial-ending-upgrade", "new-subscriber-welcome", "churn-risk-winback"],
    });

    const result = calculateMonetreadyScore(spec, perfectSignals);
    expect(result.total).toBeGreaterThan(result.maxTotal * 0.75);
    expect(result.grade).toMatch(/[AB]/);
    expect(result.topActions.length).toBeLessThanOrEqual(5);
  });
});
