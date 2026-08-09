export function buildDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monetready Dashboard</title>
  <style>
    :root {
      --bg: #09090b;
      --surface: #131316;
      --surface-2: #1a1a1f;
      --border: #27272a;
      --text: #fafafa;
      --muted: #a1a1aa;
      --accent: #f97316;
      --accent-glow: rgba(249, 115, 22, 0.2);
      --success: #22c55e;
      --warning: #eab308;
      --danger: #ef4444;
      --info: #3b82f6;
      --font: "Segoe UI", system-ui, sans-serif;
      --mono: "Cascadia Code", monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
    }
    .layout { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      gap: 1rem;
      flex-wrap: wrap;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .product-select {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.45rem 0.75rem;
      font-size: 0.85rem;
      min-width: 180px;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand h1 { font-size: 1.35rem; font-weight: 700; }
    .brand span { color: var(--accent); }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    .badge.ready { border-color: var(--success); color: var(--success); }
    .badge.not-ready { border-color: var(--warning); color: var(--warning); }
    .grid { display: grid; gap: 1.25rem; }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .card h2 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-bottom: 1rem;
      font-weight: 600;
    }
    .score-hero {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .score-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: conic-gradient(var(--accent) calc(var(--pct) * 1%), var(--border) 0);
      position: relative;
    }
    .score-ring::before {
      content: "";
      position: absolute;
      inset: 8px;
      background: var(--surface);
      border-radius: 50%;
    }
    .score-ring .inner {
      position: relative;
      z-index: 1;
      text-align: center;
    }
    .score-ring .value { font-size: 1.75rem; font-weight: 800; }
    .score-ring .label { font-size: 0.7rem; color: var(--muted); }
    .score-meta h3 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .score-meta p { color: var(--muted); font-size: 0.95rem; }
    .grade {
      display: inline-block;
      font-size: 2rem;
      font-weight: 800;
      color: var(--accent);
      margin-left: 0.5rem;
    }
    .bar-row { margin-bottom: 0.75rem; }
    .bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 0.3rem;
    }
    .bar-label span:last-child { color: var(--muted); }
    .bar {
      height: 6px;
      background: var(--border);
      border-radius: 999px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 999px;
      transition: width 0.4s ease;
    }
    .finding {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.85rem 1rem;
      border-radius: 0.65rem;
      background: var(--surface-2);
      border: 1px solid var(--border);
      margin-bottom: 0.5rem;
    }
    .finding.critical {
      background: rgba(239, 68, 68, 0.06);
      border-color: rgba(239, 68, 68, 0.22);
    }
    .finding.warning {
      background: rgba(234, 179, 8, 0.06);
      border-color: rgba(234, 179, 8, 0.22);
    }
    .finding.info {
      background: rgba(59, 130, 246, 0.06);
      border-color: rgba(59, 130, 246, 0.22);
    }
    .finding-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.04);
      color: var(--muted);
    }
    .finding.critical .finding-icon { color: var(--danger); background: rgba(239, 68, 68, 0.12); }
    .finding.warning .finding-icon { color: var(--warning); background: rgba(234, 179, 8, 0.12); }
    .finding.info .finding-icon { color: var(--info); background: rgba(59, 130, 246, 0.12); }
    .finding-body { flex: 1; min-width: 0; }
    .finding-title { font-weight: 600; font-size: 0.9rem; }
    .finding-rec { color: var(--muted); font-size: 0.8rem; margin-top: 0.25rem; line-height: 1.5; }
    .checklist li {
      list-style: none;
      padding: 0.4rem 0;
      font-size: 0.9rem;
      color: var(--muted);
      font-family: var(--mono);
    }
    .steps li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
      color: var(--muted);
    }
    .steps li:last-child { border-bottom: none; }
    .steps strong { color: var(--accent); margin-right: 0.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th {
      text-align: left;
      color: var(--muted);
      font-weight: 600;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:last-child td { border-bottom: none; }
    .tag {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .tag.conversion { background: rgba(34,197,94,0.15); color: var(--success); }
    .tag.retention { background: rgba(234,179,8,0.15); color: var(--warning); }
    .tag.growth { background: rgba(59,130,246,0.15); color: var(--info); }
    .tag.onboarding { background: rgba(168,85,247,0.15); color: #a855f7; }
    .tag.enabled { background: rgba(34,197,94,0.15); color: var(--success); }
    .tag.disabled { background: rgba(161,161,170,0.1); color: var(--muted); }
    .btn {
      padding: 0.4rem 0.75rem;
      border-radius: 0.4rem;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn:hover { border-color: var(--accent); color: var(--accent); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-live {
      border-color: rgba(249, 115, 22, 0.45);
      color: var(--accent);
    }
    .btn-live:hover { border-color: var(--accent); }
    .playbook-actions { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-overlay.open { display: flex; }
    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      max-width: 560px;
      width: 100%;
      max-height: 80vh;
      overflow: auto;
      padding: 1.5rem;
    }
    .modal h3 { margin-bottom: 1rem; }
    .modal pre {
      background: var(--bg);
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      white-space: pre-wrap;
      color: var(--muted);
      font-family: var(--mono);
    }
    .modal-close {
      margin-top: 1rem;
      width: 100%;
    }
    .loading {
      text-align: center;
      padding: 4rem;
      color: var(--muted);
    }
    .error {
      background: rgba(239,68,68,0.1);
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 2rem 0;
    }
    .tiers { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }
    .tier-chip {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
    }
    .tier-chip strong { color: var(--accent); }
    .onboarding {
      background: linear-gradient(135deg, rgba(249,115,22,0.1), transparent);
      border: 1px solid rgba(249,115,22,0.3);
      border-radius: 0.75rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .onboarding h3 { font-size: 1rem; margin-bottom: 0.75rem; }
    .onboarding-steps { display: flex; flex-direction: column; gap: 0.5rem; }
    .onboarding-step {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: var(--muted);
    }
    .onboarding-step.done { color: var(--success); }
    .onboarding-step code {
      background: var(--surface-2);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: var(--mono);
      font-size: 0.8rem;
      color: var(--text);
    }
    .quick-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .quick-actions code {
      background: var(--surface-2);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      border: 1px solid var(--border);
    }
    footer {
      text-align: center;
      color: var(--muted);
      font-size: 0.8rem;
      padding: 2rem 0 1rem;
      margin-top: 2rem;
      border-top: 1px solid var(--border);
    }
    @media (max-width: 640px) {
      .score-hero { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <header>
      <div class="brand">
        <h1><span>🔥</span> Monetready Dashboard</h1>
      </div>
      <div class="header-actions">
        <select id="product-select" class="product-select" style="display:none" onchange="switchProduct(this.value)"></select>
        <div id="launch-badge"></div>
      </div>
    </header>

    <div id="app">
      <div class="loading">Loading your product data…</div>
    </div>

    <footer>
      Local-first · Data stays on your machine · <a href="https://github.com/kory-kaai/monetready" style="color:var(--muted)">Monetready</a>
    </footer>
  </div>

  <div class="modal-overlay" id="modal">
    <div class="modal">
      <h3 id="modal-title">Playbook output</h3>
      <pre id="modal-body"></pre>
      <button class="btn modal-close" onclick="closeModal()">Close</button>
    </div>
  </div>

  <script>
    const CATEGORY_LABELS = {
      pricing: "Pricing",
      onboarding: "Onboarding",
      conversion: "Conversion",
      distribution: "Distribution",
      integrations: "Integrations",
      differentiation: "Differentiation",
    };

    function closeModal() {
      document.getElementById("modal").classList.remove("open");
    }

    let currentProductId = null;
    let playbookExecuteEnabled = false;

    function switchProduct(productId) {
      currentProductId = productId;
      loadOverview(productId);
    }

    async function loadOverview(productId) {
      const query = productId ? "?product=" + encodeURIComponent(productId) : "";
      const res = await fetch("/api/overview" + query);
      const data = await res.json();
      render(data);
    }

    async function initWorkspace() {
      const res = await fetch("/api/workspace");
      const workspace = await res.json();
      const select = document.getElementById("product-select");

      if (workspace.products.length > 1) {
        select.style.display = "block";
        select.innerHTML = workspace.products.map(function (product) {
          return '<option value="' + product.id + '">' + product.name + '</option>';
        }).join("");
        currentProductId = workspace.products[0].id;
        select.value = currentProductId;
      }

      await loadOverview(currentProductId);
    }

    async function runPlaybook(id, execute) {
      const buttons = document.querySelectorAll('[data-playbook="' + id + '"]');
      buttons.forEach(function (el) { el.disabled = true; });
      try {
        const parts = [];
        if (currentProductId) parts.push("product=" + encodeURIComponent(currentProductId));
        if (execute) parts.push("execute=true");
        const query = parts.length ? "?" + parts.join("&") : "";
        const res = await fetch("/api/playbooks/" + id + "/run" + query, { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || ("HTTP " + res.status));
        }
        const output = data.actions?.map(a => "[" + a.type + "]\\n" + a.output).join("\\n\\n") || JSON.stringify(data, null, 2);
        const modeLabel = data.status === "simulated" ? " (dry-run)" : data.status === "executed" ? " (live)" : " (" + data.status + ")";
        document.getElementById("modal-title").textContent = "Playbook: " + id + modeLabel;
        document.getElementById("modal-body").textContent = output;
        document.getElementById("modal").classList.add("open");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to run playbook");
      } finally {
        buttons.forEach(function (el) { el.disabled = false; });
      }
    }

    function findingIcon(severity) {
      if (severity === "critical") return "✗";
      if (severity === "warning") return "!";
      if (severity === "info") return "i";
      return "·";
    }

    function renderBar(category, score, max) {
      const pct = Math.round((score / max) * 100);
      const label = CATEGORY_LABELS[category] || category;
      return '<div class="bar-row">' +
        '<div class="bar-label"><span>' + label + '</span><span>' + pct + '%</span></div>' +
        '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
    }

    function render(data) {
      const { spec, score, checklist, nextSteps, playbooks, pagesGenerated } = data;
      playbookExecuteEnabled = Boolean(data.playbookExecuteEnabled);
      const pct = Math.round((score.total / score.maxTotal) * 100);
      const findings = score.categories.flatMap(c => c.findings).filter(f => f.severity !== "pass").slice(0, 6);

      document.getElementById("launch-badge").innerHTML = score.readyToLaunch
        ? '<span class="badge ready">✓ Launch-ready</span>'
        : '<span class="badge not-ready">Not launch-ready</span>';

      const setupDone = !!spec.product.problem && spec.product.problem.length > 20;
      const pagesDone = pagesGenerated;
      const scoreDone = pct >= 60;

      const onboarding = (!setupDone || !pagesDone || !scoreDone) ? (
        '<div class="onboarding">' +
        '<h3>🚀 Get started with Monetready</h3>' +
        '<div class="onboarding-steps">' +
        '<div class="onboarding-step' + (setupDone ? ' done' : '') + '">' + (setupDone ? '✓' : '1.') + ' Run <code>monetready setup</code> to define your product</div>' +
        '<div class="onboarding-step' + (pagesDone ? ' done' : '') + '">' + (pagesDone ? '✓' : '2.') + ' Run <code>monetready launch</code> to generate pages + report</div>' +
        '<div class="onboarding-step' + (scoreDone ? ' done' : '') + '">' + (scoreDone ? '✓' : '3.') + ' Reach 60+ Monetready Score to launch</div>' +
        '</div></div>'
      ) : '';

      const tiers = spec.pricing.tiers.map(t =>
        '<div class="tier-chip"><strong>' + t.name + '</strong> ' +
        (t.price === 0 ? 'Free' : '$' + t.price + '/' + t.interval) + '</div>'
      ).join("");

      const playbookRows = playbooks.map(pb => {
        const actionCell = pb.enabled
          ? (playbookExecuteEnabled
            ? '<div class="playbook-actions">' +
              '<button class="btn" data-playbook="' + pb.id + '" onclick="runPlaybook(\\'' + pb.id + '\\', false)">Dry run</button>' +
              '<button class="btn btn-live" data-playbook="' + pb.id + '" onclick="runPlaybook(\\'' + pb.id + '\\', true)">Run live</button>' +
              '</div>'
            : '<button class="btn" data-playbook="' + pb.id + '" onclick="runPlaybook(\\'' + pb.id + '\\', false)">Run</button>')
          : '<button class="btn" disabled title="Enable in monetready.yaml">Run</button>';

        return '<tr>' +
        '<td><strong>' + pb.name + '</strong><br><span style="color:var(--muted);font-size:0.8rem">' + pb.description + '</span></td>' +
        '<td><span class="tag ' + pb.category + '">' + pb.category + '</span></td>' +
        '<td><span class="tag ' + (pb.enabled ? 'enabled' : 'disabled') + '">' + (pb.enabled ? 'enabled' : 'disabled') + '</span></td>' +
        '<td>' + actionCell + '</td>' +
        '</tr>';
      }).join("");

      document.getElementById("app").innerHTML =
        onboarding +
        '<div class="grid" style="gap:1.25rem">' +

        '<div class="card"><h2>Quick actions</h2>' +
        '<div class="quick-actions">' +
        '<code>monetready launch</code><code>monetready generate pages</code><code>monetready score</code>' +
        (pagesGenerated ? '<code>npx serve .monetready/pages</code>' : '') +
        '</div></div>' +

        '<div class="card">' +
        '<div class="score-hero">' +
        '<div class="score-ring" style="--pct:' + pct + '">' +
        '<div class="inner"><div class="value">' + pct + '</div><div class="label">Monetready Score</div></div></div>' +
        '<div class="score-meta">' +
        '<h3>' + spec.product.name + ' <span class="grade">' + score.grade + '</span></h3>' +
        '<p>' + (spec.product.tagline || spec.product.problem) + '</p>' +
        '<p style="margin-top:0.5rem;font-size:0.85rem">' + score.total + '/' + score.maxTotal + ' points</p>' +
        '</div></div></div>' +

        '<div class="grid grid-2">' +
        '<div class="card"><h2>Score breakdown</h2>' +
        score.categories.map(c => renderBar(c.category, c.score, c.maxScore)).join("") +
        '</div>' +

        '<div class="card"><h2>Top findings</h2>' +
        (findings.length ? findings.map(f =>
          '<div class="finding ' + f.severity + '">' +
          '<div class="finding-icon">' + findingIcon(f.severity) + '</div>' +
          '<div class="finding-body">' +
          '<div class="finding-title">' + f.title + '</div>' +
          '<div class="finding-rec">' + f.recommendation + '</div></div></div>'
        ).join("") : '<p style="color:var(--muted)">All checks passed.</p>') +
        '</div></div>' +

        '<div class="grid grid-2">' +
        '<div class="card"><h2>Launch checklist</h2><ul class="checklist">' +
        checklist.map(item => '<li>' + item + '</li>').join("") +
        '</ul></div>' +

        '<div class="card"><h2>Next steps</h2><ol class="steps">' +
        nextSteps.map((step, i) => '<li><strong>' + (i+1) + '.</strong>' + step + '</li>').join("") +
        '</ol></div></div>' +

        '<div class="card"><h2>Pricing tiers</h2>' + tiers + '</div>' +

        '<div class="card"><h2>Revenue playbooks</h2>' +
        (playbookExecuteEnabled ? '<p style="color:var(--muted);font-size:0.85rem;margin:-0.5rem 0 1rem">Live execution enabled — Run live uses your configured integrations.</p>' : '') +
        '<table><thead><tr><th>Playbook</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>' +
        '<tbody>' + playbookRows + '</tbody></table></div>' +

        '</div>';
    }

    initWorkspace().catch(() => {
      document.getElementById("app").innerHTML =
        '<div class="error">Failed to load dashboard. Make sure monetready.yaml exists in the project root.</div>';
    });
  </script>
</body>
</html>`;
}
