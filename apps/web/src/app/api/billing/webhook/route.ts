import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, planFromStripePriceId } from "@/lib/stripe";
import { normalizePlanId } from "@/lib/plans";
import { updateUserPlan } from "@/lib/users";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    const plan = normalizePlanId(session.metadata?.plan);

    if (uid) {
      const customerId = typeof session.customer === "string" ? session.customer : undefined;
      await updateUserPlan(uid, plan, customerId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const uid = subscription.metadata?.uid;
    const priceId = subscription.items.data[0]?.price.id;

    if (uid && priceId) {
      const plan = planFromStripePriceId(priceId);
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : undefined;
      await updateUserPlan(uid, plan, customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const uid = subscription.metadata?.uid;

    if (uid) {
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : undefined;
      await updateUserPlan(uid, "free", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
