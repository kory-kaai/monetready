"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { AppShell } from "@/components/layout/AppShell";
import { authFetch, useAuthUser } from "@/hooks/useAuthUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { PlanId } from "@/lib/plans";
import { planDisplayName } from "@/lib/plans";
import { isAdminRole } from "@/lib/roles";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface AdminUserRow {
  uid: string;
  email: string;
  plan: string;
  role: string;
  createdAt: string | null;
}

type AdminTab = "overview" | "users";

const ADMIN_NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
] as const;

interface AdminClientProps {
  productName: string;
}

export function AdminClient({ productName }: AdminClientProps) {
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuthUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(getToken, "/api/admin/users");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load users");
      }
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!profileLoading && profile && !isAdminRole(profile.role)) {
      router.replace("/dashboard");
    }
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (user && profile && isAdminRole(profile.role)) {
      void loadUsers();
    }
  }, [user, profile, loadUsers]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.push("/");
  }

  if (authLoading || profileLoading || loading) {
    return <p className="dashboard-status">Loading admin panel…</p>;
  }

  if (!user || !profile || !isAdminRole(profile.role)) {
    return null;
  }

  const adminCount = users.filter((row) => row.role === "admin").length;

  return (
    <AppShell
      productName={productName}
      title="Admin panel"
      items={[...ADMIN_NAV_ITEMS]}
      activeId={tab}
      onSelect={(id) => setTab(id as AdminTab)}
      sidebarFooter={
        <>
          <Link href="/dashboard" className="app-sidebar-link">
            User dashboard
          </Link>
          <button type="button" className="app-sidebar-link" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </>
      }
    >
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin panel</h1>
            <p className="dashboard-subtitle">{profile.email}</p>
          </div>
        </div>

        {error ? (
          <div className="dashboard-notice error" role="alert">
            {error}
            <button type="button" className="notice-dismiss" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        ) : null}

        {tab === "overview" ? (
          <div className="dashboard-panel">
            <p className="panel-lead">
              Manage Monetready accounts. Promote users to admin by setting{" "}
              <code>role: &quot;admin&quot;</code> on their document in the Firestore{" "}
              <code>users</code> collection.
            </p>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total users</p>
                <p className="admin-stat-value">{users.length}</p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Admins</p>
                <p className="admin-stat-value">{adminCount}</p>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "users" ? (
          <div className="dashboard-panel">
            <p className="panel-lead">
              To promote a user, open Firebase Console → Firestore → users → select their document
              → set <code>role</code> to <code>admin</code>.
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((row) => (
                    <tr key={row.uid}>
                      <td>{row.email}</td>
                      <td>{planDisplayName(row.plan as PlanId)}</td>
                      <td>
                        <span className={`role-badge role-${row.role}`}>{row.role}</span>
                      </td>
                      <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
