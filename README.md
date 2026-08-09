<p align="center">
  <img src=".github/social-preview.png" alt="Monetready — Turn raw ideas into revenue-ready products" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/kory-kaai/monetready/stargazers"><img src="https://img.shields.io/github/stars/kory-kaai/monetready?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/kory-kaai/monetready/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/kory-kaai/monetready/ci.yml?branch=main&label=CI" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node >= 20"></a>
</p>

<p align="center">
  <h1 align="center">🔥 Monetready</h1>
  <p align="center">
    <strong>The open-source product forge</strong><br/>
    Turn raw ideas into revenue-ready products
  </p>
</p>

<p align="center">
  <a href="#quick-start"><strong>Get started in 60 seconds →</strong></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#monetready-score">Monetready Score</a> ·
  <a href="#revenue-playbooks">Playbooks</a> ·
  <a href="#monetready-yaml">monetready.yaml</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  If Monetready helps you ship or monetize faster, <a href="https://github.com/kory-kaai/monetready"><strong>give it a ⭐ on GitHub</strong></a> — it helps other indie hackers find it.
</p>

---

**Monetready** is the missing layer between "I built something" and "I'm making money from it."

While AI agents write code and n8n automates workflows, nobody owns the **business outcome loop**: validate → price → launch → convert → retain → grow. Monetready does.

```bash
npx create-monetready my-saas    # Scaffold a revenue-ready product
cd my-saas && monetready score    # Audit your revenue readiness (0–100)
monetready fire                   # Launch checklist + next steps
monetready playbooks run trial-ending-upgrade
```

## Why Monetready?

| Tool | What it does | What it misses |
|------|-------------|----------------|
| AI coding agents | Writes code | Doesn't price, launch, or grow your product |
| n8n | Generic automation | No business intelligence or revenue playbooks |
| PostHog | Analytics | Doesn't act on insights |
| Stripe | Payments | Doesn't tell you *what* to charge |
| spec-kit | Spec → code | Ignores business model and GTM |

**Monetready fills the loop.**

## Quick Start

### New project

```bash
npx create-monetready my-saas
cd my-saas
monetready setup      # Guided wizard (easiest)
monetready launch     # Score + pages + report in one command
```

### Existing project

```bash
npm install -g monetready-cli
monetready setup      # Interactive wizard — no YAML editing required
monetready launch     # Full launch pipeline
monetready dashboard --open
```

## Monetready Score

A single health metric (0–100) that audits six dimensions of revenue readiness:

| Category | What it checks |
|----------|---------------|
| **Pricing** | Paid tiers defined, Stripe wired, monetization model |
| **Onboarding** | Setup flow, solution clarity, CTAs |
| **Conversion** | Analytics, email, revenue playbooks |
| **Distribution** | README quality, landing page, GTM channels |
| **Integrations** | Stripe, license, CI/CD |
| **Differentiation** | Unfair advantage, target audience, problem depth |

```bash
monetready score

# Monetready Score — My SaaS
# ─────────────────────────────
# Score: 72/100 (72%)  Grade: B
#
# Pricing          ████████████████░░░░  80%
# Onboarding       ████████████░░░░░░░░  60%
# Conversion       ██████████████░░░░░░  70%
# ...
```

Use `--json` for CI integration, or gate PRs with `--min-score`:

```bash
monetready score --min-score 60   # exits 1 if below threshold
```

In GitHub Actions:

```yaml
- uses: ./.github/actions/monetready-score
  with:
    min-score: "60"
```

## What makes Monetready different

| Only in Monetready | What it solves |
|---|---|
| **Monetready Score** | "Am I ready to make money?" — not code quality |
| **monetready.yaml** | Business spec drives pages, score, playbooks, dashboard |
| **Revenue Readiness Report** | Shareable HTML audit no competitor generates |
| **Revenue playbooks** | Pre-built lifecycle automations, not blank workflows |
| **monetready launch** | One command: score → pages → report → checklist |
| **Self-hosted** | Your data never leaves your machine |

## Generate pages

Modern, animated landing + pricing pages from your spec:

```bash
monetready generate pages
# Output: index.html, pricing.html, readiness-report.html

npx serve .monetready/pages   # preview locally
```

Pages include scroll animations, animated stats, FAQ accordions, gradient mesh backgrounds, and glass-morphism cards — with `prefers-reduced-motion` support.

## Dashboard

Local-first UI for your product — no cloud, no account:

```bash
monetready dashboard
# Opens at http://127.0.0.1:3721

monetready dashboard --open   # auto-open browser
monetready dashboard --allow-execute   # enable live playbook runs from UI
```

The dashboard shows:
- **Monetready Score** with grade and category breakdown
- **Findings** and recommendations
- **Launch checklist** and next steps
- **Revenue playbooks** with one-click dry-run

All data is read from your local `monetready.yaml` and project files. Nothing leaves your machine.

### Multi-product workspace (Team)

Manage multiple products from one dashboard by creating `.monetready/workspace.yaml`:

```yaml
version: "1"
products:
  - id: monetready
    name: Monetready
    path: "."
  - id: my-saas
    name: My SaaS
    path: "../my-saas"
```

The dashboard shows a product switcher when more than one product is configured.

## Revenue Playbooks

Pre-built, forkable automations for the moments that matter:

| Playbook | Trigger | Action |
|----------|---------|--------|
| `trial-ending-upgrade` | Stripe trial ending | Personalized upgrade email |
| `inactive-user-nudge` | 48h inactive | Re-engagement email |
| `new-subscriber-welcome` | New subscription | Welcome + Slack alert |
| `churn-risk-winback` | Cancellation | Win-back with feedback offer |
| `star-spike-launch` | GitHub star spike | HN launch copy generation |
| `weekly-revenue-check` | Weekly cron (Mon 9am) | Slack reminder to review MRR & score |

```bash
monetready playbooks list
monetready playbooks run trial-ending-upgrade          # dry-run (default)
monetready playbooks run new-subscriber-welcome --execute
monetready playbooks poll                              # find inactive PostHog users
monetready playbooks poll --execute                    # send nudge emails
monetready playbooks schedule --execute                # run cron-matched playbooks
```

Live execution uses integration adapters (Resend, Slack, PostHog, webhooks). Set these env vars:

> **Integration support:** Live playbook email uses **Resend**; analytics polling uses **PostHog**. The spec also accepts `plausible`, `mixpanel`, `sendgrid`, and `postmark` for scoring and page generation, but those providers do not have live playbook adapters yet.

```bash
export RESEND_API_KEY=re_...
export MONETREADY_FROM_EMAIL="Your App <hello@yourdomain.com>"
export MONETREADY_PLAYBOOK_EMAIL_TO=user@example.com
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
export POSTHOG_PERSONAL_API_KEY=phx_...          # for monetready playbooks poll
export POSTHOG_PROJECT_ID=12345
export POSTHOG_API_KEY=phc_...                   # injected into generated pages
export STRIPE_WEBHOOK_SECRET=whsec_...         # from `stripe listen`
export MONETREADY_WEBHOOK_SECRET=your-secret         # protects /webhooks/analytics and /webhooks/github
```

Playbooks are plain YAML in `playbooks/` — fork them, add your own.

## monetready.yaml

Business-aware product spec that drives everything:

```yaml
version: "1"

product:
  name: My SaaS
  problem: Teams waste hours on manual reporting
  solution: Automated dashboards in 5 minutes

pricing:
  model: freemium
  tiers:
    - name: Free
      price: 0
      interval: month
    - name: Pro
      price: 19
      interval: month
      features: [Unlimited reports, API access]

gtm:
  channels: [github, hackernews, devto]
  unfair_advantage: 3 years as a data analyst — I know the pain intimately
  target_audience: Solo founders who need reporting without a data team

integrations:
  stripe: true
  analytics: posthog
  email: resend

playbooks:
  - trial-ending-upgrade
  - inactive-user-nudge
  - new-subscriber-welcome
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `monetready init` | Create monetready.yaml in current directory |
| `monetready setup` | Interactive wizard — easiest way to start |
| `monetready launch` | Full pipeline: score + pages + report + checklist |
| `monetready score` | Run Monetready Score audit |
| `monetready fire` | Full launch pipeline (score + checklist + next steps) |
| `monetready playbooks list` | List revenue playbooks |
| `monetready playbooks run <id>` | Run a playbook (dry-run by default) |
| `monetready playbooks poll` | Poll PostHog for inactive users |
| `monetready playbooks schedule` | Run cron-scheduled playbooks |
| `monetready serve` | Start Stripe webhook server for live playbooks |
| `monetready generate pages` | Generate landing + pricing HTML from monetready.yaml |
| `monetready dashboard` | Start local-first dashboard UI |
| `create-monetready <name>` | Scaffold a new revenue-ready project |

## Development

```bash
git clone https://github.com/kory-kaai/monetready.git
cd monetready
npm install
npm run build
npm test
node packages/cli/dist/index.js score
```

### Project structure

```
monetready/
├── packages/
│   ├── core/          # Spec parser, Monetready Score engine, playbook runtime
│   ├── cli/           # monetready CLI
│   └── create-monetready/   # Project scaffolder
├── playbooks/         # Revenue playbook library (YAML)
├── templates/         # Project templates
└── monetready.yaml          # Monetready's own product spec
```

## Roadmap

- [x] monetready.yaml spec format
- [x] Monetready Score engine (6 categories, 100 points)
- [x] 6 revenue playbooks
- [x] CLI (`init`, `score`, `fire`, `playbooks`)
- [x] `create-monetready` scaffolder
- [x] Stripe webhook server (`monetready serve`)
- [x] Landing + pricing page generator (`monetready generate pages`)
- [x] Self-hosted dashboard (`monetready dashboard`)
- [x] PostHog / Resend integration adapters
- [x] GitHub Action for CI score checks
- [x] Stripe webhook signature verification
- [x] Analytics + GitHub webhook triggers for playbooks
- [x] PostHog inactive-user polling (`monetready playbooks poll`)
- [x] Scheduled playbooks (`monetready playbooks schedule`)
- [x] Multi-product workspace dashboard
- [x] Social proof section in generated landing pages
- [x] Playbook sync script (`playbooks/` → core + template)
- [x] Scheduled PostHog poll GitHub Action

## Publishing

See [docs/PUBLISHING.md](docs/PUBLISHING.md) for npm publish, profile setup, and launch links.

Packages are published to npm from this monorepo:

| Package | npm name | Command |
|---------|----------|---------|
| Core | `monetready-core` | `npm publish -w monetready-core --access public` |
| CLI | `monetready-cli` | `npm publish -w monetready-cli` |
| Scaffolder | `create-monetready` | `npm publish -w create-monetready` |

Publish all three in order (core first, then CLI and scaffolder):

```bash
npm login
npm run publish:packages
```

`create-monetready` bundles its project template at build time, and `monetready-core` bundles playbooks — both are synced automatically via `npm run build`.

## Philosophy

Monetready doesn't try to build your SaaS for you. It helps you **ship and monetize your unfair advantage faster.**

- **Validation before build** — define problem and audience first
- **Differentiation prompts** — unfair advantage is a first-class field
- **Metrics over templates** — optimize for revenue, not vanity launches
- **Self-hosted by default** — your business data stays yours

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

Especially helpful:

- New revenue playbooks for specific niches
- Integration adapters (SendGrid, Postmark, Mixpanel, Plausible)
- Monetready Score checks and improvements
- Translations and docs

Join [Discussions](https://github.com/kory-kaai/monetready/discussions) to share what you're building.

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  <sub>Built for indie hackers who ship.</sub>
</p>
