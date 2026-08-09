import type { MonetreadySpec } from "../schema/monetready-spec.js";

export interface EmailTemplateContext {
  properties?: Record<string, unknown>;
}

export interface ParsedEmailTemplate {
  subject: string;
  text: string;
}

export function substituteTemplateVars(
  template: string,
  vars: Record<string, string | undefined>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match);
}

export function buildEmailTemplateVars(
  spec: MonetreadySpec,
  context?: EmailTemplateContext,
): Record<string, string> {
  const properties = context?.properties ?? {};
  const github = spec.integrations.github;
  const name =
    typeof properties.name === "string"
      ? properties.name
      : typeof properties.email === "string"
        ? properties.email.split("@")[0]
        : typeof properties.distinct_id === "string"
          ? properties.distinct_id
          : "there";

  return {
    name,
    upgrade_url:
      typeof properties.upgrade_url === "string"
        ? properties.upgrade_url
        : spec.product.url
          ? `${spec.product.url.replace(/\/$/, "")}/pricing`
          : "https://example.com/pricing",
    app_url:
      typeof properties.app_url === "string"
        ? properties.app_url
        : spec.product.url ?? "https://example.com",
    repo_url:
      typeof properties.repo_url === "string"
        ? properties.repo_url
        : github
          ? `https://github.com/${github}`
          : spec.product.url ?? "https://github.com",
  };
}

export function parseEmailTemplate(body: string): ParsedEmailTemplate {
  const lines = body.split("\n");
  const firstLine = lines[0]?.trim() ?? "";

  if (firstLine.toLowerCase().startsWith("subject:")) {
    const subject = firstLine.slice("subject:".length).trim();
    const text = lines.slice(1).join("\n").replace(/^\n+/, "");
    return { subject, text };
  }

  return {
    subject: "Message from Monetready",
    text: body,
  };
}
