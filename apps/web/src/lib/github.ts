import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

export interface GithubConnection {
  connected: boolean;
  username: string | null;
}

export async function storeGithubToken(
  uid: string,
  accessToken: string,
  username: string,
): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("userSecrets").doc(uid).set(
    {
      githubAccessToken: accessToken,
      githubUsername: username,
      githubConnectedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getGithubToken(uid: string): Promise<string | null> {
  const db = getAdminFirestore();
  const snap = await db.collection("userSecrets").doc(uid).get();
  if (!snap.exists) {
    return null;
  }
  const token = snap.data()?.githubAccessToken;
  return typeof token === "string" ? token : null;
}

export async function getGithubConnection(uid: string): Promise<GithubConnection> {
  const db = getAdminFirestore();
  const snap = await db.collection("userSecrets").doc(uid).get();
  if (!snap.exists) {
    return { connected: false, username: null };
  }
  const data = snap.data()!;
  const token = data.githubAccessToken;
  const username = data.githubUsername;
  return {
    connected: typeof token === "string" && token.length > 0,
    username: typeof username === "string" ? username : null,
  };
}

export async function clearGithubToken(uid: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("userSecrets").doc(uid).set(
    {
      githubAccessToken: FieldValue.delete(),
      githubUsername: FieldValue.delete(),
      githubConnectedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
