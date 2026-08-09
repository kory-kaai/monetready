import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { isApiAuthError, verifyAuthToken } from "@/lib/auth/api";
import { getPlanFeatures } from "@/lib/plans";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getOrCreateUser, listUserProjects } from "@/lib/users";

interface CreateProjectBody {
  name?: string;
}

interface InviteBody {
  projectId?: string;
  email?: string;
}

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const projects = await listUserProjects(decoded.uid);
    return NextResponse.json({ projects });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to list projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);
    const body = (await request.json()) as CreateProjectBody;
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const existing = await listUserProjects(decoded.uid);
    if (!features.multiProductDashboard && existing.length >= 1) {
      return NextResponse.json(
        { error: "Multi-product dashboard requires a Team plan." },
        { status: 403 },
      );
    }

    const db = getAdminFirestore();
    const doc = await db.collection("projects").add({
      name,
      ownerId: decoded.uid,
      memberIds: [decoded.uid],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: doc.id, name });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    const user = await getOrCreateUser(decoded.uid, decoded.email ?? "");
    const features = getPlanFeatures(user.plan);

    if (!features.teamCollaboration) {
      return NextResponse.json(
        { error: "Team collaboration requires a Team plan." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as InviteBody;
    const projectId = body.projectId?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!projectId || !email) {
      return NextResponse.json({ error: "Project ID and email are required" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const ref = db.collection("projects").doc(projectId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.ownerId !== decoded.uid) {
      return NextResponse.json({ error: "Only the project owner can invite members" }, { status: 403 });
    }

    const pendingInvites = Array.isArray(data.pendingInvites) ? data.pendingInvites.map(String) : [];
    if (!pendingInvites.includes(email)) {
      pendingInvites.push(email);
    }

    await ref.set(
      {
        pendingInvites,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true, pendingInvites });
  } catch (error) {
    if (isApiAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}
