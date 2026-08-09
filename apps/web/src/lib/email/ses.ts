import { sendSesEmail, resolveSesRegion } from "@monetready/core";

export interface SendTransactionalEmailInput {
  to: string;
  subject: string;
  text: string;
}

export async function sendTransactionalEmail(
  input: SendTransactionalEmailInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const from = process.env.SES_FROM_EMAIL ?? process.env.MONETREADY_FROM_EMAIL;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!from) {
    return { ok: false, error: "Missing SES_FROM_EMAIL" };
  }

  if (!accessKeyId || !secretAccessKey) {
    return { ok: false, error: "Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY" };
  }

  return sendSesEmail({
    region: resolveSesRegion(),
    accessKeyId,
    secretAccessKey,
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}
