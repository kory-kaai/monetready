export interface SendEmailOptions {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

interface ResendEmailResponse {
  id?: string;
  message?: string;
}

export async function sendResendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from,
        to: [options.to],
        subject: options.subject,
        text: options.text,
      }),
    });

    const payload = (await response.json()) as ResendEmailResponse;

    if (!response.ok) {
      return {
        ok: false,
        error: payload.message ?? `Resend API error (${response.status})`,
      };
    }

    return { ok: true, id: payload.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
