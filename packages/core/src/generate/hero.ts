import { escapeHtml } from "./html.js";

/** Editorial intro line for longer audience copy — not a chip/badge */
export function renderHeroIntro(prefix: string, highlight: string): string {
  return `
    <div class="hero-intro reveal">
      <div class="hero-intro-rule" aria-hidden="true"></div>
      <p class="hero-intro-text">${escapeHtml(prefix)} <span class="hero-intro-highlight">${escapeHtml(highlight)}</span></p>
    </div>`;
}

/** Flanked eyebrow for short hero labels (e.g. pricing page) */
export function renderHeroEyebrow(label: string): string {
  return `
    <div class="hero-eyebrow reveal" aria-label="${escapeHtml(label)}">
      <span class="hero-eyebrow-line" aria-hidden="true"></span>
      <span class="hero-eyebrow-label">${escapeHtml(label)}</span>
      <span class="hero-eyebrow-line" aria-hidden="true"></span>
    </div>`;
}
