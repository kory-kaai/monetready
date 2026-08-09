import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const serviceAccount = JSON.parse(
  readFileSync(join(root, "monetready-firebase-adminsdk-fbsvc-f38ffafc41.json"), "utf8"),
);

const envPath = join(root, "apps", "web", ".env.local");
let env = readFileSync(envPath, "utf8");

const privateKeyOneLine = serviceAccount.private_key.replace(/\n/g, "\\n");
const replacement = [
  `FIREBASE_PROJECT_ID=${serviceAccount.project_id}`,
  `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`,
  `FIREBASE_PRIVATE_KEY="${privateKeyOneLine}"`,
].join("\n");

env = env.replace(
  /# --- Firebase Admin SDK[\s\S]*?(?=\n# --- Auth)/,
  `# --- Firebase Admin SDK (server-only — API routes / Server Actions) ---\n# Run: node scripts/sync-firebase-env.mjs after updating the service account JSON at repo root\n${replacement}\n`,
);

writeFileSync(envPath, env);
console.log("Updated Firebase Admin credentials in apps/web/.env.local");
