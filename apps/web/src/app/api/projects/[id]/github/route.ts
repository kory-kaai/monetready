import { NextResponse } from "next/server";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getGithubToken } from "@/lib/github";
import {
  detectGithubRepoSignals,
  fetchGithubMonetreadyYaml,
} from "@/lib/github-api";
import {
  getProjectById,
  isProjectMember,
  updateProjectGithubRepo,
  updateProjectSpec,
} from "@/lib/projects";

interface GithubBody {
  githubRepo?: string;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = await verifyAuthToken(request);

    if (!(await isProjectMember(id, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = (await request.json()) as GithubBody;
    const githubRepo = body.githubRepo?.trim() || null;

    if (githubRepo && !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(githubRepo)) {
      return NextResponse.json(
        { error: "Invalid repository format. Use owner/repo" },
        { status: 400 },
      );
    }

    await updateProjectGithubRepo(id, githubRepo);
    return NextResponse.json({ ok: true, githubRepo });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to update repository";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = await verifyAuthToken(request);

    if (!(await isProjectMember(id, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const token = await getGithubToken(decoded.uid);
    if (!token) {
      return NextResponse.json(
        { error: "Connect GitHub first to sync monetready.yaml from a repository" },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as GithubBody;
    let githubRepo = body.githubRepo?.trim();

    if (!githubRepo) {
      const project = await getProjectById(id);
      githubRepo = project?.githubRepo ?? undefined;
    }

    if (!githubRepo) {
      return NextResponse.json(
        { error: "Set a GitHub repository (owner/repo) before syncing" },
        { status: 400 },
      );
    }

    const specYaml = await fetchGithubMonetreadyYaml(githubRepo, token);
    if (!specYaml) {
      return NextResponse.json(
        { error: `No monetready.yaml found in ${githubRepo}` },
        { status: 404 },
      );
    }

    const spec = await updateProjectSpec(id, specYaml, "github");
    await updateProjectGithubRepo(id, githubRepo);

    const githubSignals = await detectGithubRepoSignals(githubRepo, token);

    return NextResponse.json({
      ok: true,
      githubRepo,
      product: {
        name: spec.product.name,
        tagline: spec.product.tagline,
      },
      githubSignals,
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "GitHub sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
