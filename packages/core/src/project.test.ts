import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "./spec/loader.js";
import { scoreSpec } from "./project.js";

describe("scoreSpec", () => {
  it("scores from spec without filesystem access", () => {
    const spec = createDefaultSpec({
      product: {
        name: "Test SaaS",
        problem: "Users struggle with pricing",
        solution: "We automate pricing pages",
        tagline: "Pricing made easy",
      },
      pricing: {
        model: "freemium",
        currency: "usd",
        tiers: [
          { name: "Pro", price: 19, interval: "month", features: ["All features"] },
        ],
      },
      integrations: {
        stripe: true,
        analytics: "firebase",
        email: "ses",
      },
    });

    const result = scoreSpec(spec);
    expect(result.total).toBeGreaterThan(0);
    expect(result.maxTotal).toBe(100);
    expect(result.grade).toBeDefined();
  });
});
