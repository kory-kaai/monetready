import type { MonetreadySpec } from "../schema/monetready-spec.js";
import { loadIntegrationContext, type IntegrationContext } from "../integrations/context.js";
import { parseEmailTemplate, buildEmailTemplateVars, substituteTemplateVars } from "../integrations/email-template.js";
import { sendResendEmail } from "../integrations/resend.js";
import { resolveSesRegion, sendSesEmail } from "../integrations/ses.js";
import { postSlackMessage } from "../integrations/slack.js";
import { postWebhook } from "../integrations/webhook.js";
import type { Playbook, PlaybookRunResult } from "./types.js";

const EMAIL_TEMPLATES: Record<string, (spec: MonetreadySpec) => string> = {
  "trial-ending": (spec) =>
    `Subject: Your ${spec.product.name} trial ends soon\n\n` +
    `Hi {{name}},\n\n` +
    `Your trial of ${spec.product.name} ends in 3 days. ` +
    `You've been using features that save time on ${spec.product.problem.toLowerCase()}.\n\n` +
    `Upgrade to keep access: {{upgrade_url}}\n\n` +
    `— The ${spec.product.name} team`,

  welcome: (spec) =>
    `Subject: Welcome to ${spec.product.name}!\n\n` +
    `Hi {{name}},\n\n` +
    `Thanks for subscribing. Here's how to get value in the next 10 minutes:\n\n` +
    `1. Complete setup\n2. Invite your team\n3. Connect integrations\n\n` +
    `Need help? Reply to this email.\n\n` +
    `— The ${spec.product.name} team`,

  "inactive-nudge": (spec) =>
    `Subject: We miss you at ${spec.product.name}\n\n` +
    `Hi {{name}},\n\n` +
    `You signed up but haven't finished setup. ` +
    `${spec.product.solution ?? "Your team is waiting."}\n\n` +
    `Pick up where you left off: {{app_url}}\n\n` +
    `— The ${spec.product.name} team`,

  "churn-winback": (spec) =>
    `Subject: Before you go — one thing about ${spec.product.name}\n\n` +
    `Hi {{name}},\n\n` +
    `We noticed you cancelled. We'd love to understand what we could do better.\n\n` +
    `Reply with feedback and we'll extend your access 30 days free.\n\n` +
    `— The ${spec.product.name} team`,

  "star-spike": (spec) =>
    `Subject: Launch draft — ${spec.product.name}\n\n` +
    `Your repo is trending! Post this to Hacker News:\n\n` +
    `Show HN: ${spec.product.name} — ${spec.product.tagline ?? spec.product.problem}\n\n` +
    `Link: {{repo_url}}\n\n` +
    `Channels to hit: ${spec.gtm.channels.join(", ") || "github, hackernews"}`,
};

export interface RunPlaybookOptions {
  dryRun?: boolean;
  integrations?: IntegrationContext;
  context?: {
    emailTo?: string;
    properties?: Record<string, unknown>;
  };
}

function resolveOverallStatus(
  dryRun: boolean,
  actions: PlaybookRunResult["actions"],
): PlaybookRunResult["status"] {
  if (dryRun) {
    return "simulated";
  }

  if (actions.some((action) => action.status === "error")) {
    return "failed";
  }

  return "executed";
}

interface SendPlaybookEmailOptions {
  spec: MonetreadySpec;
  integrations: IntegrationContext;
  recipient: string;
  subject: string;
  text: string;
}

async function sendPlaybookEmail(
  options: SendPlaybookEmailOptions,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const provider = options.spec.integrations.email;

  switch (provider) {
    case "resend": {
      if (!options.integrations.resendApiKey) {
        return { ok: false, error: "Missing RESEND_API_KEY. Set it in your environment to send emails." };
      }
      return sendResendEmail({
        apiKey: options.integrations.resendApiKey,
        from: options.integrations.fromEmail!,
        to: options.recipient,
        subject: options.subject,
        text: options.text,
      });
    }
    case "ses": {
      if (!options.integrations.awsAccessKeyId || !options.integrations.awsSecretAccessKey) {
        return {
          ok: false,
          error: "Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY for SES.",
        };
      }
      return sendSesEmail({
        region: options.integrations.sesRegion ?? resolveSesRegion(),
        accessKeyId: options.integrations.awsAccessKeyId,
        secretAccessKey: options.integrations.awsSecretAccessKey,
        from: options.integrations.fromEmail!,
        to: options.recipient,
        subject: options.subject,
        text: options.text,
      });
    }
    case "sendgrid":
    case "postmark":
      return {
        ok: false,
        error: `Email provider "${provider}" is configured in monetready.yaml but not implemented yet. Use ses or resend.`,
      };
    case "none":
      return {
        ok: false,
        error: "Email integration is disabled. Set integrations.email in monetready.yaml.",
      };
    default: {
      const _exhaustive: never = provider;
      return { ok: false, error: `Unsupported email provider: ${String(_exhaustive)}` };
    }
  }
}

export async function runPlaybook(
  playbook: Playbook,
  spec: MonetreadySpec,
  options: RunPlaybookOptions = {},
): Promise<PlaybookRunResult> {
  const dryRun = options.dryRun ?? true;
  const integrations = options.integrations ?? loadIntegrationContext();
  const actions: PlaybookRunResult["actions"] = [];

  for (const action of playbook.actions) {
    switch (action.type) {
      case "email": {
        const templateKey = action.template ?? "welcome";
        const generator = EMAIL_TEMPLATES[templateKey];
        const rawBody = generator
          ? generator(spec)
          : `Template "${templateKey}" not found`;
        const body = substituteTemplateVars(
          rawBody,
          buildEmailTemplateVars(spec, options.context),
        );

        if (dryRun) {
          actions.push({
            type: "email",
            status: "ok",
            output: `[DRY RUN] Would send email:\n${body}`,
          });
          break;
        }

        const emailProvider = spec.integrations.email;
        if (emailProvider !== "resend" && emailProvider !== "ses") {
          actions.push({
            type: "email",
            status: "error",
            output:
              `Email integration is set to "${emailProvider}" in monetready.yaml. Set integrations.email to ses or resend to send.`,
          });
          break;
        }

        if (!integrations.fromEmail) {
          actions.push({
            type: "email",
            status: "error",
            output:
              emailProvider === "ses"
                ? "Missing SES_FROM_EMAIL or MONETREADY_FROM_EMAIL. Set a verified SES sender address."
                : "Missing MONETREADY_FROM_EMAIL. Set a verified sender address for Resend.",
          });
          break;
        }

        if (!integrations.defaultEmailTo && !options.context?.emailTo) {
          actions.push({
            type: "email",
            status: "error",
            output:
              "Missing MONETREADY_PLAYBOOK_EMAIL_TO. Set a recipient address for playbook emails.",
          });
          break;
        }

        const parsed = parseEmailTemplate(body);
        const recipient = options.context?.emailTo ?? integrations.defaultEmailTo!;
        const result = await sendPlaybookEmail({
          spec,
          integrations,
          recipient,
          subject: parsed.subject,
          text: parsed.text,
        });

        if (!result.ok) {
          actions.push({
            type: "email",
            status: "error",
            output: `Failed to send email: ${result.error}`,
          });
          break;
        }

        actions.push({
          type: "email",
          status: "ok",
          output: `Email sent to ${recipient} via ${emailProvider} (id: ${result.id ?? "unknown"})`,
        });
        break;
      }
      case "webhook": {
        const url = action.url;
        if (dryRun) {
          actions.push({
            type: "webhook",
            status: "ok",
            output: `[DRY RUN] POST ${url ?? "https://hooks.example.com"}`,
          });
          break;
        }

        if (!url) {
          actions.push({
            type: "webhook",
            status: "error",
            output: "Webhook action is missing a url.",
          });
          break;
        }

        const result = await postWebhook({
          url,
          payload: {
            playbookId: playbook.id,
            product: spec.product.name,
            message: action.message ?? playbook.description,
          },
        });

        actions.push({
          type: "webhook",
          status: result.ok ? "ok" : "error",
          output: result.ok
            ? `Webhook fired to ${url} (${result.status})`
            : `Webhook failed: ${result.error}`,
        });
        break;
      }
      case "slack": {
        const message = action.message ?? playbook.description;
        if (dryRun) {
          actions.push({
            type: "slack",
            status: "ok",
            output: `[DRY RUN] Slack: ${message}`,
          });
          break;
        }

        if (!integrations.slackWebhookUrl) {
          actions.push({
            type: "slack",
            status: "error",
            output:
              "Missing SLACK_WEBHOOK_URL or MONETREADY_SLACK_WEBHOOK_URL for Slack delivery.",
          });
          break;
        }

        const result = await postSlackMessage({
          webhookUrl: integrations.slackWebhookUrl,
          message,
        });

        actions.push({
          type: "slack",
          status: result.ok ? "ok" : "error",
          output: result.ok ? "Slack message sent" : `Slack failed: ${result.error}`,
        });
        break;
      }
      case "log":
        actions.push({
          type: "log",
          status: "ok",
          output: action.message ?? `Playbook ${playbook.id} triggered`,
        });
        break;
      case "generate":
        actions.push({
          type: "generate",
          status: "ok",
          output: dryRun
            ? `[DRY RUN] Would generate asset: ${action.template}`
            : `Generated: ${action.template}`,
        });
        break;
      default: {
        const _exhaustive: never = action.type;
        actions.push({
          type: String(_exhaustive),
          status: "skipped",
          output: "Unknown action type",
        });
      }
    }
  }

  return {
    playbookId: playbook.id,
    status: resolveOverallStatus(dryRun, actions),
    actions,
  };
}
