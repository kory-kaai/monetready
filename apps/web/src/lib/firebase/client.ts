"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirebaseClientConfig } from "./config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let appCheck: AppCheck | undefined;
let analytics: Analytics | undefined;

function initAppCheck(firebaseApp: FirebaseApp): void {
  if (typeof window === "undefined" || appCheck) {
    return;
  }

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY;
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;

  if (debugToken && process.env.NODE_ENV === "development") {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
  }

  if (!siteKey) {
    console.warn(
      "App Check disabled: set NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY in .env.local",
    );
    return;
  }

  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(getFirebaseClientConfig());
    initAppCheck(app);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) {
    return analytics;
  }
  if (typeof window === "undefined") {
    return null;
  }
  const supported = await isSupported();
  if (!supported) {
    return null;
  }
  analytics = getAnalytics(getFirebaseApp());
  return analytics;
}
