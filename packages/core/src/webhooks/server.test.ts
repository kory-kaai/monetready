import type { Server } from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { createDefaultSpec } from "../spec/loader.js";
import { startWebhookServer } from "./server.js";

const playbooksDir = join(dirname(fileURLToPath(import.meta.url)), "../../../../playbooks");

function signStripePayload(payload: string, secret: string, timestamp: number): string {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

async function withServer(
  handler: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const spec = createDefaultSpec({
    playbooks: [
      "trial-ending-upgrade",
      "inactive-user-nudge",
      "new-subscriber-welcome",
      "churn-risk-winback",
      "star-spike-launch",
    ],
    integrations: {
      email: "resend",
      analytics: "posthog",
      stripe: true,
      github: "kory-kaai/monetready",
    },
  });

  const handle = await startWebhookServer({
    port: 0,
    host: "127.0.0.1",
    projectRoot: process.cwd(),
    playbooksDir,
    spec,
    stripeWebhookSecret: "whsec_test",
    monetreadyWebhookSecret: "monetready_test_secret",
    allowUnsignedStripe: false,
  });

  const baseUrl = `http://127.0.0.1:${handle.port}`;
  try {
    await handler(baseUrl);
  } finally {
    await handle.close();
  }
}

describe("startWebhookServer", () => {
  afterEach(() => {
    // no-op: each test closes its own server via withServer
  });

  it("rejects unsigned Stripe webhooks when a secret is configured", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/webhooks/stripe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "customer.subscription.created" }),
      });

      expect(response.status).toBe(401);
    });
  });

  it("accepts signed Stripe webhooks and matches playbooks", async () => {
    await withServer(async (baseUrl) => {
      const payload = JSON.stringify({ type: "customer.subscription.created" });
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = signStripePayload(payload, "whsec_test", timestamp);

      const response = await fetch(`${baseUrl}/webhooks/stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": signature,
        },
        body: payload,
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { matched: boolean; playbooks: unknown[] };
      expect(body.matched).toBe(true);
      expect(body.playbooks.length).toBeGreaterThan(0);
    });
  });

  it("routes analytics events to matching playbooks", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/webhooks/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Monetready-Webhook-Secret": "monetready_test_secret",
        },
        body: JSON.stringify({
          event: "user.inactive_48h",
          properties: { signup_completed: false },
        }),
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { matched: boolean; playbooks: Array<{ playbookId: string }> };
      expect(body.matched).toBe(true);
      expect(body.playbooks[0]?.playbookId).toBe("inactive-user-nudge");
    });
  });

  it("routes GitHub star spike payloads to growth playbooks", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/webhooks/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Monetready-Webhook-Secret": "monetready_test_secret",
        },
        body: JSON.stringify({
          stars_24h: 80,
          repository: "kory-kaai/monetready",
        }),
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { matched: boolean; playbooks: Array<{ playbookId: string }> };
      expect(body.matched).toBe(true);
      expect(body.playbooks[0]?.playbookId).toBe("star-spike-launch");
    });
  });
});
