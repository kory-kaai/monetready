"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import type { MonetreadyScoreResult, PlaybookRunResult } from "@monetready/core";
import { Spinner } from "@/components/ui/Icons";
import { authFetch, useAuthUser } from "@/hooks/useAuthUser";
import type { PlanFeatures, PlanId } from "@/lib/plans";
import { planDisplayName } from "@/lib/plans";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface DashboardPlaybook {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface DashboardProject {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
}

interface DashboardOverview {
  user: { email: string; plan: PlanId };
  features: PlanFeatures;
  product: { name: string; tagline?: string };
  score: MonetreadyScoreResult;
  checklist: string[];
  nextSteps: string[];
  playbooks: DashboardPlaybook[];
  projects: DashboardProject[];
  integrations: { stripe: boolean; email: string; analytics: string };
  cli: {
    install: string;
    init: string;
    score: string;
    playbooks: string;
    generate: string;
  };
}

type DashboardTab = "score" | "playbooks" | "generate" | "projects" | "cli";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, getToken } = useAuthUser();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DashboardTab>("score");
  const [runResult, setRunResult] = useState<PlaybookRunResult | null>(null);
  const [runLoading, setRunLoading] = useState<string | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(getToken, "/api/dashboard/overview");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load dashboard");
      }
      setOverview(data);
      if (data.projects?.[0]?.id) {
        setSelectedProject(data.projects[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
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
    if (user) {
      void loadOverview();
    }
  }, [user, loadOverview]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.push("/");
  }

  async function handleUpgrade(plan: PlanId) {
    if (plan === "free") return;
    setCheckoutLoading(plan);
    try {
      const response = await authFetch(getToken, "/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Checkout is not available yet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleRunPlaybook(id: string, execute: boolean) {
    setRunLoading(id);
    setRunResult(null);
    try {
      const response = await authFetch(getToken, `/api/playbooks/${id}/run`, {
        method: "POST",
        body: JSON.stringify({ execute }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Playbook run failed");
      }
      setRunResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playbook run failed");
    } finally {
      setRunLoading(null);
    }
  }

  async function handleGenerate() {
    setGenerateLoading(true);
    setGenerateMessage(null);
    try {
      const response = await authFetch(getToken, "/api/generate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      for (const file of data.files as Array<{ name: string; content: string }>) {
        const blob = new Blob([file.content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.name;
        anchor.click();
        URL.revokeObjectURL(url);
      }

      setGenerateMessage(`Generated ${data.files.length} launch assets for ${data.product}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handleCreateProject() {
    if (!projectName.trim()) return;
    try {
      const response = await authFetch(getToken, "/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: projectName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create project");
      }
      setProjectName("");
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !selectedProject) return;
    try {
      const response = await authFetch(getToken, "/api/projects", {
        method: "PATCH",
        body: JSON.stringify({ projectId: selectedProject, email: inviteEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to invite member");
      }
      setInviteEmail("");
      setGenerateMessage(`Invite sent to ${inviteEmail.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    }
  }

  if (authLoading || loading) {
    return <p className="dashboard-status">Loading dashboard…</p>;
  }

  if (!user || !overview) {
    return null;
  }

  const upgraded = searchParams.get("upgraded");

  return (
    <section className="section dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back{user.displayName ? `, ${user.displayName}` : ""}
          </h1>
          <p className="dashboard-subtitle">{overview.user.email}</p>
        </div>
        <div className="dashboard-header-actions">
          <span className="plan-badge">{planDisplayName(overview.user.plan)} plan</span>
          {overview.user.plan === "free" ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleUpgrade("pro")}
              disabled={checkoutLoading === "pro"}
            >
              {checkoutLoading === "pro" ? <Spinner /> : "Upgrade to Pro"}
            </button>
          ) : null}
          {overview.user.plan === "pro" ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleUpgrade("team")}
              disabled={checkoutLoading === "team"}
            >
              {checkoutLoading === "team" ? <Spinner /> : "Upgrade to Team"}
            </button>
          ) : null}
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>

      {upgraded ? (
        <div className="dashboard-notice success">
          Your {planDisplayName(upgraded as PlanId)} plan is active. Refresh if features do not update
          immediately.
        </div>
      ) : null}

      {error ? (
        <div className="dashboard-notice error" role="alert">
          {error}
          <button type="button" className="notice-dismiss" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      {generateMessage ? (
        <div className="dashboard-notice success">
          {generateMessage}
          <button type="button" className="notice-dismiss" onClick={() => setGenerateMessage(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="dashboard-tabs" role="tablist">
        {(
          [
            ["score", "Score"],
            ["playbooks", "Playbooks"],
            ["generate", "Launch assets"],
            ["projects", "Projects"],
            ["cli", "CLI"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`dashboard-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "score" ? (
        <div className="dashboard-panel">
          <div className="score-hero">
            <div>
              <p className="panel-kicker">Monetready Score</p>
              <h2>
                {overview.score.total}/{overview.score.maxTotal}{" "}
                <span className="score-grade">Grade {overview.score.grade}</span>
              </h2>
              <p className="panel-lead">
                {overview.score.readyToLaunch
                  ? "Your product is launch-ready."
                  : "Fix the gaps below before you launch."}
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void loadOverview()}>
              Re-run audit
            </button>
          </div>

          <div className="score-grid">
            {overview.score.categories.map((category) => (
              <div key={category.category} className="score-card">
                <h3>{category.category}</h3>
                <p className="score-value">
                  {category.score}/{category.maxScore}
                </p>
              </div>
            ))}
          </div>

          <div className="dashboard-columns">
            <div>
              <h3 className="panel-subtitle">Top actions</h3>
              <ul className="checklist">
                {overview.score.topActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="panel-subtitle">Launch checklist</h3>
              <ul className="checklist">
                {overview.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "playbooks" ? (
        <div className="dashboard-panel">
          <p className="panel-lead">
            {overview.features.playbooksExecute
              ? "Simulate or execute all 6 revenue playbooks with Stripe + email integrations."
              : "Free plan includes dry-run simulation. Upgrade to Pro for live execution."}
          </p>
          <div className="playbook-list">
            {overview.playbooks.map((playbook) => (
              <div key={playbook.id} className="playbook-row">
                <div>
                  <h3>{playbook.name}</h3>
                  <p>{playbook.description}</p>
                  <p className="playbook-meta">
                    {playbook.category} · {playbook.enabled ? "Enabled in spec" : "Not in spec"}
                  </p>
                </div>
                <div className="playbook-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={runLoading === playbook.id}
                    onClick={() => void handleRunPlaybook(playbook.id, false)}
                  >
                    {runLoading === playbook.id ? <Spinner /> : "Simulate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!overview.features.playbooksExecute || runLoading === playbook.id}
                    onClick={() => void handleRunPlaybook(playbook.id, true)}
                  >
                    Execute live
                  </button>
                </div>
              </div>
            ))}
          </div>
          {runResult ? (
            <div className="run-result">
              <h3>Last run: {runResult.playbookId}</h3>
              <p className="playbook-meta">Status: {runResult.status}</p>
              {runResult.actions.map((action) => (
                <pre key={`${action.type}-${action.output.slice(0, 20)}`} className="run-output">
                  [{action.type}] {action.output}
                </pre>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "generate" ? (
        <div className="dashboard-panel">
          <p className="panel-lead">
            Generate landing, pricing, and legal pages from your monetready.yaml spec.
          </p>
          {overview.features.launchAssetGeneration ? (
            <>
              <p className="panel-meta">
                Integrations: Stripe {overview.integrations.stripe ? "on" : "off"} · Email{" "}
                {overview.integrations.email} · Analytics {overview.integrations.analytics}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={generateLoading}
                onClick={() => void handleGenerate()}
              >
                {generateLoading ? (
                  <>
                    <Spinner /> Generating…
                  </>
                ) : (
                  "Generate launch assets"
                )}
              </button>
            </>
          ) : (
            <div className="upgrade-callout">
              <p>Launch asset generation is included on Pro and Team.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => void handleUpgrade("pro")}
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      ) : null}

      {tab === "projects" ? (
        <div className="dashboard-panel">
          <p className="panel-lead">
            {overview.features.multiProductDashboard
              ? "Manage multiple products and invite teammates."
              : "Free and Pro include one product workspace. Team unlocks multiple products."}
          </p>
          <div className="project-list">
            {overview.projects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p className="playbook-meta">
                  {project.memberIds.length} member{project.memberIds.length === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
          {overview.features.multiProductDashboard ? (
            <div className="form-inline">
              <input
                type="text"
                placeholder="New product name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleCreateProject()}>
                Add product
              </button>
            </div>
          ) : null}
          {overview.features.teamCollaboration ? (
            <div className="invite-box">
              <h3 className="panel-subtitle">Invite teammate</h3>
              <div className="form-inline">
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                  {overview.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleInvite()}>
                  Send invite
                </button>
              </div>
            </div>
          ) : null}
          {overview.features.prioritySupport ? (
            <p className="panel-meta">
              Priority support:{" "}
              <a href="mailto:hello@monetready.com?subject=Team%20priority%20support">
                hello@monetready.com
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "cli" ? (
        <div className="dashboard-panel">
          <p className="panel-lead">
            Self-hosted CLI is included on every plan. Run Monetready locally in your own repo.
          </p>
          <div className="cli-grid">
            {Object.entries(overview.cli).map(([label, command]) => (
              <div key={label} className="cli-card">
                <span className="cli-label">{label}</span>
                <code>{command}</code>
              </div>
            ))}
          </div>
          <Link href="https://github.com/kory-kaai/monetready" className="btn btn-secondary btn-sm">
            View CLI on GitHub
          </Link>
        </div>
      ) : null}
    </section>
  );
}
