import { NextResponse } from "next/server";
import {
  buildLaunchChecklist,
  findPlaybooksDir,
  loadPlaybooks,
  scoreProject,
} from "@monetready/core";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getMonorepoRoot } from "@/lib/paths";
import { getPlanFeatures } from "@/lib/plans";
import { getOrCreateUser, listUserProjects } from "@/lib/users";

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);
    const projectRoot = getMonorepoRoot();

    const { spec, result } = await scoreProject(projectRoot);
    const fire = buildLaunchChecklist(spec, result);
    const playbooksDir = await findPlaybooksDir(projectRoot);
    const allPlaybooks = playbooksDir ? await loadPlaybooks(playbooksDir) : [];
    const projects = await listUserProjects(decoded.uid);

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
      checklist: fire.checklist,
      nextSteps: fire.nextSteps,
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

    const message = error instanceof Error ? error.message : "Failed to load dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
