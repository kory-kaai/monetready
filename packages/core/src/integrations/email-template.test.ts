import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "../spec/loader.js";
import {
  buildEmailTemplateVars,
  parseEmailTemplate,
  substituteTemplateVars,
} from "../integrations/email-template.js";

describe("substituteTemplateVars", () => {
  it("replaces known template variables", () => {
    const result = substituteTemplateVars("Hi {{name}}, visit {{upgrade_url}}", {
      name: "Alex",
      upgrade_url: "https://app.test/pricing",
    });
    expect(result).toBe("Hi Alex, visit https://app.test/pricing");
  });

  it("leaves unknown placeholders intact", () => {
    const result = substituteTemplateVars("Hi {{name}}", {});
    expect(result).toBe("Hi {{name}}");
  });
});

describe("buildEmailTemplateVars", () => {
  it("builds defaults from spec and context properties", () => {
    const spec = createDefaultSpec({
      product: {
        name: "TestSaaS",
        url: "https://testsaas.com",
        problem: "Problem",
        solution: "Solution",
      },
      integrations: { github: "acme/testsaas", stripe: false, analytics: "none", email: "none" },
    });

    const vars = buildEmailTemplateVars(spec, {
      properties: { email: "alex@example.com" },
    });

    expect(vars.name).toBe("alex");
    expect(vars.upgrade_url).toBe("https://testsaas.com/pricing");
    expect(vars.repo_url).toBe("https://github.com/acme/testsaas");
  });
});

describe("parseEmailTemplate", () => {
  it("extracts subject and body from template text", () => {
    const parsed = parseEmailTemplate("Subject: Hello\n\nBody line");
    expect(parsed.subject).toBe("Hello");
    expect(parsed.text).toBe("Body line");
  });
});
