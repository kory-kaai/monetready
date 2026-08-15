"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GithubAuthProvider, linkWithPopup, signInWithPopup, signOut } from "firebase/auth";
import type { MonetreadyScoreResult, PlaybookRunResult } from "@monetready/core";
import { AppShell } from "@/components/layout/AppShell";
import { AppErrorState } from "@/components/ui/AppErrorState";
import { IconGithub, Spinner } from "@/components/ui/Icons";
import { PageLoader } from "@/components/ui/PageLoader";
import { authFetch, useAuthUser } from "@/hooks/useAuthUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { PlanFeatures, PlanId } from "@/lib/plans";
import { planDisplayName } from "@/lib/plans";
import { isAdminRole } from "@/lib/roles";
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
  githubRepo: string | null;
  specSource: string;
  specSyncedAt: string | null;
  productName: string;
  productTagline: string | null;
}

interface DashboardOverview {
  user: { email: string; plan: PlanId; role: string };
  features: PlanFeatures;
  activeProjectId: string | null;
  product: { name: string; tagline?: string };
  score: MonetreadyScoreResult;
  checklist: string[];
  nextSteps: string[];
  playbooks: DashboardPlaybook[];
  projects: DashboardProject[];
  githubSignals: Record<string, boolean> | null;
  integrations: {
    stripe: boolean;
    email: string;
    analytics: string;
    github: string | null;
  };
  cli: {
    install: string;
    init: string;
    score: string;
    playbooks: string;
    generate: string;
  };
}

type DashboardTab = "score" | "playbooks" | "generate" | "projects" | "cli";

const USER_NAV_ITEMS = [
  { id: "score", label: "Score" },
  { id: "playbooks", label: "Playbooks" },
  { id: "generate", label: "Launch assets" },
  { id: "projects", label: "Projects" },
  { id: "cli", label: "CLI" },
] as const;

interface DashboardClientProps {
  productName: string;
}

export function DashboardClient({ productName }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, getToken } = useAuthUser();
  const { profile } = useUserProfile();
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
  const [specYaml, setSpecYaml] = useState("");
  const [specLoading, setSpecLoading] = useState(false);
  const [specSaving, setSpecSaving] = useState(false);
  const [githubRepoInput, setGithubRepoInput] = useState("");
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const loadOverview = useCallback(
    async (projectId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
        const response = await authFetch(getToken, `/api/dashboard/overview${query}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load dashboard");
        }
        setOverview(data);
        const activeId = data.activeProjectId ?? data.projects?.[0]?.id ?? "";
        if (activeId) {
          setSelectedProject(activeId);
          const project = data.projects?.find((p: DashboardProject) => p.id === activeId);
          if (project?.githubRepo) {
            setGithubRepoInput(project.githubRepo);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  const loadGithubStatus = useCallback(async () => {
    try {
      const response = await authFetch(getToken, "/api/github/connect");
      const data = await response.json();
      if (response.ok) {
        setGithubConnected(data.connected === true);
        setGithubUsername(data.username ?? null);
      }
    } catch {
      // non-fatal
    }
  }, [getToken]);

  const loadProjectSpec = useCallback(
    async (projectId: string) => {
      if (!projectId) return;
      setSpecLoading(true);
      try {
        const response = await authFetch(getToken, `/api/projects/${projectId}/spec`);
        const data = await response.json();
        if (response.ok) {
          setSpecYaml(data.specYaml ?? "");
        }
      } catch {
        // non-fatal
      } finally {
        setSpecLoading(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      void loadOverview();
      void loadGithubStatus();
    }
  }, [user, loadOverview, loadGithubStatus]);

  useEffect(() => {
    if (tab === "projects" && selectedProject) {
      void loadProjectSpec(selectedProject);
    }
  }, [tab, selectedProject, loadProjectSpec]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.push("/");
  }

  function handleProjectChange(projectId: string) {
    setSelectedProject(projectId);
    const project = overview?.projects.find((p) => p.id === projectId);
    setGithubRepoInput(project?.githubRepo ?? "");
    void loadOverview(projectId);
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
    if (!selectedProject) return;
    setRunLoading(id);
    setRunResult(null);
    try {
      const response = await authFetch(getToken, `/api/playbooks/${id}/run`, {
        method: "POST",
        body: JSON.stringify({ execute, projectId: selectedProject }),
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
    if (!selectedProject) return;
    setGenerateLoading(true);
    setGenerateMessage(null);
    try {
      const response = await authFetch(getToken, "/api/generate", {
        method: "POST",
        body: JSON.stringify({ projectId: selectedProject }),
      });
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
      await loadOverview(data.id);
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

  async function handleConnectGithub() {
    setGithubLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const provider = new GithubAuthProvider();
      provider.addScope("repo");

      const result = auth.currentUser
        ? await linkWithPopup(auth.currentUser, provider)
        : await signInWithPopup(auth, provider);

      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (!accessToken) {
        throw new Error("GitHub did not return an access token. Try again.");
      }

      const response = await authFetch(getToken, "/api/github/connect", {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to store GitHub connection");
      }

      setGithubConnected(true);
      setGithubUsername(data.username ?? null);
      setGenerateMessage(`GitHub connected as ${data.username ?? "user"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub connection failed");
    } finally {
      setGithubLoading(false);
    }
  }

  async function handleDisconnectGithub() {
    setGithubLoading(true);
    try {
      await authFetch(getToken, "/api/github/connect", { method: "DELETE" });
      setGithubConnected(false);
      setGithubUsername(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect GitHub");
    } finally {
      setGithubLoading(false);
    }
  }

  async function handleSaveGithubRepo() {
    if (!selectedProject) return;
    try {
      const response = await authFetch(getToken, `/api/projects/${selectedProject}/github`, {
        method: "PATCH",
        body: JSON.stringify({ githubRepo: githubRepoInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save repository");
      }
      setGenerateMessage(`Repository set to ${data.githubRepo ?? "none"}.`);
      await loadOverview(selectedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save repository");
    }
  }

  async function handleSyncGithub() {
    if (!selectedProject) return;
    setSyncLoading(true);
    setError(null);
    try {
      const response = await authFetch(getToken, `/api/projects/${selectedProject}/github`, {
        method: "POST",
        body: JSON.stringify({ githubRepo: githubRepoInput.trim() || undefined }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "GitHub sync failed");
      }
      setGenerateMessage(`Synced monetready.yaml from ${data.githubRepo}.`);
      await loadOverview(selectedProject);
      await loadProjectSpec(selectedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sync failed");
    } finally {
      setSyncLoading(false);
    }
  }

  async function handleSaveSpec() {
    if (!selectedProject) return;
    setSpecSaving(true);
    setError(null);
    try {
      const response = await authFetch(getToken, `/api/projects/${selectedProject}/spec`, {
        method: "PUT",
        body: JSON.stringify({ specYaml }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save spec");
      }
      setGenerateMessage(`Saved spec for ${data.product?.name ?? "project"}.`);
      await loadOverview(selectedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save spec");
    } finally {
      setSpecSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <PageLoader
        message="Forging your dashboard"
        submessage="Loading score, playbooks, and projects"
      />
    );
  }

  if (!user) {
    return null;
  }

  if (!overview) {
    return (
      <div className="app-layout">
        <div className="bg-mesh" aria-hidden />
        <AppErrorState
          title="Couldn't load your dashboard"
          message={error ?? "We couldn't reach the server. Check your connection and try again."}
          onRetry={() => void loadOverview()}
        />
      </div>
    );
  }

  const upgraded = searchParams.get("upgraded");
  const activeProject = overview.projects.find((p) => p.id === selectedProject);

  return (
    <AppShell
      productName={productName}
      title="User dashboard"
      items={[...USER_NAV_ITEMS]}
      activeId={tab}
      onSelect={(id) => setTab(id as DashboardTab)}
      sidebarFooter={
        <>
          {profile && isAdminRole(profile.role) ? (
            <Link href="/admin" className="app-sidebar-link">
              Admin panel
            </Link>
          ) : null}
          <button type="button" className="app-sidebar-link" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </>
      }
    >
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back{user.displayName ? `, ${user.displayName}` : ""}
            </h1>
            <p className="dashboard-subtitle">{overview.user.email}</p>
          </div>
          <div className="dashboard-header-actions">
            {overview.projects.length > 0 ? (
              <select
                className="project-switcher"
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                aria-label="Active product"
              >
                {overview.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.productName || project.name}
                  </option>
                ))}
              </select>
            ) : null}
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
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
          </div>
        </div>

        {overview.product.name ? (
          <p className="panel-meta active-product-label">
            Scoring <strong>{overview.product.name}</strong>
            {overview.product.tagline ? ` — ${overview.product.tagline}` : ""}
            {activeProject?.specSource === "github" ? " · synced from GitHub" : ""}
          </p>
        ) : null}

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
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => void loadOverview(selectedProject)}
              >
                Re-run audit
              </button>
            </div>

            {overview.githubSignals ? (
              <p className="panel-meta">
                GitHub signals: README {overview.githubSignals.hasReadme ? "✓" : "✗"} · LICENSE{" "}
                {overview.githubSignals.hasLicense ? "✓" : "✗"} · CI{" "}
                {overview.githubSignals.hasCi ? "✓" : "✗"}
              </p>
            ) : null}

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
                ? "Simulate or execute revenue playbooks for your active product."
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
                      disabled={runLoading === playbook.id || !selectedProject}
                      onClick={() => void handleRunPlaybook(playbook.id, false)}
                    >
                      {runLoading === playbook.id ? <Spinner /> : "Simulate"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={
                        !overview.features.playbooksExecute ||
                        runLoading === playbook.id ||
                        !selectedProject
                      }
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
              Generate landing, pricing, and legal pages from your project&apos;s monetready.yaml.
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
                  disabled={generateLoading || !selectedProject}
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
                ? "Manage products, connect GitHub repos, and edit monetready.yaml."
                : "Connect your repo or edit monetready.yaml for your product workspace."}
            </p>

            <div className="github-connect-box">
              <h3 className="panel-subtitle">GitHub</h3>
              {githubConnected ? (
                <p className="panel-meta">
                  Connected as <strong>{githubUsername}</strong>
                </p>
              ) : (
                <p className="panel-meta">
                  Connect GitHub to pull monetready.yaml from your repository.
                </p>
              )}
              <div className="form-inline">
                {githubConnected ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={githubLoading}
                    onClick={() => void handleDisconnectGithub()}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-github"
                    disabled={githubLoading}
                    onClick={() => void handleConnectGithub()}
                  >
                    {githubLoading ? <Spinner /> : <IconGithub />}
                    Connect GitHub
                  </button>
                )}
              </div>
            </div>

            {selectedProject ? (
              <div className="github-repo-box">
                <h3 className="panel-subtitle">Repository</h3>
                <p className="panel-meta">owner/repo with a monetready.yaml at the root</p>
                <div className="form-inline">
                  <input
                    type="text"
                    placeholder="kory-kaai/my-saas"
                    value={githubRepoInput}
                    onChange={(e) => setGithubRepoInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => void handleSaveGithubRepo()}
                  >
                    Save repo
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!githubConnected || syncLoading}
                    onClick={() => void handleSyncGithub()}
                  >
                    {syncLoading ? <Spinner /> : "Sync from GitHub"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="spec-editor-box">
              <h3 className="panel-subtitle">monetready.yaml</h3>
              {specLoading ? (
                <p className="panel-meta">Loading spec…</p>
              ) : (
                <>
                  <textarea
                    className="spec-editor"
                    value={specYaml}
                    onChange={(e) => setSpecYaml(e.target.value)}
                    rows={18}
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={specSaving || !selectedProject}
                    onClick={() => void handleSaveSpec()}
                  >
                    {specSaving ? <Spinner /> : "Save spec"}
                  </button>
                </>
              )}
            </div>

            <div className="project-list">
              {overview.projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-card${project.id === selectedProject ? " active" : ""}`}
                >
                  <h3>{project.productName || project.name}</h3>
                  <p className="playbook-meta">
                    {project.memberIds.length} member{project.memberIds.length === 1 ? "" : "s"}
                    {project.githubRepo ? ` · ${project.githubRepo}` : ""}
                    {project.specSource !== "default" ? ` · ${project.specSource}` : ""}
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
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void handleCreateProject()}
                >
                  Add product
                </button>
              </div>
            ) : null}

            {overview.features.teamCollaboration ? (
              <div className="invite-box">
                <h3 className="panel-subtitle">Invite teammate</h3>
                <div className="form-inline">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
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
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => void handleInvite()}
                  >
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
              Self-hosted CLI is included on every plan. Run Monetready locally in your own repo — then
              sync monetready.yaml to the dashboard via GitHub.
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
    </AppShell>
  );
}
