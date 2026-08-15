import { NextResponse } from "next/server";
import {
  generateAllLegalPages,
  generatePages,
  scoreSpec,
} from "@monetready/core";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getPlanFeatures } from "@/lib/plans";
import { getProjectSpec, isProjectMember } from "@/lib/projects";
import { getOrCreateUser } from "@/lib/users";

interface GenerateBody {
  projectId?: string;
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);

    if (!features.launchAssetGeneration) {
      return NextResponse.json(
        { error: "Launch asset generation requires a Pro or Team plan." },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as GenerateBody;
    const projectId = body.projectId?.trim();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    if (!(await isProjectMember(projectId, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const spec = await getProjectSpec(projectId);
    const { total } = scoreSpec(spec);
    const { landing, pricing } = generatePages(spec);
    const legal = generateAllLegalPages(spec);

    const files: Array<{ name: string; content: string }> = [
      { name: "index.html", content: landing },
      { name: "pricing.html", content: pricing },
      ...Object.entries(legal).map(([name, content]) => ({ name, content })),
    ];

    return NextResponse.json({
      product: spec.product.name,
      score: total,
      files,
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
