const form = document.getElementById("stats-form");
const statusEl = document.getElementById("stats-status");
const resultsSection = document.getElementById("stats-results");
const summaryCards = document.getElementById("summary-cards");
const packagesTableBody = document.querySelector("#packages-table tbody");
const sourcesList = document.getElementById("sources-list");
const notesList = document.getElementById("notes-list");
const generatedEl = document.getElementById("stats-generated");
const trafficPeriodEl = document.getElementById("traffic-period");
const trafficStatusEl = document.getElementById("traffic-status");
const trafficCards = document.getElementById("traffic-cards");
const countriesTableBody = document.querySelector("#countries-table tbody");
const pagesTableBody = document.querySelector("#pages-table tbody");

function setStatus(message, type = "") {
  statusEl.hidden = !message;
  statusEl.textContent = message;
  statusEl.className = `admin-status${type ? ` is-${type}` : ""}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-PT").format(Number(value) || 0);
}

function renderSummary(summary) {
  const cards = [
    ["Utilizadores Auth", summary.total_auth_users],
    ["Entitlements activos", summary.active_entitlements],
    ["Users com acesso activo", summary.distinct_users_with_active_access],
    ["Users com progresso", summary.users_with_progress],
    ["Documentos de progresso", summary.progress_documents],
    ["Encomendas Lemon Squeezy", summary.orders_processed],
    ["Grants admin registados", summary.admin_grants_logged],
  ];

  summaryCards.replaceChildren();
  for (const [label, value] of cards) {
    const card = document.createElement("article");
    card.className = "admin-stat-card";
    card.innerHTML = `<span class="admin-stat-card__value">${formatNumber(value)}</span><span class="admin-stat-card__label">${label}</span>`;
    summaryCards.appendChild(card);
  }
}

function renderPackages(packages) {
  packagesTableBody.replaceChildren();
  for (const pkg of packages) {
    const row = document.createElement("tr");
    if (pkg.active_entitlements === 0 && pkg.users_with_progress === 0) {
      row.className = "is-muted";
    }
    row.innerHTML = `
      <td><strong>${escapeHtml(pkg.title)}</strong></td>
      <td><code>${escapeHtml(pkg.package_id)}</code></td>
      <td>${formatNumber(pkg.active_entitlements)}</td>
      <td>${formatNumber(pkg.expired_entitlements)}</td>
      <td>${formatNumber(pkg.active_users)}</td>
      <td>${formatNumber(pkg.users_with_progress)}</td>
    `;
    packagesTableBody.appendChild(row);
  }
}

function renderSources(sources) {
  sourcesList.replaceChildren();
  const entries = Object.entries(sources ?? {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    sourcesList.innerHTML = "<li>Nenhum entitlement encontrado.</li>";
    return;
  }
  for (const [source, count] of entries) {
    const li = document.createElement("li");
    li.textContent = `${source}: ${formatNumber(count)}`;
    sourcesList.appendChild(li);
  }
}

function renderNotes(notes) {
  notesList.replaceChildren();
  for (const text of Object.values(notes ?? {})) {
    const li = document.createElement("li");
    li.textContent = text;
    notesList.appendChild(li);
  }
}

function renderTraffic(traffic) {
  trafficCards.replaceChildren();
  countriesTableBody.replaceChildren();
  pagesTableBody.replaceChildren();
  trafficStatusEl.hidden = true;
  trafficStatusEl.className = "admin-traffic-status";

  if (!traffic?.configured) {
    trafficPeriodEl.textContent = "";
    trafficStatusEl.hidden = false;
    trafficStatusEl.textContent = traffic?.message ?? "Tráfego Vercel não configurado.";
    return;
  }

  trafficPeriodEl.textContent = traffic.period?.label ?? "";

  if (traffic.error) {
    trafficStatusEl.hidden = false;
    trafficStatusEl.className = "admin-traffic-status is-error";
    trafficStatusEl.textContent = traffic.error;
    return;
  }

  const card = document.createElement("article");
  card.className = "admin-stat-card";
  card.innerHTML = `<span class="admin-stat-card__value">${formatNumber(traffic.pageviews)}</span><span class="admin-stat-card__label">Pageviews (total)</span>`;
  trafficCards.appendChild(card);

  const countries = traffic.countries ?? [];
  if (!countries.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">Sem dados de países no período.</td>`;
    countriesTableBody.appendChild(row);
  } else {
    for (const entry of countries) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(entry.country_name ?? entry.country_code ?? entry.country)}</td>
        <td><code>${escapeHtml(entry.country_code ?? entry.country ?? "")}</code></td>
        <td>${formatNumber(entry.pageviews)}</td>
      `;
      countriesTableBody.appendChild(row);
    }
  }

  const pages = traffic.top_pages ?? [];
  if (!pages.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="2">Sem dados de páginas no período.</td>`;
    pagesTableBody.appendChild(row);
  } else {
    for (const entry of pages) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><code>${escapeHtml(entry.path)}</code></td>
        <td>${formatNumber(entry.pageviews)}</td>
      `;
      pagesTableBody.appendChild(row);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resultsSection.hidden = true;
  setStatus("A carregar estatísticas…", "");

  const secret = String(new FormData(form).get("secret") ?? "");

  try {
    const res = await fetch("/api/admin-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Pedido falhou.");
    }

    generatedEl.textContent = `Actualizado: ${new Date(data.generated_at).toLocaleString("pt-PT")}`;
    renderSummary(data.summary);
    renderTraffic(data.traffic);
    renderPackages(data.packages);
    renderSources(data.summary.entitlement_sources);
    renderNotes(data.notes);
    resultsSection.hidden = false;
    setStatus("", "");
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Erro desconhecido.", "error");
  }
});
