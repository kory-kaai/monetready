import { NextResponse } from "next/server";
import {
  generateAllLegalPages,
  generatePages,
  scoreProject,
} from "@monetready/core";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getMonorepoRoot } from "@/lib/paths";
import { getSiteSpec } from "@/lib/spec";
import { getPlanFeatures } from "@/lib/plans";
import { getOrCreateUser } from "@/lib/users";

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

    const spec = await getSiteSpec();
    const projectRoot = getMonorepoRoot();
    const { result } = await scoreProject(projectRoot);
    const { landing, pricing } = generatePages(spec);
    const legal = generateAllLegalPages(spec);

    const files: Array<{ name: string; content: string }> = [
      { name: "index.html", content: landing },
      { name: "pricing.html", content: pricing },
      ...Object.entries(legal).map(([name, content]) => ({ name, content })),
    ];

    return NextResponse.json({
      product: spec.product.name,
      score: result.total,
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
