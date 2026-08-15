import { NextResponse } from "next/server";
import {
  findPlaybooksDir,
  loadPlaybookById,
  runPlaybook,
} from "@monetready/core";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getPlanFeatures } from "@/lib/plans";
import { getProjectSpec, isProjectMember } from "@/lib/projects";
import { getOrCreateUser } from "@/lib/users";

interface RunBody {
  execute?: boolean;
  projectId?: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);

    const body = (await request.json().catch(() => ({}))) as RunBody;
    const execute = body.execute === true;
    const projectId = body.projectId?.trim();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    if (!(await isProjectMember(projectId, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (execute && !features.playbooksExecute) {
      return NextResponse.json(
        { error: "Live playbook execution requires a Pro or Team plan." },
        { status: 403 },
      );
    }

    const playbooksDir = await findPlaybooksDir(process.cwd());
    if (!playbooksDir) {
      return NextResponse.json({ error: "Playbooks directory not found" }, { status: 500 });
    }

    const playbook = await loadPlaybookById(playbooksDir, id);
    if (!playbook) {
      return NextResponse.json({ error: `Playbook "${id}" not found` }, { status: 404 });
    }

    const spec = await getProjectSpec(projectId);
    const result = await runPlaybook(playbook, spec, { dryRun: !execute });

    return NextResponse.json(result);
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Playbook run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
