import type { MonetreadySpec } from "../schema/monetready-spec.js";
import {
  fetchInactiveUsers,
  loadPostHogQueryConfig,
  type InactiveUser,
} from "../integrations/posthog.js";
import { loadPlaybookById, loadPlaybooks } from "./loader.js";
import { runPlaybook, type RunPlaybookOptions } from "./runner.js";
import { shouldRunCron } from "./schedule.js";
import { findMatchingPlaybooks } from "./triggers.js";
import type { PlaybookRunResult } from "./types.js";

export interface PollAnalyticsOptions {
  projectRoot: string;
  playbooksDir: string;
  spec: MonetreadySpec;
  dryRun?: boolean;
  inactiveHours?: number;
  integrations?: RunPlaybookOptions["integrations"];
}

export interface PollAnalyticsResult {
  usersFound: number;
  playbooksTriggered: number;
  runs: Array<{
    user: InactiveUser;
    playbookId: string;
    result: PlaybookRunResult;
  }>;
}

export async function pollAnalyticsPlaybooks(
  options: PollAnalyticsOptions,
): Promise<PollAnalyticsResult> {
  if (options.spec.integrations.analytics !== "posthog") {
    throw new Error("Analytics polling requires integrations.analytics: posthog in monetready.yaml");
  }

  const posthogConfig = loadPostHogQueryConfig();
  if (!posthogConfig) {
    throw new Error(
      "PostHog credentials missing. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID.",
    );
  }

  const users = await fetchInactiveUsers(posthogConfig, {
    inactiveHours: options.inactiveHours ?? 48,
  });

  const allPlaybooks = await loadPlaybooks(options.playbooksDir);
  const runs: PollAnalyticsResult["runs"] = [];

  for (const user of users) {
    const properties = {
      ...user.properties,
      signup_completed: user.signupCompleted,
      name: user.email?.split("@")[0] ?? user.distinctId,
    };

    const matches = findMatchingPlaybooks(
      allPlaybooks,
      options.spec.playbooks,
      "analytics",
      "user.inactive_48h",
      properties,
    );

    for (const playbook of matches) {
      const result = await runPlaybook(playbook, options.spec, {
        dryRun: options.dryRun ?? true,
        integrations: options.integrations,
        context: {
          emailTo: user.email,
          properties,
        },
      });

      runs.push({
        user,
        playbookId: playbook.id,
        result,
      });
    }
  }

  return {
    usersFound: users.length,
    playbooksTriggered: runs.length,
    runs,
  };
}

export interface RunScheduledPlaybooksOptions {
  playbooksDir: string;
  spec: MonetreadySpec;
  dryRun?: boolean;
  now?: Date;
  integrations?: RunPlaybookOptions["integrations"];
}

export interface RunScheduledPlaybooksResult {
  matched: string[];
  runs: PlaybookRunResult[];
}

export async function runScheduledPlaybooks(
  options: RunScheduledPlaybooksOptions,
): Promise<RunScheduledPlaybooksResult> {
  const allPlaybooks = await loadPlaybooks(options.playbooksDir);
  const now = options.now ?? new Date();
  const matched: string[] = [];
  const runs: PlaybookRunResult[] = [];

  for (const playbook of allPlaybooks) {
    if (playbook.trigger.type !== "schedule") {
      continue;
    }

    if (!options.spec.playbooks.includes(playbook.id)) {
      continue;
    }

    if (!shouldRunCron(playbook.trigger.event, now)) {
      continue;
    }

    matched.push(playbook.id);
    const loaded = await loadPlaybookById(options.playbooksDir, playbook.id);
    if (!loaded) {
      continue;
    }

    const result = await runPlaybook(loaded, options.spec, {
      dryRun: options.dryRun ?? false,
      integrations: options.integrations,
    });
    runs.push(result);
  }

  return { matched, runs };
}
