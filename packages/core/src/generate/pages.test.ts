import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "../spec/loader.js";
import { generateLandingPage, generatePricingPage } from "./pages.js";
import { generateReadinessReport } from "./report.js";
import { calculateMonetreadyScore } from "../score/engine.js";

describe("generatePages", () => {
  const spec = createDefaultSpec({
    product: {
      name: "TestSaaS",
      tagline: "Test your SaaS faster",
      problem: "Founders waste time on setup",
      solution: "Automated launch pipeline",
    },
    gtm: {
      channels: ["github"],
      unfair_advantage: "Built by a founder who lived this pain",
      target_audience: "Solo founders",
    },
  });

  it("generates landing page with product name, CTA, and motion", () => {
    const html = generateLandingPage(spec);
    expect(html).toContain("TestSaaS");
    expect(html).toContain("Get started free");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("pricing.html");
    expect(html).toContain("reveal");
    expect(html).toContain("hero-intro");
    expect(html).toContain("hero-intro-highlight");
    expect(html).toContain("site-footer");
    expect(html).toContain("privacy.html");
    expect(html).toContain("nav-cta");
    expect(html).toContain("social-proof");
    expect(html).toContain("Trusted by");
  });

  it("generates pricing page with tiers and animated FAQ", () => {
    const html = generatePricingPage(spec);
    expect(html).toContain("Pricing");
    expect(html).toContain("Free");
    expect(html).toContain("Pro");
    expect(html).toContain("faq-item");
    expect(html).toContain("IntersectionObserver");
  });

  it("escapes HTML in user content", () => {
    const unsafe = createDefaultSpec({
      product: {
        name: "<script>alert(1)</script>",
        problem: "Test & demo",
        solution: "Safe output",
      },
    });
    const html = generateLandingPage(unsafe);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("generates readiness report unique to Monetready", () => {
    const signals = {
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
      readmeWordCount: 200,
      hasCallToAction: true,
      hasFaq: true,
      hasSocialProof: true,
    };
    const score = calculateMonetreadyScore(spec, signals);
    const html = generateReadinessReport(spec, score, ["[ ] Item"], ["Step 1"]);
    expect(html).toContain("Revenue Readiness Report");
    expect(html).toContain("TestSaaS");
    expect(html).toContain("unique to Monetready");
  });
});
