import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import type { PlanId } from "@/lib/plans";
import { normalizePlanId } from "@/lib/plans";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { normalizeUserRole, type UserRole } from "@/lib/roles";

export interface UserRecord {
  uid: string;
  email: string;
  plan: PlanId;
  role: UserRole;
  stripeCustomerId?: string;
  createdAt?: string;
}

function mapUserDoc(uid: string, email: string, data: DocumentData): UserRecord {
  return {
    uid,
    email: typeof data.email === "string" ? data.email : email,
    plan: normalizePlanId(data.plan),
    role: normalizeUserRole(data.role),
    stripeCustomerId: typeof data.stripeCustomerId === "string" ? data.stripeCustomerId : undefined,
    createdAt:
      data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().toISOString()
        : undefined,
  };
}

export async function getOrCreateUser(uid: string, email: string): Promise<UserRecord> {
  const db = getAdminFirestore();
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    return mapUserDoc(uid, email, snap.data()!);
  }

  const record: UserRecord = { uid, email, plan: "free", role: "user" };
  await ref.set({
    email,
    plan: "free",
    role: "user",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await ensureDefaultProject(uid, email);
  return record;
}

export async function updateUserPlan(
  uid: string,
  plan: PlanId,
  stripeCustomerId?: string,
): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("users").doc(uid).set(
    {
      plan,
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function ensureDefaultProject(uid: string, email: string): Promise<void> {
  const db = getAdminFirestore();
  const existing = await db
    .collection("projects")
    .where("ownerId", "==", uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    return;
  }

  const projectName = email.split("@")[0] || "My product";
  await db.collection("projects").add({
    name: projectName,
    ownerId: uid,
    memberIds: [uid],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function listUserProjects(uid: string) {
  const db = getAdminFirestore();
  const owned = await db.collection("projects").where("ownerId", "==", uid).get();
  const member = await db.collection("projects").where("memberIds", "array-contains", uid).get();

  const byId = new Map<string, { id: string; name: string; ownerId: string; memberIds: string[] }>();

  for (const doc of [...owned.docs, ...member.docs]) {
    const data = doc.data();
    byId.set(doc.id, {
      id: doc.id,
      name: String(data.name ?? "Untitled"),
      ownerId: String(data.ownerId ?? ""),
      memberIds: Array.isArray(data.memberIds) ? data.memberIds.map(String) : [],
    });
  }

  return [...byId.values()];
}

export async function listAllUsers(): Promise<UserRecord[]> {
  const db = getAdminFirestore();
  const snap = await db.collection("users").get();

  return snap.docs
    .map((doc) => mapUserDoc(doc.id, "", doc.data()))
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
}
