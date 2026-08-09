import Stripe from "stripe";
import type { PlanId } from "@/lib/plans";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripePriceId(plan: Exclude<PlanId, "free">): string | undefined {
  if (plan === "pro") {
    return process.env.STRIPE_PRICE_PRO;
  }
  return process.env.STRIPE_PRICE_TEAM;
}

export function planFromStripePriceId(priceId: string): PlanId {
  if (priceId && priceId === process.env.STRIPE_PRICE_TEAM) {
    return "team";
  }
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) {
    return "pro";
  }
  return "free";
}
