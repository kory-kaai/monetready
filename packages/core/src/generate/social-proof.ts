import type { MonetreadySpec } from "../schema/monetready-spec.js";
import { escapeHtml } from "./html.js";

const CHANNEL_LABELS: Record<string, string> = {
  github: "Open source builders",
  hackernews: "Hacker News readers",
  reddit: "Reddit communities",
  devto: "Dev.to writers",
  twitter: "Indie hackers",
  producthunt: "Product Hunt makers",
  seo: "Organic search",
  email: "Newsletter subscribers",
  community: "Community members",
};

export function renderSocialProof(spec: MonetreadySpec): string {
  const audience = escapeHtml(spec.gtm.target_audience ?? "builders");
  const name = escapeHtml(spec.product.name);
  const tagline = escapeHtml(spec.product.tagline ?? spec.product.problem);

  const logos = (spec.gtm.channels.length > 0 ? spec.gtm.channels : ["github", "hackernews"])
    .slice(0, 4)
    .map((channel) => CHANNEL_LABELS[channel] ?? channel)
    .map((label) => `<span class="social-proof-logo">${escapeHtml(label)}</span>`)
    .join("");

  return `
    <section class="social-proof reveal">
      <p class="social-proof-label">Trusted by ${audience}</p>
      <div class="social-proof-quotes">
        <blockquote class="social-proof-quote">
          <p>"${name} gave us a clear path from idea to revenue. ${tagline}."</p>
          <footer>— Early adopter, ${audience}</footer>
        </blockquote>
      </div>
      <div class="social-proof-logos" aria-label="Used by">
        ${logos}
      </div>
    </section>`;
}
