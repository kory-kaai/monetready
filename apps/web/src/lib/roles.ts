export type UserRole = "user" | "admin";

export function normalizeUserRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : "user";
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}
