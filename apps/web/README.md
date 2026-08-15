# Monetready Web (`monetready.com`)

Next.js SaaS dashboard on **Vercel** + **Firebase** (Auth, Firestore, App Check, Analytics) with **Amazon SES** for email.

## Setup

### 1. Environment

```bash
cp .env.example .env.local
```

`.env.local` already contains your Firebase client config. Fill in the **empty** values:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY` | Firebase Console → App Check → Web app → reCAPTCHA v3 |
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN` | App Check → Manage debug tokens (local dev only) |
| `FIREBASE_CLIENT_EMAIL` | Project settings → Service accounts → Generate key |
| `FIREBASE_PRIVATE_KEY` | Same JSON file (`private_key` field) |
| `AUTH_GITHUB_CLIENT_ID` / `SECRET` | Firebase Auth → GitHub provider |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user with `ses:SendEmail` on verified domain |
| `SES_FROM_EMAIL` | Verified sender in Amazon SES (e.g. `hello@monetready.com`) |
| `GOOGLE_RECAPTCHA_SECRET_KEY` | reCAPTCHA admin console (server-only — never `NEXT_PUBLIC_`) |

### 2. Firebase Console checklist

- [ ] **Firestore** — Create database (production mode recommended)
- [ ] **Authentication** — Enable Email/Password, Google, GitHub as needed
- [ ] **App Check** — Register web app with reCAPTCHA v3; enforce for Firestore + Auth
- [ ] **Analytics** — Already configured via `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (Google Analytics 4)

### 3. Amazon SES checklist

- [ ] Verify `monetready.com` domain (or sender email) in SES
- [ ] Request production access if sending to non-sandbox recipients
- [ ] Create IAM credentials with least-privilege `ses:SendEmail`
- [ ] Use **`us-west-1`** for SES (set `AWS_REGION=us-west-1` — must match where your domain is verified)

Server-side email helper: `src/lib/email/ses.ts` (`sendTransactionalEmail`).

### 4. Run locally

From repo root:

```bash
npm install
npm run dev:web
```

Open http://localhost:3000

### 5. Deploy to Vercel

1. Import repo in Vercel
2. Set **Root Directory** to `apps/web` (required)
3. Enable **Include source files outside of the Root Directory in the Build Step**
4. `apps/web/vercel.json` installs workspace deps from the monorepo root and builds `@monetready/core` before `next build`
5. Copy all variables from `.env.local` to Vercel → Environment Variables
6. Clear any custom **Build Command** override in Vercel settings (let `vercel.json` control the build)
7. For `FIREBASE_PRIVATE_KEY`, paste the full key including `-----BEGIN PRIVATE KEY-----` lines (Vercel handles multiline)
8. Set `NEXT_PUBLIC_APP_URL=https://monetready.com` for production

## Analytics & email stack

| Concern | Provider | Env vars |
|---------|----------|----------|
| Product analytics | Firebase / GA4 | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` |
| Transactional email | Amazon SES | `AWS_*`, `SES_FROM_EMAIL` |
| Abuse protection | Firebase App Check | `NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY` |

PostHog and Resend are **not** required for this app. The OSS CLI still supports them as optional playbook providers.

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `users/{uid}` | Profile, plan tier, role |
| `userSecrets/{uid}` | GitHub OAuth tokens (server-only, no client access) |
| `projects/{id}` | Product workspace: `specYaml`, `githubRepo`, `productName`, members |
| `projects/{id}/pages` | Generated landing/pricing HTML metadata (planned) |
| `projects/{id}/runs` | Playbook execution history (planned) |

Each signed-up user gets a default project with a starter `monetready.yaml`. Score, playbooks, and launch asset generation use the **active project's spec** — not the monorepo's root yaml on the server.

### GitHub sync

1. Enable **GitHub** provider in Firebase Auth (add OAuth app credentials to Firebase console)
2. Dashboard → Projects → **Connect GitHub**
3. Set `owner/repo` and click **Sync from GitHub** to pull `monetready.yaml`

## Suggested Firebase products

- **Auth** — user login
- **Firestore** — specs, projects, playbook runs
- **App Check** — protect Firestore/Auth from abuse
- **Analytics** — product usage (GA4)
- **Storage** (optional) — hosted generated pages / assets
- **Cloud Functions** (optional later) — scheduled playbooks instead of Vercel cron
