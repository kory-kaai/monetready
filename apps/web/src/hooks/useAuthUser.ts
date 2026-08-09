"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const getToken = useCallback(async () => {
    if (!user) {
      throw new Error("Not signed in");
    }
    return user.getIdToken();
  }, [user]);

  return { user, loading, getToken };
}

export async function authFetch(
  getToken: () => Promise<string>,
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
