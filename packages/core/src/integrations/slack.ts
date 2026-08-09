export interface PostSlackOptions {
  webhookUrl: string;
  message: string;
}

export interface PostSlackResult {
  ok: boolean;
  error?: string;
}

export async function postSlackMessage(
  options: PostSlackOptions,
): Promise<PostSlackResult> {
  try {
    const response = await fetch(options.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: options.message }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: body || `Slack webhook error (${response.status})`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to post Slack message",
    };
  }
}
