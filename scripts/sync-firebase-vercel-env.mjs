import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const serviceAccount = JSON.parse(
  readFileSync(join(root, "monetready-firebase-adminsdk-fbsvc-f38ffafc41.json"), "utf8"),
);

const privateKeyOneLine = serviceAccount.private_key.replace(/\n/g, "\\n");
const envVars = {
  FIREBASE_PROJECT_ID: serviceAccount.project_id,
  FIREBASE_CLIENT_EMAIL: serviceAccount.client_email,
  FIREBASE_PRIVATE_KEY: privateKeyOneLine,
};

for (const environment of ["production", "preview"]) {
  for (const [name, value] of Object.entries(envVars)) {
    try {
      execSync(`npx vercel env rm ${name} ${environment} --yes`, {
        cwd: join(root, "apps", "web"),
        stdio: "pipe",
      });
    } catch {
      // Variable may not exist yet.
    }

    execSync(`npx vercel env add ${name} ${environment}`, {
      cwd: join(root, "apps", "web"),
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
    });
    console.log(`Updated ${name} for ${environment}`);
  }
}

console.log("Firebase Admin env vars synced to Vercel.");
