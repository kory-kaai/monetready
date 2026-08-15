import { NextResponse } from "next/server";
import {
  buildLaunchChecklist,
  createDefaultSpec,
  findPlaybooksDir,
  loadPlaybooks,
  scoreSpec,
  type ProjectSignals,
} from "@monetready/core";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getGithubToken } from "@/lib/github";
import { detectGithubRepoSignals } from "@/lib/github-api";
import { getPlanFeatures } from "@/lib/plans";
import {
  getProjectById,
  getProjectSpec,
  isProjectMember,
} from "@/lib/projects";
import { getOrCreateUser, listUserProjects } from "@/lib/users";

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId")?.trim();

    let projects = await listUserProjects(decoded.uid);
    let activeProjectId = projectId ?? projects[0]?.id ?? null;

    if (activeProjectId && !(await isProjectMember(activeProjectId, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!activeProjectId && projects.length === 0) {
      projects = await listUserProjects(decoded.uid);
      activeProjectId = projects[0]?.id ?? null;
    }

    let spec = createDefaultSpec();
    let result = scoreSpec(spec);
    let checklist: string[] = [];
    let nextSteps: string[] = [];
    let allPlaybooks: Awaited<ReturnType<typeof loadPlaybooks>> = [];
    let githubSignals: Record<string, boolean> | null = null;

    if (activeProjectId) {
      try {
        spec = await getProjectSpec(activeProjectId);
        const project = await getProjectById(activeProjectId);

        let signalOverrides: Partial<ProjectSignals> | undefined;
        if (project?.githubRepo) {
          const token = await getGithubToken(decoded.uid);
          if (token) {
            signalOverrides = await detectGithubRepoSignals(project.githubRepo, token);
            githubSignals = {
              hasReadme: signalOverrides.hasReadme ?? false,
              hasLicense: signalOverrides.hasLicense ?? false,
              hasCi: signalOverrides.hasCi ?? false,
            };
          }
        }

        result = scoreSpec(spec, signalOverrides);
        const fire = buildLaunchChecklist(spec, result);
        checklist = fire.checklist;
        nextSteps = fire.nextSteps;
      } catch (scoringError) {
        console.error("Dashboard scoring fallback:", scoringError);
      }
    }

    try {
      const playbooksDir = await findPlaybooksDir(process.cwd());
      allPlaybooks = playbooksDir ? await loadPlaybooks(playbooksDir) : [];
    } catch (playbooksError) {
      console.error("Dashboard playbooks fallback:", playbooksError);
    }

    return NextResponse.json({
      user: {
        email: user.email,
        plan: user.plan,
        role: user.role,
      },
      features,
      activeProjectId,
      product: {
        name: spec.product.name,
        tagline: spec.product.tagline,
      },
      score: result,
      checklist,
      nextSteps,
      playbooks: allPlaybooks.map((playbook) => ({
        id: playbook.id,
        name: playbook.name,
        description: playbook.description,
        category: playbook.category,
        trigger: playbook.trigger,
        enabled: spec.playbooks.includes(playbook.id),
      })),
      projects,
      githubSignals,
      integrations: {
        stripe: spec.integrations.stripe,
        email: spec.integrations.email,
        analytics: spec.integrations.analytics,
        github: spec.integrations.github ?? null,
      },
      cli: {
        install: "npm install -g monetready-cli",
        init: "monetready init",
        score: "monetready score",
        playbooks: "monetready playbooks list",
        generate: "monetready generate pages",
      },
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Dashboard overview error:", error);
    const message = error instanceof Error ? error.message : "Failed to load dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
