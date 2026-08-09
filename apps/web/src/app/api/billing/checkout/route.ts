import { NextResponse } from "next/server";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import type { PlanId } from "@/lib/plans";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { getOrCreateUser } from "@/lib/users";

interface CheckoutBody {
  plan?: PlanId;
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const body = (await request.json()) as CheckoutBody;

    if (body.plan !== "pro" && body.plan !== "team") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = getStripePriceId(body.plan);

    if (!stripe || !priceId) {
      return NextResponse.json(
        {
          error: "Stripe billing is not configured yet. Sign up free and we will enable upgrades soon.",
          configured: false,
        },
        { status: 503 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=${body.plan}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        uid: user.uid,
        plan: body.plan,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
