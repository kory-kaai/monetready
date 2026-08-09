export {
  MonetreadySpecSchema,
  DEFAULT_MONETREADY_SPEC,
  DEFAULT_PLAYBOOK_IDS,
  type MonetreadySpec,
  type PricingTier,
  type GtmChannel,
} from "./schema/monetready-spec.js";
export type { MonetreadyScoreResult, ScoreFinding, ProjectSignals } from "./score/types.js";
export type { Playbook, PlaybookRunResult } from "./playbooks/types.js";
export { createDefaultSpec, loadMonetreadySpec, serializeMonetreadySpec } from "./spec/loader.js";
export { calculateMonetreadyScore } from "./score/engine.js";
export { detectProjectSignals } from "./score/signals.js";
export { loadPlaybooks, loadPlaybookById } from "./playbooks/loader.js";
export { runPlaybook } from "./playbooks/runner.js";
export type { RunPlaybookOptions } from "./playbooks/runner.js";
export {
  evaluatePlaybookCondition,
  findMatchingPlaybooks,
  getAnalyticsEventMappings,
  getStripeEventMappings,
} from "./playbooks/triggers.js";
export { loadIntegrationContext } from "./integrations/context.js";
export type { IntegrationContext } from "./integrations/context.js";
export { sendResendEmail } from "./integrations/resend.js";
export { postSlackMessage } from "./integrations/slack.js";
export { postWebhook } from "./integrations/webhook.js";
export {
  resolvePostHogKey,
  resolvePostHogHost,
} from "./integrations/posthog.js";
export {
  resolveMonetreadyWebhookSecret,
  resolveStripeWebhookSecret,
  verifyStripeWebhookSignature,
} from "./integrations/stripe.js";
export { parseEmailTemplate } from "./integrations/email-template.js";
export {
  substituteTemplateVars,
  buildEmailTemplateVars,
} from "./integrations/email-template.js";
export {
  startWebhookServer,
  getStripePlaybookMap,
  runPlaybookById,
} from "./webhooks/server.js";
export type { WebhookServerOptions, WebhookServerHandle } from "./webhooks/server.js";
export { generateLandingPage, generatePricingPage, generatePages } from "./generate/pages.js";
export { generateReadinessReport } from "./generate/report.js";
export { writeGeneratedPages } from "./generate/writer.js";
export type { GeneratePagesOptions, GeneratePagesResult } from "./generate/writer.js";
export { startDashboardServer, getDefaultDashboardDataPath, resolveDashboardExecuteEnabled } from "./dashboard/server.js";
export type { DashboardServerOptions, DashboardServerHandle } from "./dashboard/server.js";
export { buildLaunchChecklist } from "./launch/checklist.js";
export type { FireResult } from "./launch/checklist.js";
export { findPlaybooksDir, scoreProject } from "./project.js";
export {
  loadWorkspace,
  resolveWorkspaceProduct,
  resolveWorkspaceProducts,
  loadWorkspaceOverview,
} from "./workspace/loader.js";
export type { Workspace, WorkspaceProduct } from "./workspace/types.js";
export {
  pollAnalyticsPlaybooks,
  runScheduledPlaybooks,
} from "./playbooks/poll.js";
export type {
  PollAnalyticsOptions,
  PollAnalyticsResult,
  RunScheduledPlaybooksOptions,
  RunScheduledPlaybooksResult,
} from "./playbooks/poll.js";
export { shouldRunCron, getScheduledPlaybooks } from "./playbooks/schedule.js";
export {
  fetchInactiveUsers,
  loadPostHogQueryConfig,
  queryPostHog,
  resolvePostHogPersonalApiKey,
  resolvePostHogProjectId,
} from "./integrations/posthog.js";
export type { InactiveUser, PostHogQueryConfig } from "./integrations/posthog.js";
