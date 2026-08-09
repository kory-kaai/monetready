import { getAppUrl } from "@/lib/firebase/config";

export default function HomePage() {
  const appUrl = getAppUrl();

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <h1>Monetready</h1>
      <p>Cloud dashboard — Firebase + Vercel scaffold is ready.</p>
      <p>
        <code>apps/web/.env.local</code> is configured. Add App Check and Admin SDK secrets to
        finish setup.
      </p>
      <p>
        App URL: <strong>{appUrl}</strong>
      </p>
    </main>
  );
}
