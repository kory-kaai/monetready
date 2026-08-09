import { describe, expect, it } from "vitest";
import { shouldRunCron, getScheduledPlaybooks } from "./schedule.js";

describe("shouldRunCron", () => {
  it("matches exact cron times", () => {
    const mondayAtNine = new Date("2026-08-10T09:00:00");
    expect(shouldRunCron("0 9 * * 1", mondayAtNine)).toBe(true);
    expect(shouldRunCron("0 10 * * 1", mondayAtNine)).toBe(false);
  });

  it("matches wildcard fields", () => {
    const date = new Date("2026-08-09T14:30:00");
    expect(shouldRunCron("30 14 * * *", date)).toBe(true);
    expect(shouldRunCron("0 14 * * *", date)).toBe(false);
  });
});

describe("getScheduledPlaybooks", () => {
  it("returns enabled playbooks that match the current time", () => {
    const playbooks = [
      {
        id: "weekly-revenue-check",
        trigger: { type: "schedule", event: "0 9 * * 1" },
      },
      {
        id: "hourly-check",
        trigger: { type: "schedule", event: "0 * * * *" },
      },
      {
        id: "manual-only",
        trigger: { type: "manual", event: "run" },
      },
    ];

    const mondayAtNine = new Date("2026-08-10T09:00:00");
    const ids = getScheduledPlaybooks(playbooks, ["weekly-revenue-check", "hourly-check"], mondayAtNine);

    expect(ids).toEqual(["weekly-revenue-check", "hourly-check"]);
  });
});
