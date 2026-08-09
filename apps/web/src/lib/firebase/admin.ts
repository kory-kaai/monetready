import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminCredentials(): { projectId: string; clientEmail: string; privateKey: string } {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local",
    );
  }

  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const { projectId, clientEmail, privateKey } = getAdminCredentials();

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}
