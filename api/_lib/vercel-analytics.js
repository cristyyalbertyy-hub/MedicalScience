const API_BASE = "https://api.vercel.com";
const METRIC = "vercel.analytics_pageview.count";
const AGGREGATION_SUM = "sum";
const AGGREGATION_UNIQUE = "unique/visitor_id";
const ROLLUP_SUM = "vercel_analytics_pageview_count_sum";
const ROLLUP_UNIQUE = "vercel_analytics_pageview_count_unique_visitor_id";
const PRODUCTION_FILTER = "environment eq 'production'";

const countryNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["pt-PT"], { type: "region" })
    : null;

const deviceLabels = {
  mobile: "Mobile",
  desktop: "Desktop",
  tablet: "Tablet",
  unknown: "Desconhecido",
};

function getConfig() {
  const token = process.env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const days = Math.max(1, Math.min(90, Number(process.env.VERCEL_ANALYTICS_DAYS) || 7));

  return { token, teamId, projectId, days };
}

function formatCountry(code) {
  const normalized = String(code ?? "").trim().toUpperCase();
  if (!normalized || normalized === "UNKNOWN") return "Desconhecido";
  return countryNames?.of(normalized) ?? normalized;
}

function formatDevice(type) {
  const key = String(type ?? "").trim().toLowerCase();
  return deviceLabels[key] ?? (key || "Desconhecido");
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function pickRollupValue(row, rollupColumn) {
  if (!row || typeof row !== "object") return 0;
  if (rollupColumn && row[rollupColumn] != null) return toNumber(row[rollupColumn]);
  for (const [key, value] of Object.entries(row)) {
    if (key.includes("analytics_pageview") && typeof value === "number") {
      return value;
    }
  }
  return 0;
}

function parseGroupedRows(response, dimension, rollupColumn = ROLLUP_SUM) {
  const totals = new Map();

  for (const row of response.summary ?? []) {
    const key = String(row[dimension] ?? "").trim();
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + pickRollupValue(row, rollupColumn));
  }

  if (totals.size === 0) {
    for (const row of response.data ?? []) {
      const key = String(row[dimension] ?? "").trim();
      if (!key) continue;
      totals.set(key, (totals.get(key) ?? 0) + pickRollupValue(row, rollupColumn));
    }
  }

  return [...totals.entries()]
    .map(([key, pageviews]) => ({
      [dimension]: key,
      pageviews,
      ...(dimension === "country"
        ? { country_code: key, country_name: formatCountry(key) }
        : {}),
      ...(dimension === "device_type"
        ? { device_type: key, device_label: formatDevice(key) }
        : {}),
    }))
    .sort((a, b) => b.pageviews - a.pageviews);
}

function parseDailySeries(response, rollupColumn = ROLLUP_SUM) {
  const byDay = new Map();

  for (const row of response.data ?? []) {
    const timestamp = String(row.timestamp ?? "").trim();
    if (!timestamp) continue;
    const day = timestamp.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + pickRollupValue(row, rollupColumn));
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pageviews]) => ({ date, pageviews }));
}

async function queryMetrics({
  token,
  teamId,
  projectId,
  startTime,
  endTime,
  groupBy,
  limit,
  aggregation = AGGREGATION_SUM,
}) {
  const rollupColumn =
    aggregation === AGGREGATION_UNIQUE ? ROLLUP_UNIQUE : ROLLUP_SUM;

  const body = {
    scope: {
      type: "project",
      ownerId: teamId,
      projectIds: [projectId],
    },
    metric: METRIC,
    aggregation,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    granularity: { days: 1 },
    filter: PRODUCTION_FILTER,
    ...(groupBy?.length
      ? { groupBy, limit: limit ?? 20, orderBy: rollupColumn, orderDirection: "desc" }
      : {}),
  };

  const url = new URL("/v2/observability/query", API_BASE);
  url.searchParams.set("teamId", teamId);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Vercel metrics API (${res.status})`;
    throw new Error(message);
  }

  return payload;
}

function extractTotal(response, rollupColumn) {
  const summaryTotal = pickRollupValue(response.summary?.[0], rollupColumn);
  if (summaryTotal > 0) return summaryTotal;

  return (response.data ?? []).reduce(
    (sum, row) => sum + pickRollupValue(row, rollupColumn),
    0,
  );
}

export async function fetchVercelAnalytics() {
  const { token, teamId, projectId, days } = getConfig();

  if (!token || !teamId || !projectId) {
    return {
      configured: false,
      message:
        "Tráfego Vercel: configure VERCEL_ACCESS_TOKEN (ou VERCEL_TOKEN), VERCEL_TEAM_ID e VERCEL_PROJECT_ID nas variáveis de ambiente do projecto.",
    };
  }

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const [totals, uniqueVisitors, byCountry, byPath, byDevice] = await Promise.all([
      queryMetrics({ token, teamId, projectId, startTime, endTime }),
      queryMetrics({
        token,
        teamId,
        projectId,
        startTime,
        endTime,
        aggregation: AGGREGATION_UNIQUE,
      }),
      queryMetrics({
        token,
        teamId,
        projectId,
        startTime,
        endTime,
        groupBy: ["country"],
        limit: 20,
      }),
      queryMetrics({
        token,
        teamId,
        projectId,
        startTime,
        endTime,
        groupBy: ["request_path"],
        limit: 10,
      }),
      queryMetrics({
        token,
        teamId,
        projectId,
        startTime,
        endTime,
        groupBy: ["device_type"],
        limit: 10,
      }),
    ]);

    const countries = parseGroupedRows(byCountry, "country");
    const topPages = parseGroupedRows(byPath, "request_path").map((row) => ({
      path: row.request_path,
      pageviews: row.pageviews,
    }));
    const devices = parseGroupedRows(byDevice, "device_type").map((row) => ({
      device_type: row.device_type,
      device_label: row.device_label,
      pageviews: row.pageviews,
    }));
    const daily = parseDailySeries(totals);
    const daily_visitors = parseDailySeries(uniqueVisitors, ROLLUP_UNIQUE);

    return {
      configured: true,
      period: {
        days,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        label: `Últimos ${days} dias (produção)`,
      },
      pageviews: extractTotal(totals, ROLLUP_SUM),
      unique_visitors: extractTotal(uniqueVisitors, ROLLUP_UNIQUE),
      daily,
      daily_visitors,
      countries,
      top_pages: topPages,
      devices,
    };
  } catch (err) {
    return {
      configured: true,
      period: {
        days,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        label: `Últimos ${days} dias (produção)`,
      },
      error: err instanceof Error ? err.message : "Falha ao obter métricas Vercel.",
    };
  }
}
