import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultSpec } from "../spec/loader.js";
import { parseEmailTemplate } from "../integrations/email-template.js";
import { runPlaybook } from "./runner.js";
import type { Playbook } from "./types.js";

const samplePlaybook: Playbook = {
  id: "trial-ending-upgrade",
  name: "Trial Ending Upgrade",
  description: "Send upgrade email before trial ends",
  category: "conversion",
  trigger: { type: "stripe", event: "customer.subscription.trial_will_end" },
  actions: [
    { type: "email", template: "trial-ending" },
    { type: "webhook", url: "https://example.com/hook" },
    { type: "slack", message: "Trial ending soon" },
    { type: "log", message: "Queued" },
  ],
  enabled: true,
};

describe("parseEmailTemplate", () => {
  it("extracts subject and body from template text", () => {
    const parsed = parseEmailTemplate("Subject: Hello\n\nBody line");
    expect(parsed.subject).toBe("Hello");
    expect(parsed.text).toBe("Body line");
  });
});

describe("runPlaybook", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("simulates actions by default", async () => {
    const spec = createDefaultSpec({
      integrations: { email: "resend", analytics: "none", stripe: false, github: "" },
    });

    const result = await runPlaybook(samplePlaybook, spec);

    expect(result.status).toBe("simulated");
    expect(result.actions[0]?.output).toContain("[DRY RUN]");
    expect(result.actions[1]?.output).toContain("[DRY RUN] POST");
  });

  it("returns actionable errors when integrations are missing", async () => {
    const spec = createDefaultSpec({
      integrations: { email: "resend", analytics: "none", stripe: false, github: "" },
    });

    const result = await runPlaybook(samplePlaybook, spec, {
      dryRun: false,
      integrations: {
        fromEmail: "hello@monetready.com",
        defaultEmailTo: "user@example.com",
      },
    });

    expect(result.status).toBe("failed");
    expect(result.actions[0]?.status).toBe("error");
    expect(result.actions[0]?.output).toContain("RESEND_API_KEY");
  });

  it("returns actionable errors when SES credentials are missing", async () => {
    const spec = createDefaultSpec({
      integrations: { email: "ses", analytics: "none", stripe: false, github: "" },
    });

    const result = await runPlaybook(samplePlaybook, spec, {
      dryRun: false,
      integrations: {
        fromEmail: "hello@monetready.com",
        defaultEmailTo: "user@example.com",
      },
    });

    expect(result.status).toBe("failed");
    expect(result.actions[0]?.status).toBe("error");
    expect(result.actions[0]?.output).toContain("AWS_ACCESS_KEY_ID");
  });

  it("substitutes template variables before sending email", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "email_123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const spec = createDefaultSpec({
      product: {
        name: "TestSaaS",
        url: "https://testsaas.com",
        problem: "Problem",
        solution: "Solution",
      },
      integrations: { email: "resend", analytics: "none", stripe: false, github: "" },
    });

    const playbook = {
      ...samplePlaybook,
      actions: [{ type: "email" as const, template: "welcome" }],
    };

    await runPlaybook(playbook, spec, {
      dryRun: false,
      integrations: {
        resendApiKey: "re_test",
        fromEmail: "Monetready <onboarding@resend.dev>",
        defaultEmailTo: "user@example.com",
      },
      context: {
        properties: { name: "Alex" },
      },
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      text: string;
    };
    expect(requestBody.text).toContain("Hi Alex");
    expect(requestBody.text).not.toContain("{{name}}");
  });
});
