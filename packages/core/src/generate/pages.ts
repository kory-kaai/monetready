import type { MonetreadySpec, PricingTier } from "../schema/monetready-spec.js";
import { escapeHtml } from "./html.js";
import { renderFooter, renderLogoMark } from "./footer.js";
import { renderHeroEyebrow, renderHeroIntro } from "./hero.js";
import { renderSocialProof } from "./social-proof.js";
import { analyticsScript, fontLinks, motionScript } from "./motion.js";
import { buildThemeStyles } from "./theme.js";

function formatPrice(tier: PricingTier, currency: string): string {
  if (tier.price === 0) return "Free";
  const symbol = currency.toLowerCase() === "usd" ? "$" : "";
  const interval = tier.interval === "month" ? "/mo" : tier.interval === "year" ? "/yr" : "";
  return `${symbol}${tier.price}${interval}`;
}

export function renderNav(spec: MonetreadySpec, active: "home" | "pricing"): string {
  const name = escapeHtml(spec.product.name);
  const homeClass = active === "home" ? " active" : "";
  const pricingClass = active === "pricing" ? " active" : "";
  const github = spec.integrations.github
    ? `<a href="https://github.com/${escapeHtml(spec.integrations.github)}" class="hide-mobile" target="_blank" rel="noopener">GitHub</a>`
    : "";

  return `
    <nav class="site-nav">
      <a href="index.html" class="logo">
        ${renderLogoMark()}
        ${name}
      </a>
      <div class="nav-links">
        <a href="index.html" class="hide-mobile${homeClass}">Home</a>
        <a href="pricing.html" class="${pricingClass}">Pricing</a>
        ${github}
        <a href="pricing.html" class="btn btn-primary btn-sm nav-cta">Get started</a>
      </div>
    </nav>`;
}

export function renderPricingCards(spec: MonetreadySpec, featuredIndex?: number): string {
  const tiers = spec.pricing.tiers;
  const defaultFeatured = featuredIndex ?? Math.min(1, Math.max(0, tiers.length - 1));

  return tiers
    .map((tier, index) => {
      const featured = index === defaultFeatured && tiers.length > 1;
      const price = formatPrice(tier, spec.pricing.currency);
      const features = tier.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("");
      const cta =
        tier.price === 0 ? "Get started free" : spec.integrations.stripe ? "Subscribe now" : "Get started";
      const btnClass = featured ? "btn-primary" : "btn-secondary";

      return `
      <div class="pricing-card reveal${featured ? " featured" : ""}">
        ${featured ? '<div class="featured-badge">Most popular</div>' : ""}
        <div class="tier-name">${escapeHtml(tier.name)}</div>
        <div class="price">${escapeHtml(price)}</div>
        <ul>${features}</ul>
        <a href="#" class="btn ${btnClass}">${cta}</a>
      </div>`;
    })
    .join("");
}

function pageShell(spec: MonetreadySpec, title: string, body: string, activeNav: "home" | "pricing"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(spec.product.tagline ?? spec.product.problem)}">
  <meta name="theme-color" content="#050506">
  ${fontLinks()}
  <style>${buildThemeStyles()}</style>
  ${analyticsScript(spec)}
</head>
<body>
  <div class="bg-mesh"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="container">
    ${renderNav(spec, activeNav)}
    ${body}
  </div>
  ${renderFooter(spec)}
  ${motionScript()}
</body>
</html>`;
}

export function generateLandingPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const tagline = escapeHtml(spec.product.tagline ?? spec.product.problem);
  const problem = escapeHtml(spec.product.problem);
  const solution = escapeHtml(spec.product.solution ?? "A better way to solve the problem.");
  const audience = escapeHtml(spec.gtm.target_audience ?? "builders like you");
  const advantage = escapeHtml(spec.gtm.unfair_advantage ?? "");

  const body = `
    <section class="hero">
      <div class="hero-glow"></div>
      ${renderHeroIntro("Built for", spec.gtm.target_audience ?? "builders like you")}
      <h1 class="reveal">${tagline}</h1>
      <p class="hero-lead reveal">${problem}</p>
      <div class="hero-cta reveal">
        <a href="pricing.html" class="btn btn-primary">Get started free →</a>
        <a href="#how-it-works" class="btn btn-secondary">See how it works</a>
      </div>
      <div class="stats reveal">
        <div class="stat">
          <div class="stat-value" data-count="10" data-suffix="x">0x</div>
          <div class="stat-label">Faster to launch</div>
        </div>
        <div class="stat">
          <div class="stat-value" data-count="${spec.pricing.tiers.length}">0</div>
          <div class="stat-label">Pricing tiers ready</div>
        </div>
        <div class="stat">
          <div class="stat-value" data-count="${spec.playbooks.length}">0</div>
          <div class="stat-label">Revenue playbooks</div>
        </div>
      </div>
    </section>

    ${renderSocialProof(spec)}

    <section>
      <div class="section-head reveal">
        <h2>Sound familiar?</h2>
        <p>Most products fail not because of code — but because of pricing, launch, and growth.</p>
      </div>
      <div class="compare reveal">
        <div class="compare-col bad">
          <h3>❌ Without ${name}</h3>
          <ul>
            <li>↳ Weeks on setup, zero customers</li>
            <li>↳ No clear pricing strategy</li>
            <li>↳ Launch day panic</li>
            <li>↳ Churn with no win-back plan</li>
          </ul>
        </div>
        <div class="compare-col good">
          <h3>✓ With ${name}</h3>
          <ul>
            <li>↳ Launch-ready in hours</li>
            <li>↳ Pricing built from day one</li>
            <li>↳ Clear GTM checklist</li>
            <li>↳ Automated revenue playbooks</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="how-it-works">
      <div class="section-head reveal">
        <h2>How it works</h2>
        <p>${solution}</p>
      </div>
      <div class="steps">
        <div class="step reveal">
          <h3>Define your product</h3>
          <p>Problem, audience, and unfair advantage — before you write code.</p>
        </div>
        <div class="step reveal">
          <h3>Audit readiness</h3>
          <p>Get a Monetready Score across pricing, onboarding, conversion, and distribution.</p>
        </div>
        <div class="step reveal">
          <h3>Launch & automate</h3>
          <p>Ship pages, enable playbooks, and grow with confidence.</p>
        </div>
      </div>
    </section>

    <section>
      <div class="section-head reveal">
        <h2>Why teams choose <span class="gradient-text">${name}</span></h2>
      </div>
      <div class="grid-3">
        <div class="card reveal">
          <div class="card-icon">⚡</div>
          <h3>Ship faster</h3>
          <p>Go from idea to launch-ready assets in hours, not weeks of guesswork.</p>
        </div>
        <div class="card reveal">
          <div class="card-icon">💰</div>
          <h3>Monetize smarter</h3>
          <p>Pricing tiers, lifecycle emails, and conversion — wired from day one.</p>
        </div>
        <div class="card reveal">
          <div class="card-icon">📈</div>
          <h3>Grow deliberately</h3>
          <p>GTM channels and playbooks that act on real business events.</p>
        </div>
      </div>
    </section>

    ${
      advantage
        ? `
    <section>
      <div class="advantage-box reveal">
        <p><strong>Our unfair advantage:</strong> ${advantage}</p>
      </div>
    </section>`
        : ""
    }

    <section>
      <div class="section-head reveal">
        <h2>Simple, honest pricing</h2>
        <p>Start free. Upgrade when you're ready to grow.</p>
      </div>
      <div class="pricing-grid reveal">
        ${renderPricingCards(spec)}
      </div>
    </section>

    <section>
      <div class="cta-banner reveal">
        <h2>Ready to get started?</h2>
        <p>Join ${audience} who ship revenue-ready products.</p>
        <a href="pricing.html" class="btn btn-primary">Start free today →</a>
      </div>
    </section>`;

  return pageShell(spec, `${spec.product.name} - ${spec.product.tagline ?? "Home"}`, body, "home");
}

function renderFaq(spec: MonetreadySpec): string {
  const model = spec.pricing.model;
  const items = [
    {
      q: "Can I change plans anytime?",
      a: "Yes. Upgrade or downgrade whenever you need — no lock-in, no hassle.",
    },
    {
      q: "Is there a free tier?",
      a:
        model === "freemium"
          ? "Absolutely. The free tier is yours forever. No credit card required."
          : "Contact us — we'll find a plan that fits your stage.",
    },
    {
      q: "What payment methods do you accept?",
      a: spec.integrations.stripe
        ? "All major cards via Stripe. Secure, instant, and trusted worldwide."
        : "We're setting up payments — join the waitlist to get early access.",
    },
    {
      q: "How fast can I get started?",
      a: "Most users are up and running in under 5 minutes. No complex setup.",
    },
  ];

  return items
    .map(
      (item) => `
    <div class="faq-item reveal">
      <button class="faq-q" type="button">${escapeHtml(item.q)}</button>
      <div class="faq-a">${escapeHtml(item.a)}</div>
    </div>`,
    )
    .join("");
}

export function generatePricingPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const model = spec.pricing.model;

  const body = `
    <section class="hero" style="padding:3rem 0 2rem;">
      ${renderHeroEyebrow("Transparent pricing")}
      <h1 class="reveal">Choose your plan</h1>
      <p class="hero-lead reveal">
        ${model === "freemium" ? "Start free. Upgrade when you need more." : "Pick the plan that fits your stage."}
      </p>
    </section>

    <section style="padding-top:0;">
      <div class="pricing-grid">
        ${renderPricingCards(spec)}
      </div>
    </section>

    <section>
      <div class="section-head reveal">
        <h2>Frequently asked questions</h2>
        <p>Everything you need to know about ${name}.</p>
      </div>
      <div class="faq-list">${renderFaq(spec)}</div>
    </section>

    <section>
      <div class="cta-banner reveal">
        <h2>Still have questions?</h2>
        <p>We're here to help you find the right plan.</p>
        <a href="mailto:hello@${name.toLowerCase().replace(/\s+/g, "")}.com" class="btn btn-secondary">Contact us</a>
      </div>
    </section>`;

  return pageShell(spec, `${spec.product.name} - Pricing`, body, "pricing");
}

export interface GeneratedPages {
  landing: string;
  pricing: string;
}

export function generatePages(spec: MonetreadySpec): GeneratedPages {
  return {
    landing: generateLandingPage(spec),
    pricing: generatePricingPage(spec),
  };
}
