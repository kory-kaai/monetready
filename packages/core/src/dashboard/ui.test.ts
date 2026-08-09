import { describe, expect, it } from "vitest";
import { buildDashboardHtml } from "./ui.js";

describe("buildDashboardHtml", () => {
  it("returns valid HTML with dashboard shell", () => {
    const html = buildDashboardHtml();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Monetready Dashboard");
    expect(html).toContain("/api/overview");
    expect(html).toContain("runPlaybook");
  });
});
