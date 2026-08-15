import { NextResponse } from "next/server";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import {
  getProjectSpecYaml,
  isProjectMember,
  parseProjectSpecYaml,
  updateProjectSpec,
} from "@/lib/projects";

interface UpdateSpecBody {
  specYaml?: string;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = await verifyAuthToken(request);

    if (!(await isProjectMember(id, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const specYaml = await getProjectSpecYaml(id);
    const spec = parseProjectSpecYaml(specYaml);

    return NextResponse.json({
      specYaml,
      product: {
        name: spec.product.name,
        tagline: spec.product.tagline,
      },
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to load spec";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = await verifyAuthToken(request);

    if (!(await isProjectMember(id, decoded.uid))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = (await request.json()) as UpdateSpecBody;
    const specYaml = body.specYaml?.trim();

    if (!specYaml) {
      return NextResponse.json({ error: "specYaml is required" }, { status: 400 });
    }

    const spec = await updateProjectSpec(id, specYaml, "manual");

    return NextResponse.json({
      ok: true,
      product: {
        name: spec.product.name,
        tagline: spec.product.tagline,
      },
    });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to update spec";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
