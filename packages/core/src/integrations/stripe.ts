import { createHmac, timingSafeEqual } from "node:crypto";

export interface StripeSignatureResult {
  valid: boolean;
  error?: string;
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | undefined,
  secret: string,
  toleranceSec = 300,
): StripeSignatureResult {
  if (!signatureHeader) {
    return { valid: false, error: "Missing Stripe-Signature header" };
  }

  const parts = signatureHeader.split(",");
  const elements: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      elements[key.trim()] = value.trim();
    }
  }

  const timestamp = elements.t;
  const signature = elements.v1;

  if (!timestamp || !signature) {
    return { valid: false, error: "Invalid Stripe-Signature header format" };
  }

  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (Number.isNaN(timestampSeconds)) {
    return { valid: false, error: "Invalid Stripe webhook timestamp" };
  }

  const age = Math.floor(Date.now() / 1000) - timestampSeconds;
  if (age > toleranceSec) {
    return { valid: false, error: "Stripe webhook timestamp outside tolerance window" };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return { valid: false, error: "Stripe webhook signature mismatch" };
    }
  } catch {
    return { valid: false, error: "Stripe webhook signature mismatch" };
  }

  return { valid: true };
}

export function resolveStripeWebhookSecret(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.STRIPE_WEBHOOK_SECRET ?? env.MONETREADY_STRIPE_WEBHOOK_SECRET;
}

export function resolveMonetreadyWebhookSecret(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.MONETREADY_WEBHOOK_SECRET;
}
