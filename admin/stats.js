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
const devicesTableBody = document.querySelector("#devices-table tbody");
const dailyChartEl = document.getElementById("daily-chart");
const comboChartEl = document.getElementById("combo-chart");
const comboChartInnerEl = document.getElementById("combo-chart-inner");
const comboChartMonthEl = document.getElementById("combo-chart-month");
const comboChartMonthLabelEl = document.getElementById("combo-chart-month-label");
const comboChartViewportEl = document.getElementById("combo-chart-viewport");
const comboChartStatusEl = document.getElementById("combo-chart-status");
const comboZoomInBtn = document.getElementById("combo-zoom-in");
const comboZoomOutBtn = document.getElementById("combo-zoom-out");
const comboZoomLabelEl = document.getElementById("combo-zoom-label");

const COMBO_ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];
let comboZoomIndex = COMBO_ZOOM_LEVELS.indexOf(1);

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
  devicesTableBody.replaceChildren();
  dailyChartEl.replaceChildren();
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

  for (const [value, label] of [
    [traffic.pageviews, "Pageviews (total)"],
    [traffic.unique_visitors, "Visitantes únicos"],
  ]) {
    const card = document.createElement("article");
    card.className = "admin-stat-card";
    card.innerHTML = `<span class="admin-stat-card__value">${formatNumber(value)}</span><span class="admin-stat-card__label">${label}</span>`;
    trafficCards.appendChild(card);
  }

  renderDailyChart(traffic.daily ?? []);

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

  const devices = traffic.devices ?? [];
  if (!devices.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="2">Sem dados de dispositivos no período.</td>`;
    devicesTableBody.appendChild(row);
  } else {
    for (const entry of devices) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(entry.device_label ?? entry.device_type)}</td>
        <td>${formatNumber(entry.pageviews)}</td>
      `;
      devicesTableBody.appendChild(row);
    }
  }
}

function renderDailyChart(daily) {
  if (!daily.length) {
    dailyChartEl.innerHTML = `<p class="admin-daily-empty">Sem dados diários no período.</p>`;
    return;
  }

  const max = Math.max(...daily.map((entry) => entry.pageviews), 1);
  const formatter = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
  });

  for (const entry of daily) {
    const row = document.createElement("div");
    row.className = "admin-daily-row";
    const label = formatter.format(new Date(`${entry.date}T12:00:00`));
    const width = Math.max(4, Math.round((entry.pageviews / max) * 100));
    row.innerHTML = `
      <span class="admin-daily-row__label">${escapeHtml(label)}</span>
      <div class="admin-daily-row__track" aria-hidden="true">
        <div class="admin-daily-row__fill" style="width: ${width}%"></div>
      </div>
      <span class="admin-daily-row__value">${formatNumber(entry.pageviews)}</span>
    `;
    dailyChartEl.appendChild(row);
  }
}

function scrollComboToColumn(column) {
  if (!column || !comboChartViewportEl) return;
  const viewport = comboChartViewportEl;
  const columnRect = column.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();
  const colCenter =
    columnRect.left - viewportRect.left + viewport.scrollLeft + columnRect.width / 2;
  viewport.scrollLeft = Math.max(0, colCenter - viewport.clientWidth / 2);
}

function applyComboZoom() {
  const zoom = COMBO_ZOOM_LEVELS[comboZoomIndex] ?? 1;
  comboChartInnerEl.style.setProperty("--combo-zoom", String(zoom));
  comboZoomLabelEl.textContent = `${Math.round(zoom * 100)}%`;
  comboZoomOutBtn.disabled = comboZoomIndex <= 0;
  comboZoomInBtn.disabled = comboZoomIndex >= COMBO_ZOOM_LEVELS.length - 1;

  const todayColumn = comboChartEl.querySelector(".admin-combo-day.is-today");
  if (todayColumn) {
    scrollComboToColumn(todayColumn);
  }
}

function renderVisitorsSalesChart(chartData, traffic) {
  comboChartEl.replaceChildren();
  comboChartStatusEl.hidden = true;
  comboChartMonthEl.hidden = true;

  const series = chartData?.series ?? [];
  if (!series.length) {
    comboChartStatusEl.hidden = false;
    comboChartStatusEl.textContent = traffic?.configured
      ? "Sem dados diários de visitantes únicos ou vendas no mês."
      : "Visitantes únicos requerem Vercel Analytics; vendas vêm das encomendas Lemon Squeezy processadas.";
    applyComboZoom();
    return;
  }

  comboChartMonthLabelEl.textContent = chartData.month_label ?? "";
  comboChartMonthEl.hidden = !chartData.month_label;

  const pastDays = series.filter((entry) => !entry.is_future);
  const maxVisitors = Math.max(...pastDays.map((entry) => entry.visitors), 1);
  const maxSales = Math.max(...pastDays.map((entry) => entry.sales), 1);

  for (const entry of series) {
    const col = document.createElement("div");
    col.className = "admin-combo-day";
    if (entry.is_future) col.classList.add("is-future");
    if (entry.is_today) col.classList.add("is-today");

    const label = String(entry.day);
    let barsHtml = `<div class="admin-combo-bars admin-combo-bars--empty" aria-hidden="true"></div>`;

    if (!entry.is_future) {
      const visitorHeight = Math.max(2, Math.round((entry.visitors / maxVisitors) * 100));
      const salesHeight = Math.max(2, Math.round((entry.sales / maxSales) * 100));
      barsHtml = `
        <div class="admin-combo-bars" aria-hidden="true">
          <div
            class="admin-combo-bar admin-combo-bar--visitors"
            style="height: ${visitorHeight}%"
            title="Visitantes únicos: ${formatNumber(entry.visitors)}"
          >
            <span class="admin-combo-bar__value">${entry.visitors > 0 ? formatNumber(entry.visitors) : ""}</span>
          </div>
          <div
            class="admin-combo-bar admin-combo-bar--sales"
            style="height: ${salesHeight}%"
            title="Vendas: ${formatNumber(entry.sales)}"
          >
            <span class="admin-combo-bar__value">${entry.sales > 0 ? formatNumber(entry.sales) : ""}</span>
          </div>
        </div>
      `;
    }

    col.innerHTML = `
      ${barsHtml}
      <span class="admin-combo-day__label">${escapeHtml(label)}</span>
    `;
    comboChartEl.appendChild(col);
  }

  applyComboZoom();

  const todayColumn = comboChartEl.querySelector(".admin-combo-day.is-today");
  if (todayColumn) {
    scrollComboToColumn(todayColumn);
  } else if (comboChartViewportEl) {
    comboChartViewportEl.scrollLeft = comboChartViewportEl.scrollWidth;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

comboZoomInBtn?.addEventListener("click", () => {
  if (comboZoomIndex >= COMBO_ZOOM_LEVELS.length - 1) return;
  comboZoomIndex += 1;
  applyComboZoom();
});

comboZoomOutBtn?.addEventListener("click", () => {
  if (comboZoomIndex <= 0) return;
  comboZoomIndex -= 1;
  applyComboZoom();
});

comboChartViewportEl?.addEventListener(
  "wheel",
  (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    if (event.deltaY < 0 && comboZoomIndex < COMBO_ZOOM_LEVELS.length - 1) {
      comboZoomIndex += 1;
      applyComboZoom();
    } else if (event.deltaY > 0 && comboZoomIndex > 0) {
      comboZoomIndex -= 1;
      applyComboZoom();
    }
  },
  { passive: false },
);

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
    renderVisitorsSalesChart(data.traffic?.visitors_vs_sales ?? {}, data.traffic);
    renderPackages(data.packages);
    renderSources(data.summary.entitlement_sources);
    renderNotes(data.notes);
    resultsSection.hidden = false;
    setStatus("", "");
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Erro desconhecido.", "error");
  }
});
