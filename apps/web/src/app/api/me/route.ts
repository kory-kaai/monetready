import { NextResponse } from "next/server";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getPlanFeatures } from "@/lib/plans";
import { getOrCreateUser } from "@/lib/users";

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        plan: user.plan,
        role: user.role,
      },
      features: getPlanFeatures(user.plan),
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
