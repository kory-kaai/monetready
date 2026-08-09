import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  resolveStripeWebhookSecret,
  verifyStripeWebhookSignature,
} from "../integrations/stripe.js";
import {
  evaluatePlaybookCondition,
  findMatchingPlaybooks,
} from "./triggers.js";
import type { Playbook } from "./types.js";

function signStripePayload(payload: string, secret: string, timestamp: number): string {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

const playbooks: Playbook[] = [
  {
    id: "inactive-user-nudge",
    name: "Inactive User Nudge",
    description: "Re-engage inactive users",
    category: "onboarding",
    trigger: {
      type: "analytics",
      event: "user.inactive_48h",
      condition: "signup_completed == false",
    },
    actions: [{ type: "log", message: "nudge" }],
    enabled: true,
  },
  {
    id: "star-spike-launch",
    name: "Star Spike Launch",
    description: "Launch on star spike",
    category: "growth",
    trigger: {
      type: "analytics",
      event: "github.stars.spike",
      condition: "stars_24h >= 50",
    },
    actions: [{ type: "log", message: "launch" }],
    enabled: true,
  },
];

describe("evaluatePlaybookCondition", () => {
  it("evaluates boolean and numeric comparisons", () => {
    expect(
      evaluatePlaybookCondition("signup_completed == false", { signup_completed: false }),
    ).toBe(true);
    expect(
      evaluatePlaybookCondition("stars_24h >= 50", { stars_24h: 75 }),
    ).toBe(true);
    expect(
      evaluatePlaybookCondition("stars_24h >= 50", { stars_24h: 10 }),
    ).toBe(false);
  });
});

describe("findMatchingPlaybooks", () => {
  it("matches analytics playbooks with conditions", () => {
    const inactive = findMatchingPlaybooks(
      playbooks,
      ["inactive-user-nudge", "star-spike-launch"],
      "analytics",
      "user.inactive_48h",
      { signup_completed: false },
    );
    expect(inactive.map((playbook) => playbook.id)).toEqual(["inactive-user-nudge"]);

    const spike = findMatchingPlaybooks(
      playbooks,
      ["inactive-user-nudge", "star-spike-launch"],
      "analytics",
      "github.stars.spike",
      { stars_24h: 120 },
    );
    expect(spike.map((playbook) => playbook.id)).toEqual(["star-spike-launch"]);
  });
});

describe("verifyStripeWebhookSignature", () => {
  it("accepts valid Stripe signatures", () => {
    const payload = JSON.stringify({ type: "customer.subscription.created" });
    const secret = "whsec_test_secret";
    const timestamp = Math.floor(Date.now() / 1000);
    const header = signStripePayload(payload, secret, timestamp);

    const result = verifyStripeWebhookSignature(payload, header, secret);
    expect(result.valid).toBe(true);
  });

  it("rejects invalid Stripe signatures", () => {
    const payload = JSON.stringify({ type: "customer.subscription.created" });
    const result = verifyStripeWebhookSignature(
      payload,
      "t=123,v1=deadbeef",
      "whsec_test_secret",
    );
    expect(result.valid).toBe(false);
  });
});

describe("resolveStripeWebhookSecret", () => {
  it("reads webhook secret from environment", () => {
    expect(
      resolveStripeWebhookSecret({ STRIPE_WEBHOOK_SECRET: "whsec_123" }),
    ).toBe("whsec_123");
  });
});
