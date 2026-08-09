import { describe, expect, it } from "vitest";
import { resolveFirebaseMeasurementId } from "./firebase-analytics.js";

describe("resolveFirebaseMeasurementId", () => {
  it("prefers NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID", () => {
    expect(
      resolveFirebaseMeasurementId({
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-ABC123",
        GA_MEASUREMENT_ID: "G-OTHER",
      }),
    ).toBe("G-ABC123");
  });

  it("falls back to GA_MEASUREMENT_ID", () => {
    expect(
      resolveFirebaseMeasurementId({
        GA_MEASUREMENT_ID: "G-FALLBACK",
      }),
    ).toBe("G-FALLBACK");
  });
});
