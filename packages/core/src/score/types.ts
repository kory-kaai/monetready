export type ScoreCategory =
  | "pricing"
  | "onboarding"
  | "conversion"
  | "distribution"
  | "integrations"
  | "differentiation";

export type ScoreSeverity = "critical" | "warning" | "info" | "pass";

export interface ScoreFinding {
  id: string;
  category: ScoreCategory;
  severity: ScoreSeverity;
  title: string;
  description: string;
  recommendation: string;
  points: number;
  maxPoints: number;
}

export interface CategoryScore {
  category: ScoreCategory;
  score: number;
  maxScore: number;
  findings: ScoreFinding[];
}

export interface MonetreadyScoreResult {
  total: number;
  maxTotal: number;
  grade: "A" | "B" | "C" | "D" | "F";
  categories: CategoryScore[];
  topActions: string[];
  readyToLaunch: boolean;
}

export interface ProjectSignals {
  hasReadme: boolean;
  hasLicense: boolean;
  hasPricingPage: boolean;
  hasLandingPage: boolean;
  hasStripeIntegration: boolean;
  hasAnalytics: boolean;
  hasEmailIntegration: boolean;
  hasOnboardingFlow: boolean;
  hasTests: boolean;
  hasCi: boolean;
  readmeWordCount: number;
  hasCallToAction: boolean;
  hasFaq: boolean;
  hasSocialProof: boolean;
}
