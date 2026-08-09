export type PlanId = "free" | "pro" | "team";

export interface PlanFeatures {
  scoreAudits: boolean;
  playbooksList: boolean;
  playbooksDryRun: boolean;
  playbooksExecute: boolean;
  stripeEmailIntegrations: boolean;
  launchAssetGeneration: boolean;
  selfHostedCli: boolean;
  multiProductDashboard: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
}

const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  free: {
    scoreAudits: true,
    playbooksList: true,
    playbooksDryRun: true,
    playbooksExecute: false,
    stripeEmailIntegrations: false,
    launchAssetGeneration: false,
    selfHostedCli: true,
    multiProductDashboard: false,
    teamCollaboration: false,
    prioritySupport: false,
  },
  pro: {
    scoreAudits: true,
    playbooksList: true,
    playbooksDryRun: true,
    playbooksExecute: true,
    stripeEmailIntegrations: true,
    launchAssetGeneration: true,
    selfHostedCli: true,
    multiProductDashboard: false,
    teamCollaboration: false,
    prioritySupport: false,
  },
  team: {
    scoreAudits: true,
    playbooksList: true,
    playbooksDryRun: true,
    playbooksExecute: true,
    stripeEmailIntegrations: true,
    launchAssetGeneration: true,
    selfHostedCli: true,
    multiProductDashboard: true,
    teamCollaboration: true,
    prioritySupport: true,
  },
};

export function normalizePlanId(value: unknown): PlanId {
  if (value === "pro" || value === "team") {
    return value;
  }
  return "free";
}

export function getPlanFeatures(plan: PlanId): PlanFeatures {
  return PLAN_FEATURES[plan];
}

export function planDisplayName(plan: PlanId): string {
  switch (plan) {
    case "pro":
      return "Pro";
    case "team":
      return "Team";
    default:
      return "Free";
  }
}

export function requiredPlanFor(feature: keyof PlanFeatures): PlanId {
  if (PLAN_FEATURES.free[feature]) {
    return "free";
  }
  if (PLAN_FEATURES.pro[feature]) {
    return "pro";
  }
  return "team";
}
