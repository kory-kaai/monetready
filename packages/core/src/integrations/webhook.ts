export interface PostWebhookOptions {
  url: string;
  payload: unknown;
}

export interface PostWebhookResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export async function postWebhook(
  options: PostWebhookOptions,
): Promise<PostWebhookResult> {
  try {
    const response = await fetch(options.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        status: response.status,
        error: body || `Webhook error (${response.status})`,
      };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to call webhook",
    };
  }
}
