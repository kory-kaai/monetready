import { NextResponse } from "next/server";
import {
  isApiAuthError,
  isApiForbiddenError,
  verifyAdminUser,
} from "@/lib/auth/api";
import { listAllUsers } from "@/lib/users";

export async function GET(request: Request) {
  try {
    await verifyAdminUser(request);
    const users = await listAllUsers();

    return NextResponse.json({
      users: users.map((user) => ({
        uid: user.uid,
        email: user.email,
        plan: user.plan,
        role: user.role,
        createdAt: user.createdAt ?? null,
      })),
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (isApiForbiddenError(error)) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : "Failed to load users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
