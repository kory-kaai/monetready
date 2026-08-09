export interface IntegrationContext {
  resendApiKey?: string;
  sesRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  fromEmail?: string;
  defaultEmailTo?: string;
  slackWebhookUrl?: string;
}

export function loadIntegrationContext(
  env: NodeJS.ProcessEnv = process.env,
): IntegrationContext {
  return {
    resendApiKey: env.RESEND_API_KEY,
    sesRegion: env.AWS_REGION ?? env.AWS_DEFAULT_REGION,
    awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    fromEmail: env.MONETREADY_FROM_EMAIL ?? env.SES_FROM_EMAIL ?? env.RESEND_FROM_EMAIL,
    defaultEmailTo: env.MONETREADY_PLAYBOOK_EMAIL_TO,
    slackWebhookUrl: env.SLACK_WEBHOOK_URL ?? env.MONETREADY_SLACK_WEBHOOK_URL,
  };
}
