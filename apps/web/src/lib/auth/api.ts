import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function verifyAuthToken(request: Request): Promise<DecodedIdToken> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new ApiAuthError("Missing authorization token");
  }

  const token = header.slice("Bearer ".length);
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw new ApiAuthError("Invalid or expired session");
  }
}

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

export function isApiAuthError(error: unknown): error is ApiAuthError {
  return error instanceof ApiAuthError;
}
