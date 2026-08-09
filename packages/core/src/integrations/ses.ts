import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export interface SesSendOptions {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
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

export function resolveSesRegion(env: NodeJS.ProcessEnv = process.env): string {
  return env.AWS_REGION ?? env.AWS_DEFAULT_REGION ?? "us-west-1";
}

export async function sendSesEmail(options: SesSendOptions): Promise<SendEmailResult> {
  try {
    const client = new SESClient({
      region: options.region,
      credentials:
        options.accessKeyId && options.secretAccessKey
          ? {
              accessKeyId: options.accessKeyId,
              secretAccessKey: options.secretAccessKey,
            }
          : undefined,
    });

    const response = await client.send(
      new SendEmailCommand({
        Source: options.from,
        Destination: { ToAddresses: [options.to] },
        Message: {
          Subject: { Data: options.subject, Charset: "UTF-8" },
          Body: { Text: { Data: options.text, Charset: "UTF-8" } },
        },
      }),
    );

    return { ok: true, id: response.MessageId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send email via SES",
    };
  }
}
