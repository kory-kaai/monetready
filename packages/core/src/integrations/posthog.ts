export function resolvePostHogKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.POSTHOG_API_KEY ?? env.NEXT_PUBLIC_POSTHOG_KEY ?? env.POSTHOG_PROJECT_API_KEY;
}

export function resolvePostHogPersonalApiKey(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env.POSTHOG_PERSONAL_API_KEY ?? env.POSTHOG_API_KEY;
}

export function resolvePostHogProjectId(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.POSTHOG_PROJECT_ID;
}

export function resolvePostHogHost(env: NodeJS.ProcessEnv = process.env): string {
  return (env.POSTHOG_HOST ?? "https://app.posthog.com").replace(/\/$/, "");
}

export interface PostHogQueryConfig {
  personalApiKey: string;
  projectId: string;
  host?: string;
}

export interface InactiveUser {
  distinctId: string;
  email?: string;
  lastSeenAt: string;
  signupCompleted: boolean;
  properties: Record<string, unknown>;
}

interface HogQlResponse {
  results?: unknown[][];
  columns?: string[];
  error?: string;
}

export async function queryPostHog(
  config: PostHogQueryConfig,
  hogql: string,
): Promise<HogQlResponse> {
  const host = (config.host ?? resolvePostHogHost()).replace(/\/$/, "");
  const response = await fetch(`${host}/api/projects/${config.projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.personalApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query: hogql,
      },
    }),
  });

  const payload = (await response.json()) as HogQlResponse & { detail?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? payload.detail ?? `PostHog query failed (${response.status})`);
  }

  return payload;
}

export async function fetchInactiveUsers(
  config: PostHogQueryConfig,
  options: { inactiveHours?: number; lookbackDays?: number; limit?: number } = {},
): Promise<InactiveUser[]> {
  const inactiveHours = options.inactiveHours ?? 48;
  const lookbackDays = options.lookbackDays ?? 14;
  const limit = options.limit ?? 50;

  const hogql = `
    SELECT
      distinct_id,
      max(timestamp) AS last_seen_at,
      argMax(properties.email, timestamp) AS email,
      argMax(properties.signup_completed, timestamp) AS signup_completed
    FROM events
    WHERE timestamp > now() - INTERVAL ${lookbackDays} DAY
    GROUP BY distinct_id
    HAVING last_seen_at < now() - INTERVAL ${inactiveHours} HOUR
    ORDER BY last_seen_at DESC
    LIMIT ${limit}
  `.trim();

  const result = await queryPostHog(config, hogql);
  const rows = result.results ?? [];

  return rows.map((row) => {
    const [distinctId, lastSeenAt, email, signupCompleted] = row as [
      string,
      string,
      string | null,
      boolean | null,
    ];

    return {
      distinctId,
      email: email ?? undefined,
      lastSeenAt: String(lastSeenAt),
      signupCompleted: Boolean(signupCompleted),
      properties: {
        distinct_id: distinctId,
        email: email ?? undefined,
        signup_completed: Boolean(signupCompleted),
        last_seen_at: String(lastSeenAt),
      },
    };
  });
}

export function loadPostHogQueryConfig(
  env: NodeJS.ProcessEnv = process.env,
): PostHogQueryConfig | null {
  const personalApiKey = resolvePostHogPersonalApiKey(env);
  const projectId = resolvePostHogProjectId(env);

  if (!personalApiKey || !projectId) {
    return null;
  }

  return {
    personalApiKey,
    projectId,
    host: resolvePostHogHost(env),
  };
}
