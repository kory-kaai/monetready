"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlanId } from "@/lib/plans";
import type { UserRole } from "@/lib/roles";
import { authFetch, useAuthUser } from "@/hooks/useAuthUser";

export interface UserProfile {
  uid: string;
  email: string;
  plan: PlanId;
  role: UserRole;
}

export function useUserProfile() {
  const { user, loading: authLoading, getToken } = useAuthUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(getToken, "/api/me");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load profile");
      }
      setProfile(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    void loadProfile();
  }, [authLoading, loadProfile]);

  return {
    user,
    profile,
    loading: authLoading || loading,
    error,
    reload: loadProfile,
  };
}
