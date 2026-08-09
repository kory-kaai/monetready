import { describe, expect, it } from "vitest";
import { renderSocialProof } from "./social-proof.js";
import { createDefaultSpec } from "../spec/loader.js";

describe("renderSocialProof", () => {
  it("renders trusted-by section with audience and quote", () => {
    const spec = createDefaultSpec({
      gtm: { target_audience: "Solo founders", channels: ["github", "hackernews"] },
    });

    const html = renderSocialProof(spec);
    expect(html).toContain("social-proof");
    expect(html).toContain("Trusted by Solo founders");
    expect(html).toContain("Early adopter");
  });
});
