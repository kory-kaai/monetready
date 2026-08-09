import { afterEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: vi.fn().mockImplementation(() => ({ send: sendMock })),
  SendEmailCommand: vi.fn().mockImplementation((input: unknown) => input),
}));

import { sendSesEmail, resolveSesRegion } from "./ses.js";

describe("resolveSesRegion", () => {
  it("defaults to us-west-1", () => {
    expect(resolveSesRegion({})).toBe("us-west-1");
  });

  it("prefers AWS_REGION when set", () => {
    expect(resolveSesRegion({ AWS_REGION: "eu-west-1" })).toBe("eu-west-1");
  });
});

describe("sendSesEmail", () => {
  afterEach(() => {
    sendMock.mockReset();
  });

  it("sends email via SES and returns message id", async () => {
    sendMock.mockResolvedValue({ MessageId: "msg-123" });

    const result = await sendSesEmail({
      region: "us-west-1",
      accessKeyId: "AKIA_TEST",
      secretAccessKey: "secret",
      from: "hello@monetready.com",
      to: "user@example.com",
      subject: "Hello",
      text: "Body",
    });

    expect(result.ok).toBe(true);
    expect(result.id).toBe("msg-123");
  });

  it("returns error when SES fails", async () => {
    sendMock.mockRejectedValue(new Error("MessageRejected"));

    const result = await sendSesEmail({
      region: "us-west-1",
      from: "hello@monetready.com",
      to: "user@example.com",
      subject: "Hello",
      text: "Body",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("MessageRejected");
  });
});
