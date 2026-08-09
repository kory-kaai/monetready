import type { MonetreadySpec } from "../schema/monetready-spec.js";
import { escapeHtml, slugify } from "./html.js";
import { renderHeroEyebrow } from "./hero.js";
import { analyticsScript, fontLinks, motionScript } from "./motion.js";
import { renderFooter, renderLogoMark } from "./footer.js";
import { buildThemeStyles } from "./theme.js";

type PageNav = "home" | "pricing" | "legal";
type LegalPageSlug = "privacy.html" | "terms.html" | "cookies.html" | "security.html" | "about.html";

interface LegalSectionData {
  id: string;
  title: string;
  content: string;
}

const LEGAL_PAGES: { slug: LegalPageSlug; label: string; eyebrow: string }[] = [
  { slug: "privacy.html", label: "Privacy Policy", eyebrow: "Legal" },
  { slug: "terms.html", label: "Terms of Service", eyebrow: "Legal" },
  { slug: "cookies.html", label: "Cookie Policy", eyebrow: "Legal" },
  { slug: "security.html", label: "Security", eyebrow: "Trust" },
  { slug: "about.html", label: "About", eyebrow: "Company" },
];

function renderNav(spec: MonetreadySpec, active: PageNav): string {
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

function legalSection(title: string, content: string, id?: string): LegalSectionData {
  return { id: id ?? slugify(title), title, content };
}

function renderLegalSection(section: LegalSectionData): string {
  return `<section class="legal-section reveal visible" id="${escapeHtml(section.id)}">
    <h2>${escapeHtml(section.title)}</h2>
    ${section.content}
  </section>`;
}

function renderLegalToc(sections: LegalSectionData[]): string {
  return sections
    .map(
      (section) =>
        `<li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>`,
    )
    .join("");
}

function renderLegalRelated(current: LegalPageSlug): string {
  return LEGAL_PAGES.map((page) => {
    const currentClass = page.slug === current ? " current" : "";
    return `<a href="${page.slug}" class="${currentClass.trim()}">${escapeHtml(page.label)}</a>`;
  }).join("");
}

function legalPageShell(
  spec: MonetreadySpec,
  page: LegalPageSlug,
  title: string,
  eyebrow: string,
  meta: string,
  sections: LegalSectionData[],
): string {
  const sectionHtml = sections.map(renderLegalSection).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — ${escapeHtml(spec.product.name)}</title>
  <meta name="robots" content="noindex">
  ${fontLinks()}
  <style>${buildThemeStyles()}</style>
  ${analyticsScript(spec)}
</head>
<body>
  <div class="bg-mesh"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="container">
    ${renderNav(spec, "legal")}
    <main class="legal-page">
      <header class="legal-hero">
        ${renderHeroEyebrow(eyebrow)}
        <h1 class="reveal visible">${escapeHtml(title)}</h1>
        <p class="legal-meta reveal visible">${escapeHtml(meta)}</p>
      </header>
      <div class="legal-layout">
        <aside class="legal-sidebar reveal visible">
          <nav class="legal-toc" aria-label="On this page">
            <p class="legal-toc-label">On this page</p>
            <ul>${renderLegalToc(sections)}</ul>
          </nav>
          <div class="legal-related">
            <p class="legal-related-label">Related pages</p>
            <div class="legal-related-links">${renderLegalRelated(page)}</div>
          </div>
        </aside>
        <article class="legal-doc reveal visible">
          ${sectionHtml}
        </article>
      </div>
    </main>
  </div>
  ${renderFooter(spec)}
  ${motionScript()}
</body>
</html>`;
}

function formatUpdatedDate(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function generatePrivacyPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const email = `privacy@${slugify(spec.product.name)}.com`;
  const updated = `Last updated ${formatUpdatedDate()}`;

  const sections = [
    legalSection(
      "Overview",
      `<p>${name} ("we", "us") respects your privacy. This policy explains what data we collect, how we use it, and your rights.</p>`,
    ),
    legalSection(
      "Information we collect",
      `<ul>
      <li>Account information (name, email) when you sign up</li>
      <li>Usage data and analytics to improve the product</li>
      <li>Payment information processed securely via Stripe — we do not store card details</li>
      <li>Communications when you contact support</li>
    </ul>`,
    ),
    legalSection(
      "How we use your data",
      `<ul>
      <li>Provide and improve ${name}</li>
      <li>Process payments and send transactional emails</li>
      <li>Analyze usage to fix bugs and build better features</li>
      <li>Comply with legal obligations</li>
    </ul>`,
    ),
    legalSection(
      "Third-party services",
      `<p>We may use trusted providers including Stripe (payments), ${spec.integrations.analytics !== "none" ? spec.integrations.analytics : "analytics providers"}, and ${spec.integrations.email !== "none" ? spec.integrations.email : "email providers"}. Each has their own privacy policy.</p>`,
    ),
    legalSection(
      "Your rights",
      `<p>Depending on your location, you may have the right to access, correct, delete, or export your data. Contact us at <a href="mailto:${email}">${email}</a>.</p>`,
      "your-rights",
    ),
    legalSection("Contact", `<p>Questions? Email <a href="mailto:${email}">${email}</a>.</p>`),
  ];

  return legalPageShell(spec, "privacy.html", "Privacy Policy", "Legal", updated, sections);
}

export function generateTermsPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const email = `legal@${slugify(spec.product.name)}.com`;
  const updated = `Last updated ${formatUpdatedDate()}`;

  const sections = [
    legalSection(
      "Agreement",
      `<p>By using ${name}, you agree to these Terms. If you do not agree, do not use the service.</p>`,
    ),
    legalSection(
      "The service",
      `<p>${name} provides ${escapeHtml(spec.product.solution ?? "software services")} as described on our website. We may update features over time.</p>`,
    ),
    legalSection(
      "Accounts",
      `<ul>
      <li>You must provide accurate information</li>
      <li>You are responsible for your account security</li>
      <li>You must be at least 16 years old to use the service</li>
    </ul>`,
    ),
    legalSection(
      "Payments & refunds",
      `<p>Paid plans are billed in advance. Refunds are handled case-by-case within 14 days of purchase. Contact <a href="mailto:${email}">${email}</a>.</p>`,
    ),
    legalSection(
      "Acceptable use",
      `<p>You may not use ${name} for illegal activity, spam, harassment, or to harm others. We may suspend accounts that violate these terms.</p>`,
      "acceptable-use",
    ),
    legalSection(
      "Limitation of liability",
      `<p>${name} is provided "as is." We are not liable for indirect damages. Our total liability is limited to fees paid in the prior 12 months.</p>`,
    ),
    legalSection("Contact", `<p>Legal inquiries: <a href="mailto:${email}">${email}</a>.</p>`),
  ];

  return legalPageShell(spec, "terms.html", "Terms of Service", "Legal", updated, sections);
}

export function generateCookiesPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const updated = `Last updated ${formatUpdatedDate()}`;

  const sections = [
    legalSection(
      "What are cookies?",
      `<p>Cookies are small files stored on your device. We use them to keep you signed in, remember preferences, and understand how ${name} is used.</p>`,
    ),
    legalSection(
      "Cookies we use",
      `<ul>
      <li><strong>Essential</strong> — required for login and security</li>
      <li><strong>Analytics</strong> — help us improve the product (${spec.integrations.analytics !== "none" ? spec.integrations.analytics : "if enabled"})</li>
      <li><strong>Preferences</strong> — remember your settings</li>
    </ul>`,
    ),
    legalSection(
      "Managing cookies",
      `<p>You can disable cookies in your browser settings. Some features may not work without essential cookies.</p>`,
    ),
    legalSection(
      "More information",
      `<p>See our <a href="privacy.html">Privacy Policy</a> for how we handle personal data.</p>`,
    ),
  ];

  return legalPageShell(spec, "cookies.html", "Cookie Policy", "Legal", updated, sections);
}

export function generateSecurityPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const email = `security@${slugify(spec.product.name)}.com`;
  const meta = `How we protect your data at ${name}`;

  const sections = [
    legalSection(
      "Infrastructure",
      `<ul>
      <li>HTTPS encryption in transit</li>
      <li>Secure payment processing via Stripe</li>
      <li>Regular dependency updates and security patches</li>
    </ul>`,
    ),
    legalSection(
      "Data protection",
      `<p>We follow industry best practices for access control, encryption at rest where applicable, and least-privilege access for our team.</p>`,
    ),
    legalSection(
      "Report a vulnerability",
      `<p>Found a security issue? Please report it responsibly to <a href="mailto:${email}">${email}</a>. We aim to respond within 48 hours.</p>`,
    ),
    legalSection(
      "Compliance",
      `<p>We are committed to GDPR-ready practices. Contact us for a DPA or security questionnaire.</p>`,
    ),
  ];

  return legalPageShell(spec, "security.html", "Security", "Trust", meta, sections);
}

export function generateAboutPage(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const problem = escapeHtml(spec.product.problem);
  const solution = escapeHtml(spec.product.solution ?? "");
  const advantage = escapeHtml(spec.gtm.unfair_advantage ?? "");
  const audience = escapeHtml(spec.gtm.target_audience ?? "builders");
  const meta = escapeHtml(spec.product.tagline ?? `Learn more about ${name}`);

  const sections = [
    legalSection(
      "Our mission",
      `<p>We built ${name} because ${problem.toLowerCase()}</p><p>${solution}</p>`,
    ),
    legalSection("Who we serve", `<p>${name} is built for ${audience}.</p>`),
    ...(advantage
      ? [legalSection("What makes us different", `<p>${advantage}</p>`)]
      : []),
    legalSection(
      "Get in touch",
      `<p>Questions or feedback? <a href="mailto:hello@${slugify(spec.product.name)}.com">hello@${slugify(spec.product.name)}.com</a></p>`,
    ),
  ];

  return legalPageShell(spec, "about.html", `About ${name}`, "Company", meta, sections);
}

export function generateAllLegalPages(spec: MonetreadySpec): Record<string, string> {
  return {
    "privacy.html": generatePrivacyPage(spec),
    "terms.html": generateTermsPage(spec),
    "cookies.html": generateCookiesPage(spec),
    "security.html": generateSecurityPage(spec),
    "about.html": generateAboutPage(spec),
  };
}
