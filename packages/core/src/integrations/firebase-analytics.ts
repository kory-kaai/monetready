export function resolveFirebaseMeasurementId(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return (
    env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ??
    env.FIREBASE_MEASUREMENT_ID ??
    env.GA_MEASUREMENT_ID
  );
}
