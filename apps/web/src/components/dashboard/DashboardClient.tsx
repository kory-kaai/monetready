"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (!nextUser) {
        router.replace("/login");
      }
    });
  }, [router]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.push("/");
  }

  if (loading) {
    return <p style={{ padding: "4rem 0", color: "var(--muted)" }}>Loading dashboard…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="section">
      <span className="hero-eyebrow">Dashboard</span>
      <h1 style={{ fontFamily: "var(--display)", fontSize: "2rem", marginBottom: "0.5rem" }}>
        Welcome back{user.displayName ? `, ${user.displayName}` : ""}
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>{user.email}</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Monetready Score</h3>
          <p>Connect a repo and run your first audit from the CLI or cloud.</p>
          <code style={{ color: "var(--accent-2)" }}>monetready score</code>
        </div>
        <div className="feature-card">
          <h3>Playbooks</h3>
          <p>Execute trial-ending, churn winback, and inactive user playbooks.</p>
          <code style={{ color: "var(--accent-2)" }}>monetready playbooks run</code>
        </div>
        <div className="feature-card">
          <h3>Generate pages</h3>
          <p>Ship landing, pricing, and legal pages from your spec.</p>
          <code style={{ color: "var(--accent-2)" }}>monetready generate pages</code>
        </div>
      </div>
      <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
        <Link href="/" className="btn btn-secondary">
          Back to home
        </Link>
        <button type="button" className="btn btn-primary" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </section>
  );
}
