import {
  createDefaultSpec,
  parseMonetreadySpecYaml,
  serializeMonetreadySpec,
  type MonetreadySpec,
} from "@monetready/core";
import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

export type SpecSource = "default" | "manual" | "github";

export interface ProjectRecord {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  githubRepo: string | null;
  specSource: SpecSource;
  specSyncedAt: string | null;
  productName: string;
  productTagline: string | null;
}

function mapProjectDoc(id: string, data: DocumentData): ProjectRecord {
  return {
    id,
    name: String(data.name ?? "Untitled"),
    ownerId: String(data.ownerId ?? ""),
    memberIds: Array.isArray(data.memberIds) ? data.memberIds.map(String) : [],
    githubRepo: typeof data.githubRepo === "string" ? data.githubRepo : null,
    specSource: normalizeSpecSource(data.specSource),
    specSyncedAt:
      data.specSyncedAt && typeof data.specSyncedAt.toDate === "function"
        ? data.specSyncedAt.toDate().toISOString()
        : null,
    productName: String(data.productName ?? data.name ?? "Untitled"),
    productTagline: typeof data.productTagline === "string" ? data.productTagline : null,
  };
}

function normalizeSpecSource(value: unknown): SpecSource {
  if (value === "manual" || value === "github") {
    return value;
  }
  return "default";
}

function defaultSpecForProject(name: string): MonetreadySpec {
  return createDefaultSpec({
    product: {
      name,
      problem: "Describe the problem your product solves",
      solution: "Describe how your product solves it",
      tagline: "Your product tagline",
    },
    integrations: {
      stripe: false,
      analytics: "none",
      email: "none",
    },
  });
}

export function parseProjectSpecYaml(raw: string): MonetreadySpec {
  return parseMonetreadySpecYaml(raw);
}

export async function getProjectById(projectId: string): Promise<ProjectRecord | null> {
  const db = getAdminFirestore();
  const snap = await db.collection("projects").doc(projectId).get();
  if (!snap.exists) {
    return null;
  }
  return mapProjectDoc(snap.id, snap.data()!);
}

export async function isProjectMember(projectId: string, uid: string): Promise<boolean> {
  const project = await getProjectById(projectId);
  if (!project) {
    return false;
  }
  return project.ownerId === uid || project.memberIds.includes(uid);
}

export async function getProjectSpecYaml(projectId: string): Promise<string> {
  const db = getAdminFirestore();
  const snap = await db.collection("projects").doc(projectId).get();
  if (!snap.exists) {
    throw new Error("Project not found");
  }

  const data = snap.data()!;
  if (typeof data.specYaml === "string" && data.specYaml.trim()) {
    return data.specYaml;
  }

  const name = String(data.name ?? "My product");
  return serializeMonetreadySpec(defaultSpecForProject(name));
}

export async function getProjectSpec(projectId: string): Promise<MonetreadySpec> {
  const yaml = await getProjectSpecYaml(projectId);
  return parseMonetreadySpecYaml(yaml);
}

export async function updateProjectSpec(
  projectId: string,
  specYaml: string,
  source: SpecSource = "manual",
): Promise<MonetreadySpec> {
  const spec = parseMonetreadySpecYaml(specYaml);
  const db = getAdminFirestore();

  await db.collection("projects").doc(projectId).set(
    {
      specYaml,
      specSource: source,
      productName: spec.product.name,
      productTagline: spec.product.tagline ?? null,
      updatedAt: FieldValue.serverTimestamp(),
      ...(source === "github" ? { specSyncedAt: FieldValue.serverTimestamp() } : {}),
    },
    { merge: true },
  );

  return spec;
}

export async function updateProjectGithubRepo(
  projectId: string,
  githubRepo: string | null,
): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("projects").doc(projectId).set(
    {
      githubRepo,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export function createDefaultSpecYaml(projectName: string): string {
  return serializeMonetreadySpec(defaultSpecForProject(projectName));
}
