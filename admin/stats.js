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
const visitorsSalesChartEl = document.getElementById("visitors-sales-chart");
const visitorsSalesViewportEl = document.getElementById("visitors-sales-viewport");
const visitorsSalesCarouselEl = document.getElementById("visitors-sales-carousel");
const visitorsSalesRailEl = document.getElementById("visitors-sales-rail");
const visitorsSalesMonthTitleEl = document.getElementById("visitors-sales-month-title");
const visitorsSalesMonthNavEl = document.getElementById("visitors-sales-month-nav");
const visitorsSalesMetaEl = document.getElementById("visitors-sales-meta");
const visitorsSalesStatusEl = document.getElementById("visitors-sales-status");

const MONTH_LABEL = new Intl.DateTimeFormat("pt-PT", { month: "long", timeZone: "UTC" });

let visitorsSalesMonths = [];
let visitorsSalesActiveIndex = 0;
let visitorsSalesNavReady = false;
let visitorsSalesDragActive = false;
let visitorsSalesDragStartX = 0;

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

function capitalizeMonthLabel(label) {
  if (!label) return "";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildMonthsFromSeries(series, todayKey) {
  const byDate = new Map(series.map((entry) => [entry.date, entry]));
  const monthKeys = new Set(series.map((entry) => entry.date.slice(0, 7)));
  monthKeys.add(todayKey.slice(0, 7));

  return [...monthKeys].sort().map((monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${monthKey}-${String(day).padStart(2, "0")}`;
      const stored = byDate.get(date);
      days.push({
        date,
        day,
        visitors: stored?.visitors ?? 0,
        sales: stored?.sales ?? 0,
        is_today: date === todayKey,
        is_future: date > todayKey,
      });
    }

    const monthLabel = capitalizeMonthLabel(
      MONTH_LABEL.format(new Date(Date.UTC(year, month - 1, 1))),
    );

    return { monthKey, monthLabel, days };
  });
}

function scrollVisitorsSalesToToday() {
  if (!visitorsSalesViewportEl || !visitorsSalesChartEl) return;
  const todayColumn = visitorsSalesChartEl.querySelector(".admin-vbars-day.is-today");
  if (!todayColumn) {
    visitorsSalesViewportEl.scrollLeft = 0;
    return;
  }

  const viewport = visitorsSalesViewportEl;
  const columnRect = todayColumn.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();
  const colCenter =
    columnRect.left - viewportRect.left + viewport.scrollLeft + columnRect.width / 2;
  viewport.scrollLeft = Math.max(0, colCenter - viewport.clientWidth / 2);
}

function renderVisitorsSalesMonthChart(month) {
  visitorsSalesChartEl.replaceChildren();
  if (!month) return;

  const pastDays = month.days.filter((entry) => !entry.is_future);
  const maxVisitors = Math.max(...pastDays.map((entry) => entry.visitors), 1);
  const maxSales = Math.max(...pastDays.map((entry) => entry.sales), 1);

  for (const entry of month.days) {
    const col = document.createElement("div");
    col.className = "admin-vbars-day";
    if (entry.is_today) col.classList.add("is-today");
    if (entry.is_future) col.classList.add("is-future");

    let barsHtml = `<div class="admin-vbars-bars admin-vbars-bars--empty" aria-hidden="true"></div>`;

    if (!entry.is_future) {
      const visitorHeight = Math.max(2, Math.round((entry.visitors / maxVisitors) * 100));
      const salesHeight = Math.max(2, Math.round((entry.sales / maxSales) * 100));
      const visitorValueClass = visitorHeight < 16 ? " is-hidden" : "";
      const salesValueClass = salesHeight < 16 ? " is-hidden" : "";
      barsHtml = `
        <div class="admin-vbars-bars" aria-hidden="true">
          <div
            class="admin-vbars-bar admin-vbars-bar--visitors"
            style="height: ${visitorHeight}%"
            title="Visitantes únicos: ${formatNumber(entry.visitors)}"
          >
            <span class="admin-vbars-bar__value${visitorValueClass}">${entry.visitors > 0 ? formatNumber(entry.visitors) : ""}</span>
          </div>
          <div
            class="admin-vbars-bar admin-vbars-bar--sales"
            style="height: ${salesHeight}%"
            title="Vendas: ${formatNumber(entry.sales)}"
          >
            <span class="admin-vbars-bar__value${salesValueClass}">${entry.sales > 0 ? formatNumber(entry.sales) : ""}</span>
          </div>
        </div>
      `;
    }

    col.innerHTML = `
      ${barsHtml}
      <span class="admin-vbars-day__label">${entry.day}</span>
    `;
    visitorsSalesChartEl.appendChild(col);
  }

  scrollVisitorsSalesToToday();
}

function renderVisitorsSalesRail() {
  visitorsSalesRailEl.replaceChildren();

  for (let index = 0; index < visitorsSalesMonths.length; index += 1) {
    if (index === visitorsSalesActiveIndex) continue;

    const month = visitorsSalesMonths[index];
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "admin-vbars-month-tab";
    tab.title = `Mostrar ${month.monthLabel}`;
    tab.setAttribute("aria-label", `Mostrar ${month.monthLabel}`);
    tab.addEventListener("click", () => {
      visitorsSalesActiveIndex = index;
      renderVisitorsSalesMonthView();
    });
    visitorsSalesRailEl.appendChild(tab);
  }
}

function renderVisitorsSalesMonthView() {
  const month = visitorsSalesMonths[visitorsSalesActiveIndex];
  if (!month) return;

  visitorsSalesMonthTitleEl.textContent = month.monthLabel;
  visitorsSalesMonthNavEl.classList.toggle(
    "admin-vbars-month-nav--visible",
    visitorsSalesMonths.length > 1,
  );
  visitorsSalesMonthNavEl.hidden = visitorsSalesMonths.length <= 1;
  renderVisitorsSalesRail();
  renderVisitorsSalesMonthChart(month);
}

function setVisitorsSalesActiveMonth(monthKey) {
  const index = visitorsSalesMonths.findIndex((month) => month.monthKey === monthKey);
  if (index >= 0) visitorsSalesActiveIndex = index;
}

function shiftVisitorsSalesMonth(delta) {
  if (!visitorsSalesMonths.length) return;
  visitorsSalesActiveIndex = Math.max(
    0,
    Math.min(visitorsSalesMonths.length - 1, visitorsSalesActiveIndex + delta),
  );
  renderVisitorsSalesMonthView();
}

function setupVisitorsSalesMonthNav() {
  if (!visitorsSalesMonthNavEl || visitorsSalesNavReady) return;
  visitorsSalesNavReady = true;

  visitorsSalesMonthNavEl.addEventListener("click", () => {
    shiftVisitorsSalesMonth(1);
  });

  visitorsSalesMonthNavEl.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    visitorsSalesDragActive = true;
    visitorsSalesDragStartX = event.clientX;
    visitorsSalesMonthNavEl.classList.add("is-dragging");
    event.preventDefault();
  });

  window.addEventListener("mousemove", (event) => {
    if (!visitorsSalesDragActive) return;
    const delta = event.clientX - visitorsSalesDragStartX;
    if (Math.abs(delta) < 36) return;
    shiftVisitorsSalesMonth(delta > 0 ? 1 : -1);
    visitorsSalesDragStartX = event.clientX;
  });

  window.addEventListener("mouseup", () => {
    visitorsSalesDragActive = false;
    visitorsSalesMonthNavEl?.classList.remove("is-dragging");
  });
}

function renderVisitorsSalesChart(chartData) {
  visitorsSalesChartEl.replaceChildren();
  visitorsSalesRailEl.replaceChildren();
  visitorsSalesStatusEl.hidden = true;
  visitorsSalesCarouselEl.hidden = true;

  if (chartData?.error) {
    visitorsSalesMetaEl.textContent = "";
    visitorsSalesStatusEl.hidden = false;
    visitorsSalesStatusEl.textContent = chartData.error;
    return;
  }

  const series = chartData?.series ?? [];
  const totalDays = chartData?.total_days ?? series.length;
  const todayKey = chartData?.today ?? new Date().toISOString().slice(0, 10);

  if (!series.length) {
    visitorsSalesMetaEl.textContent = "Histórico completo · sem registos ainda";
    visitorsSalesStatusEl.hidden = false;
    visitorsSalesStatusEl.textContent =
      "Os dados aparecem aqui à medida que carregas estatísticas (visitantes Vercel + vendas Lemon Squeezy).";
    return;
  }

  visitorsSalesMonths = buildMonthsFromSeries(series, todayKey);
  setVisitorsSalesActiveMonth(todayKey.slice(0, 7));
  visitorsSalesMetaEl.textContent = `${formatNumber(visitorsSalesMonths.length)} meses · ${formatNumber(totalDays)} dias registados`;
  visitorsSalesCarouselEl.hidden = false;

  setupVisitorsSalesMonthNav();
  renderVisitorsSalesMonthView();
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
    renderVisitorsSalesChart(data.visitors_vs_sales);
    renderPackages(data.packages);
    renderSources(data.summary.entitlement_sources);
    renderNotes(data.notes);
    resultsSection.hidden = false;
    setStatus("", "");
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Erro desconhecido.", "error");
  }
});
