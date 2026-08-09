import { NextResponse } from "next/server";
import {
  buildLaunchChecklist,
  calculateMonetreadyScore,
  createDefaultSpec,
  findPlaybooksDir,
  loadPlaybooks,
  scoreProject,
} from "@monetready/core";
import type { MonetreadyScoreResult } from "@monetready/core";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getMonorepoRoot } from "@/lib/paths";
import { getPlanFeatures } from "@/lib/plans";
import { getOrCreateUser, listUserProjects } from "@/lib/users";

function defaultScoreResult(): MonetreadyScoreResult {
  const spec = createDefaultSpec();
  return calculateMonetreadyScore(spec, {
    hasReadme: false,
    hasLicense: false,
    hasPricingPage: false,
    hasLandingPage: false,
    hasStripeIntegration: false,
    hasAnalytics: false,
    hasEmailIntegration: false,
    hasOnboardingFlow: false,
    hasTests: false,
    hasCi: false,
    readmeWordCount: 0,
    hasCallToAction: false,
    hasFaq: false,
    hasSocialProof: false,
  });
}

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);
    const projectRoot = getMonorepoRoot();

    let spec = createDefaultSpec();
    let result = defaultScoreResult();
    let checklist: string[] = [];
    let nextSteps: string[] = [];
    let allPlaybooks: Awaited<ReturnType<typeof loadPlaybooks>> = [];

    try {
      const scored = await scoreProject(projectRoot);
      spec = scored.spec;
      result = scored.result;
      const fire = buildLaunchChecklist(spec, result);
      checklist = fire.checklist;
      nextSteps = fire.nextSteps;
      const playbooksDir = await findPlaybooksDir(projectRoot);
      allPlaybooks = playbooksDir ? await loadPlaybooks(playbooksDir) : [];
    } catch (scoringError) {
      console.error("Dashboard scoring fallback:", scoringError);
    }

    let projects: Awaited<ReturnType<typeof listUserProjects>> = [];
    try {
      projects = await listUserProjects(decoded.uid);
    } catch (projectsError) {
      console.error("Dashboard projects fallback:", projectsError);
    }

    return NextResponse.json({
      user: {
        email: user.email,
        plan: user.plan,
        role: user.role,
      },
      features,
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
      integrations: {
        stripe: spec.integrations.stripe,
        email: spec.integrations.email,
        analytics: spec.integrations.analytics,
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
