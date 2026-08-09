import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import type { MonetreadySpec } from "../schema/monetready-spec.js";
import {
  resolveMonetreadyWebhookSecret,
  resolveStripeWebhookSecret,
  verifyStripeWebhookSignature,
} from "../integrations/stripe.js";
import { loadPlaybookById, loadPlaybooks } from "../playbooks/loader.js";
import { runPlaybook } from "../playbooks/runner.js";
import { findMatchingPlaybooks } from "../playbooks/triggers.js";
import type { Playbook, PlaybookRunResult } from "../playbooks/types.js";

export interface WebhookServerOptions {
  port?: number;
  host?: string;
  projectRoot: string;
  playbooksDir: string;
  spec: MonetreadySpec;
  stripeWebhookSecret?: string;
  monetreadyWebhookSecret?: string;
  allowUnsignedStripe?: boolean;
  onPlaybookRun?: (result: PlaybookRunResult, event: string) => void;
}

export interface WebhookServerHandle {
  port: number;
  close: () => Promise<void>;
}

interface PlaybookRunSummary {
  playbookId: string;
  status: PlaybookRunResult["status"];
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function getHeader(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function verifySharedSecret(
  req: IncomingMessage,
  secret: string | undefined,
): { ok: true } | { ok: false; error: string } {
  if (!secret) {
    return { ok: true };
  }

  const provided = getHeader(req, "x-monetready-webhook-secret");
  if (provided !== secret) {
    return { ok: false, error: "Invalid X-Monetready-Webhook-Secret" };
  }

  return { ok: true };
}

async function executePlaybooks(
  options: WebhookServerOptions,
  playbooks: Playbook[],
  eventLabel: string,
): Promise<PlaybookRunSummary[]> {
  const summaries: PlaybookRunSummary[] = [];

  for (const playbook of playbooks) {
    const result = await runPlaybook(playbook, options.spec, { dryRun: false });
    options.onPlaybookRun?.(result, eventLabel);
    summaries.push({
      playbookId: playbook.id,
      status: result.status,
    });
  }

  return summaries;
}

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}

/** @deprecated Use getStripeEventMappings(playbooks) instead */
export function getStripePlaybookMap(): Record<string, string> {
  return {
    "customer.subscription.trial_will_end": "trial-ending-upgrade",
    "customer.subscription.created": "new-subscriber-welcome",
    "customer.subscription.deleted": "churn-risk-winback",
  };
}

export async function startWebhookServer(
  options: WebhookServerOptions,
): Promise<WebhookServerHandle> {
  const port = options.port ?? 4242;
  const host = options.host ?? "127.0.0.1";
  const stripeWebhookSecret = options.stripeWebhookSecret ?? resolveStripeWebhookSecret();
  const monetreadyWebhookSecret = options.monetreadyWebhookSecret ?? resolveMonetreadyWebhookSecret();
  const allowUnsignedStripe = options.allowUnsignedStripe ?? !stripeWebhookSecret;
  const allPlaybooks = await loadPlaybooks(options.playbooksDir);

  const server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, {
        status: "ok",
        service: "monetready-webhooks",
        stripeVerification: Boolean(stripeWebhookSecret),
        sharedSecret: Boolean(monetreadyWebhookSecret),
      });
      return;
    }

    if (req.method === "POST" && req.url === "/webhooks/stripe") {
      try {
        const body = await readBody(req);

        if (stripeWebhookSecret) {
          const verification = verifyStripeWebhookSignature(
            body,
            getHeader(req, "stripe-signature"),
            stripeWebhookSecret,
          );

          if (!verification.valid) {
            sendJson(res, 401, { error: verification.error });
            return;
          }
        } else if (!allowUnsignedStripe) {
          sendJson(res, 401, {
            error: "STRIPE_WEBHOOK_SECRET is required for Stripe webhooks",
          });
          return;
        }

        const event = parseJsonBody<{ type?: string }>(body);

        if (!event.type) {
          sendJson(res, 400, { error: "Missing event type" });
          return;
        }

        const matches = findMatchingPlaybooks(
          allPlaybooks,
          options.spec.playbooks,
          "stripe",
          event.type,
        );

        if (matches.length === 0) {
          sendJson(res, 200, { received: true, matched: false, event: event.type });
          return;
        }

        const results = await executePlaybooks(options, matches, event.type);

        sendJson(res, 200, {
          received: true,
          matched: true,
          event: event.type,
          playbooks: results,
        });
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : "Invalid webhook payload",
        });
      }
      return;
    }

    if (req.method === "POST" && req.url === "/webhooks/analytics") {
      try {
        const auth = verifySharedSecret(req, monetreadyWebhookSecret);
        if (!auth.ok) {
          sendJson(res, 401, { error: auth.error });
          return;
        }

        const body = await readBody(req);
        const payload = parseJsonBody<{
          event?: string;
          properties?: Record<string, unknown>;
        }>(body);

        if (!payload.event) {
          sendJson(res, 400, { error: "Missing analytics event name" });
          return;
        }

        const properties = payload.properties ?? {};
        const matches = findMatchingPlaybooks(
          allPlaybooks,
          options.spec.playbooks,
          "analytics",
          payload.event,
          properties,
        );

        if (matches.length === 0) {
          sendJson(res, 200, {
            received: true,
            matched: false,
            event: payload.event,
          });
          return;
        }

        const results = await executePlaybooks(options, matches, payload.event);

        sendJson(res, 200, {
          received: true,
          matched: true,
          event: payload.event,
          playbooks: results,
        });
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : "Invalid analytics payload",
        });
      }
      return;
    }

    if (req.method === "POST" && req.url === "/webhooks/github") {
      try {
        const auth = verifySharedSecret(req, monetreadyWebhookSecret);
        if (!auth.ok) {
          sendJson(res, 401, { error: auth.error });
          return;
        }

        const body = await readBody(req);
        const payload = parseJsonBody<Record<string, unknown>>(body);
        const event =
          typeof payload.event === "string" ? payload.event : "github.stars.spike";
        const properties = {
          ...payload,
          stars_24h:
            typeof payload.stars_24h === "number"
              ? payload.stars_24h
              : Number(payload.stars_24h ?? 0),
        };

        const matches = findMatchingPlaybooks(
          allPlaybooks,
          options.spec.playbooks,
          "analytics",
          event,
          properties,
        );

        if (matches.length === 0) {
          sendJson(res, 200, { received: true, matched: false, event });
          return;
        }

        const results = await executePlaybooks(options, matches, event);

        sendJson(res, 200, {
          received: true,
          matched: true,
          event,
          playbooks: results,
        });
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : "Invalid GitHub payload",
        });
      }
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });

  const address = server.address();
  const boundPort = typeof address === "object" && address ? address.port : port;

  return {
    port: boundPort,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

export async function runPlaybookById(
  playbooksDir: string,
  spec: MonetreadySpec,
  playbookId: string,
  dryRun = true,
): Promise<PlaybookRunResult | null> {
  const playbook = await loadPlaybookById(playbooksDir, playbookId);
  if (!playbook) {
    return null;
  }

  return runPlaybook(playbook, spec, { dryRun });
}
