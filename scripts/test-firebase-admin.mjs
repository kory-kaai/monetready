import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const envPath = join(import.meta.dirname, "../apps/web/.env.local");
const env = readFileSync(envPath, "utf8");
const vars = Object.fromEntries(
  env
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index);
      let value = line.slice(index + 1);
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      return [key, value];
    }),
);

function normalizePrivateKey(raw) {
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/^"|"$/g, "");
  return trimmed.includes("\\n") ? trimmed.replace(/\\n/g, "\n") : trimmed;
}

const projectId = vars.FIREBASE_PROJECT_ID?.trim();
const clientEmail = vars.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = normalizePrivateKey(vars.FIREBASE_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing credentials:", {
    projectId: Boolean(projectId),
    clientEmail: Boolean(clientEmail),
    privateKey: Boolean(privateKey),
  });
  process.exit(1);
}

try {
  cert({ projectId, clientEmail, privateKey });
  console.log("Certificate parsed OK");
} catch (error) {
  console.error("Certificate parse error:", error);
  process.exit(1);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });

try {
  const { getAuth } = await import("firebase-admin/auth");
  const users = await getAuth(app).listUsers(1);
  console.log("Auth OK, users:", users.users.length);
} catch (error) {
  console.error("Auth error:", error.message);
}

try {
  const snap = await getFirestore(app).collection("users").limit(1).get();
  console.log("Firestore OK, sample docs:", snap.size);
} catch (error) {
  console.error("Firestore error:", error.message);
  process.exit(1);
}
