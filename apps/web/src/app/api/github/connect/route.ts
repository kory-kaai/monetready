import { NextResponse } from "next/server";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { fetchGithubUsername } from "@/lib/github-api";
import { clearGithubToken, getGithubConnection, storeGithubToken } from "@/lib/github";

interface ConnectBody {
  accessToken?: string;
}

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const connection = await getGithubConnection(decoded.uid);
    return NextResponse.json(connection);
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load GitHub status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const body = (await request.json()) as ConnectBody;
    const accessToken = body.accessToken?.trim();

    if (!accessToken) {
      return NextResponse.json({ error: "GitHub access token is required" }, { status: 400 });
    }

    const username = await fetchGithubUsername(accessToken);
    await storeGithubToken(decoded.uid, accessToken, username);

    return NextResponse.json({ connected: true, username });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "GitHub connection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    await clearGithubToken(decoded.uid);
    return NextResponse.json({ connected: false });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to disconnect GitHub" }, { status: 500 });
  }
}
