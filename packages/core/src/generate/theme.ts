export function buildThemeStyles(): string {
  return `
    :root {
      --bg: #050506;
      --bg-elevated: #0c0c0f;
      --surface: rgba(255,255,255,0.03);
      --surface-hover: rgba(255,255,255,0.06);
      --border: rgba(255,255,255,0.08);
      --border-strong: rgba(255,255,255,0.14);
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --accent: #f97316;
      --accent-2: #fb923c;
      --accent-glow: rgba(249, 115, 22, 0.35);
      --accent-soft: rgba(249, 115, 22, 0.12);
      --success: #34d399;
      --danger: #f87171;
      --font: "Inter", system-ui, sans-serif;
      --display: "Space Grotesk", "Inter", sans-serif;
      --radius: 16px;
      --shadow: 0 24px 80px rgba(0,0,0,0.45);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .bg-mesh {
      position: fixed;
      inset: 0;
      z-index: -2;
      background:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.18), transparent 55%),
        radial-gradient(ellipse 50% 40% at 100% 0%, rgba(251,146,60,0.08), transparent 50%),
        radial-gradient(ellipse 40% 30% at 0% 100%, rgba(249,115,22,0.06), transparent 50%),
        var(--bg);
    }
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      z-index: -1;
      pointer-events: none;
      animation: float 18s ease-in-out infinite;
    }
    .orb-1 { width: 420px; height: 420px; background: rgba(249,115,22,0.15); top: -120px; right: -80px; }
    .orb-2 { width: 320px; height: 320px; background: rgba(251,146,60,0.1); bottom: 10%; left: -100px; animation-delay: -6s; }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(24px, -20px) scale(1.05); }
      66% { transform: translate(-16px, 12px) scale(0.95); }
    }
    @keyframes shimmer {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 24px var(--accent-glow); }
      50% { box-shadow: 0 0 48px var(--accent-glow), 0 0 80px rgba(249,115,22,0.15); }
    }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 1.5rem; }
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      margin-bottom: 0.5rem;
      transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
    }
    .site-nav.scrolled {
      background: rgba(5,5,6,0.75);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      margin: 0 -1.5rem;
      padding: 1rem 1.5rem;
    }
    .logo {
      font-family: var(--display);
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--text);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-mark {
      width: 32px; height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      display: grid;
      place-items: center;
      flex-shrink: 0;
      box-shadow: 0 8px 24px var(--accent-glow);
    }
    .logo-mark .logo-icon { display: block; }
    .nav-links { display: flex; gap: 0.25rem; align-items: center; }
    .nav-links a:not(.btn) {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      padding: 0.5rem 0.85rem;
      border-radius: 999px;
      transition: color 0.2s, background 0.2s;
    }
    .nav-links a:not(.btn):hover,
    .nav-links a:not(.btn).active { color: var(--text); background: var(--surface); }
    .nav-links .btn.nav-cta,
    .nav-links .btn-primary.nav-cta {
      color: #ffffff;
    }
    .nav-links .btn.nav-cta:hover,
    .nav-links .btn-primary.nav-cta:hover {
      color: #ffffff;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.6rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      box-shadow: 0 12px 32px var(--accent-glow);
      animation: pulse-glow 4s ease-in-out infinite;
    }
    .btn-primary:hover { transform: translateY(-2px) scale(1.02); }
    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border-strong);
    }
    .btn-secondary:hover {
      background: var(--surface-hover);
      border-color: var(--muted);
      transform: translateY(-1px);
    }
    .btn-sm { padding: 0.55rem 1.1rem; font-size: 0.85rem; }
    .hero {
      text-align: center;
      padding: 4rem 0 5rem;
      position: relative;
    }
    .hero-glow {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, rgba(249,115,22,0.12), transparent 70%);
      pointer-events: none;
    }
    .hero-intro {
      max-width: 640px;
      margin: 0 auto 1.75rem;
      text-align: center;
    }
    .hero-intro-rule {
      width: 72px;
      height: 2px;
      margin: 0 auto 1.1rem;
      border-radius: 999px;
      background: linear-gradient(90deg, transparent, var(--accent), var(--accent-2), transparent);
    }
    .hero-intro-text {
      font-size: clamp(0.95rem, 2vw, 1.05rem);
      color: var(--muted);
      line-height: 1.65;
      letter-spacing: 0.01em;
    }
    .hero-intro-highlight {
      color: var(--text);
      font-weight: 500;
      background: linear-gradient(90deg, var(--accent-2), #fcd34d);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-eyebrow {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .hero-eyebrow-line {
      width: 56px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(249,115,22,0.6));
    }
    .hero-eyebrow-line:last-child {
      background: linear-gradient(90deg, rgba(249,115,22,0.6), transparent);
    }
    .hero-eyebrow-label {
      font-family: var(--display);
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent-2);
    }
    h1, h2, h3 { font-family: var(--display); letter-spacing: -0.03em; }
    h1 {
      font-size: clamp(2.5rem, 6vw, 4.25rem);
      font-weight: 700;
      line-height: 1.05;
      margin-bottom: 1.25rem;
      background: linear-gradient(180deg, #fff 0%, #fff 40%, rgba(255,255,255,0.72) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gradient-text {
      background: linear-gradient(90deg, var(--accent), var(--accent-2), #fcd34d);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 6s linear infinite;
    }
    .hero-lead {
      font-size: clamp(1.05rem, 2.5vw, 1.25rem);
      color: var(--muted);
      max-width: 620px;
      margin: 0 auto 2.25rem;
    }
    .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
      margin-top: 3.5rem;
      padding-top: 2.5rem;
      border-top: 1px solid var(--border);
    }
    .stat { text-align: center; }
    .stat-value {
      font-family: var(--display);
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
    }
    .stat-label { font-size: 0.85rem; color: var(--muted); margin-top: 0.25rem; }
    section { padding: 5rem 0; }
    .section-head { text-align: center; margin-bottom: 3rem; }
    .section-head h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 0.75rem; }
    .section-head p { color: var(--muted); max-width: 560px; margin: 0 auto; font-size: 1.05rem; }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .card {
      background: linear-gradient(180deg, var(--surface) 0%, transparent 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
      transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: var(--border-strong);
      box-shadow: var(--shadow);
    }
    .card-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: var(--accent-soft);
      display: grid;
      place-items: center;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    .card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .card p { color: var(--muted); font-size: 0.95rem; }
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      counter-reset: step;
    }
    .step {
      position: relative;
      padding: 1.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
    }
    .step::before {
      counter-increment: step;
      content: counter(step);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px; height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .step h3 { font-size: 1rem; margin-bottom: 0.35rem; }
    .step p { color: var(--muted); font-size: 0.9rem; }
    .compare {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .compare-col {
      border-radius: var(--radius);
      padding: 1.75rem;
      border: 1px solid var(--border);
    }
    .compare-col.bad { background: rgba(248,113,113,0.05); border-color: rgba(248,113,113,0.2); }
    .compare-col.good { background: var(--accent-soft); border-color: rgba(249,115,22,0.3); }
    .compare-col h3 { font-size: 1rem; margin-bottom: 1rem; }
    .compare-col li {
      list-style: none;
      padding: 0.35rem 0;
      color: var(--muted);
      font-size: 0.9rem;
      display: flex;
      gap: 0.5rem;
    }
    .social-proof {
      text-align: center;
      padding: 3rem 0 4rem;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin: 0 0 1rem;
    }
    .social-proof-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    .social-proof-quotes {
      max-width: 720px;
      margin: 0 auto 2rem;
    }
    .social-proof-quote {
      margin: 0;
      padding: 1.75rem 2rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: linear-gradient(180deg, var(--surface) 0%, transparent 100%);
    }
    .social-proof-quote p {
      font-size: 1.1rem;
      line-height: 1.7;
      color: var(--text);
      margin-bottom: 1rem;
    }
    .social-proof-quote footer {
      color: var(--muted);
      font-size: 0.9rem;
    }
    .social-proof-logos {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }
    .social-proof-logo {
      display: inline-flex;
      align-items: center;
      padding: 0.45rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 500;
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
      gap: 1.25rem;
      align-items: stretch;
    }
    .pricing-card {
      background: linear-gradient(180deg, var(--surface) 0%, transparent 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem 1.75rem;
      position: relative;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s, border-color 0.35s;
    }
    .pricing-card:hover { transform: translateY(-8px); box-shadow: var(--shadow); }
    .pricing-card.featured {
      border-color: rgba(249,115,22,0.5);
      background: linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 100%);
      transform: scale(1.03);
    }
    .pricing-card.featured:hover { transform: scale(1.03) translateY(-8px); }
    .featured-badge {
      position: absolute;
      top: -12px; left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.3rem 0.85rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .tier-name { font-size: 0.9rem; font-weight: 600; color: var(--muted); margin-bottom: 0.5rem; }
    .price {
      font-family: var(--display);
      font-size: 2.75rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .pricing-card ul { list-style: none; margin-bottom: 1.5rem; }
    .pricing-card li {
      padding: 0.45rem 0;
      color: var(--muted);
      font-size: 0.9rem;
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
    }
    .pricing-card li::before {
      content: "✓";
      color: var(--success);
      font-weight: 700;
      flex-shrink: 0;
    }
    .pricing-card .btn { width: 100%; }
    .advantage-box {
      max-width: 720px;
      margin: 0 auto;
      padding: 2.5rem;
      border-radius: var(--radius);
      border: 1px solid rgba(249,115,22,0.35);
      background: linear-gradient(135deg, rgba(249,115,22,0.1), transparent);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .advantage-box::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 0%, rgba(249,115,22,0.15), transparent 60%);
      pointer-events: none;
    }
    .advantage-box p { color: var(--muted); font-size: 1.1rem; position: relative; }
    .advantage-box strong { color: var(--accent-2); }
    .cta-banner {
      text-align: center;
      padding: 4rem 2rem;
      border-radius: calc(var(--radius) + 4px);
      border: 1px solid var(--border);
      background: linear-gradient(180deg, var(--surface), transparent);
      position: relative;
      overflow: hidden;
    }
    .cta-banner::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.12), transparent 60%);
      pointer-events: none;
    }
    .cta-banner h2 { margin-bottom: 0.75rem; position: relative; }
    .cta-banner p { color: var(--muted); margin-bottom: 1.5rem; position: relative; }
    .cta-banner .btn { position: relative; }
    .faq-list { max-width: 720px; margin: 0 auto; }
    .faq-item {
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 0.75rem;
      overflow: hidden;
      background: var(--surface);
      transition: border-color 0.2s;
    }
    .faq-item.open { border-color: rgba(249,115,22,0.35); }
    .faq-q {
      width: 100%;
      text-align: left;
      padding: 1.1rem 1.25rem;
      background: none;
      border: none;
      color: var(--text);
      font-family: var(--font);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .faq-q::after {
      content: "+";
      font-size: 1.25rem;
      color: var(--muted);
      transition: transform 0.25s;
    }
    .faq-item.open .faq-q::after { transform: rotate(45deg); color: var(--accent); }
    .faq-a {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s ease, padding 0.35s;
      color: var(--muted);
      font-size: 0.9rem;
      padding: 0 1.25rem;
    }
    .faq-item.open .faq-a { max-height: 200px; padding: 0 1.25rem 1.1rem; }
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .site-footer {
      margin-top: 5rem;
      width: 100%;
      text-align: left;
      background: linear-gradient(180deg, transparent 0%, rgba(12,12,15,0.6) 24%, rgba(8,8,10,0.95) 100%);
      border-top: 1px solid var(--border);
      position: relative;
    }
    .site-footer::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent);
    }
    .footer-inner {
      max-width: 1140px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem 2rem;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: minmax(240px, 1.6fr) repeat(3, minmax(120px, 1fr));
      gap: 3rem 2rem;
      margin-bottom: 2.5rem;
      align-items: start;
    }
    .footer-brand { text-align: left; }
    .footer-logo {
      display: inline-flex;
      margin-bottom: 1rem;
    }
    .footer-tagline {
      color: var(--muted);
      font-size: 0.92rem;
      max-width: 300px;
      line-height: 1.65;
      margin-bottom: 1.25rem;
    }
    .footer-brand-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-bottom: 1.25rem;
    }
    .footer-social {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .footer-social-link {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      transition: color 0.2s, border-color 0.2s;
    }
    .footer-social-link:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }
    .footer-col {
      text-align: left;
    }
    .footer-col h4 {
      font-family: var(--display);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text);
      margin-bottom: 1.1rem;
      font-weight: 600;
    }
    .footer-col ul { list-style: none; padding: 0; margin: 0; }
    .footer-col li { margin-bottom: 0.65rem; }
    .footer-col a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s, transform 0.2s;
      display: inline-block;
    }
    .footer-col a:hover {
      color: var(--accent-2);
      transform: translateX(2px);
    }
    .footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .footer-bottom-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .footer-copy {
      margin: 0;
      color: var(--muted);
      font-size: 0.85rem;
      text-align: left;
    }
    .footer-status {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .footer-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px rgba(52,211,153,0.6);
    }
    .footer-meta {
      margin: 0;
      color: var(--muted);
      font-size: 0.85rem;
      text-align: right;
    }
    .footer-bottom a { color: var(--muted); text-decoration: none; }
    .footer-bottom a:hover { color: var(--accent); }
    .legal-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 1.5rem 0 4rem;
    }
    .legal-hero {
      text-align: center;
      padding: 2rem 0 2.75rem;
      position: relative;
    }
    .legal-hero::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      height: 240px;
      background: radial-gradient(ellipse, rgba(249,115,22,0.1), transparent 70%);
      pointer-events: none;
    }
    .legal-hero h1 {
      position: relative;
      font-size: clamp(2rem, 5vw, 3rem);
      margin-bottom: 1rem;
    }
    .legal-meta {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, var(--surface) 0%, transparent 100%);
      color: var(--muted);
      font-size: 0.88rem;
    }
    .legal-layout {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 2rem;
      align-items: start;
    }
    .legal-sidebar {
      position: sticky;
      top: 5.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .legal-toc,
    .legal-related {
      padding: 1.25rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: linear-gradient(180deg, var(--surface) 0%, transparent 100%);
    }
    .legal-toc-label,
    .legal-related-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 0.85rem;
    }
    .legal-toc ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .legal-toc li { margin-bottom: 0.35rem; }
    .legal-toc a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.88rem;
      display: block;
      padding: 0.4rem 0.55rem;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }
    .legal-toc a:hover {
      color: var(--text);
      background: var(--surface-hover);
    }
    .legal-doc {
      padding: 2rem 2.25rem;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%),
        var(--bg-elevated);
      box-shadow: var(--shadow);
    }
    .legal-section {
      padding: 1.85rem 0;
      margin: 0;
      border-bottom: 1px solid var(--border);
    }
    .legal-section:first-child { padding-top: 0; }
    .legal-section:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .legal-section h2 {
      font-size: 1.25rem;
      text-align: left;
      margin-bottom: 1rem;
      color: var(--text);
    }
    .legal-section p,
    .legal-section li {
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.75;
    }
    .legal-section p + p { margin-top: 0.85rem; }
    .legal-section ul {
      margin: 0.85rem 0 0 1.35rem;
    }
    .legal-section li { margin-bottom: 0.45rem; }
    .legal-section li strong { color: var(--text); }
    .legal-section a { color: var(--accent-2); text-decoration: none; }
    .legal-section a:hover { text-decoration: underline; }
    .legal-related-links {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .legal-related-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.88rem;
      padding: 0.4rem 0.55rem;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }
    .legal-related-links a:hover {
      color: var(--text);
      background: var(--surface-hover);
    }
    .legal-related-links a.current {
      color: var(--accent-2);
      background: var(--accent-soft);
    }
    @media (max-width: 768px) {
      .compare { grid-template-columns: 1fr; }
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem 1.5rem;
      }
      .footer-brand { grid-column: 1 / -1; }
      .footer-bottom {
        flex-direction: column;
        align-items: flex-start;
      }
      .footer-meta { text-align: left; }
      .legal-layout { grid-template-columns: 1fr; }
      .legal-sidebar {
        position: static;
        order: -1;
      }
      .legal-toc ul {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .legal-toc li { margin-bottom: 0; }
      .legal-doc { padding: 1.5rem 1.25rem; }
      .pricing-card.featured { transform: none; }
      .hide-mobile { display: none; }
      .stats { gap: 1.5rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
      .reveal { opacity: 1; transform: none; }
    }
  `;
}
