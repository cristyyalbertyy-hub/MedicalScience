/** Student progress dashboard — edit URL here only. */
const STUDENT_PROGRESS_URL = "https://progress-azure-five.vercel.app/";
/** Tomato Time Pomodoro app — edit URL here only. */
const TOMATO_TIME_URL = "https://tomato-time-rho.vercel.app/";

const CURRENCY_STORAGE_KEY = "studio9-medical-currency-v2";
const EUR_USD_FALLBACK = 1.08;

/** @type {"eur"|"usd"} */
let pricingCurrency = "usd";
/** @type {number|null} */
let eurUsdRate = null;

/**
 * Ready-made interactive packages — edit titles, URLs and status here.
 * status: "live" (needs url) | "soon"
 */
const READY_PACKAGES = [
  {
    id: "human-anatomy-1",
    number: "01",
    title: "Human Anatomy I",
    description:
      "Skeletal, muscular and nervous systems — the base for clinical study and dissection-ready terminology.",
    url: "https://human-anatomy1.vercel.app/",
    status: "live",
  },
  {
    id: "medical-biology",
    number: "02",
    title: "Medical Biology",
    description:
      "Cell biology, tissues, metabolism and the core foundations for health-sciences study.",
    url: "https://biology-genetics.vercel.app/",
    status: "live",
  },
  {
    id: "genetics",
    number: "03",
    title: "Genetics",
    description:
      "Mendelian inheritance, mutations, pedigrees and clinical genetics scenarios.",
    url: "https://medica-genetics.vercel.app/",
    status: "live",
  },
  {
    id: "physics",
    number: "04",
    title: "Physics",
    description:
      "Physical principles applied to the human body, imaging, forces and measurement in medicine.",
    url: "https://physics-tau-five.vercel.app/",
    status: "live",
  },
  {
    id: "information-processing",
    number: "05",
    title: "Information Processing",
    description:
      "Data literacy and digital tools for evidence-based study — classes, videos, podcasts and questions.",
    url: "https://informatics-theta.vercel.app/",
    status: "live",
  },
  {
    id: "statistics",
    number: "06",
    title: "Statistics",
    description:
      "Descriptive and inferential statistics for health sciences.",
    url: "https://statistics-nu-eight.vercel.app/",
    status: "live",
  },
  {
    id: "histology-embryology",
    number: "07",
    title: "Histology and Embryology",
    description:
      "Microscopy, fundamental tissues, early development, and correlation with anatomy.",
    url: "https://histology-embryology.vercel.app/",
    status: "live",
  },
  {
    id: "chemistry-introductory-biochemistry",
    number: "08",
    title: "Chemistry and Introductory Biochemistry",
    description:
      "Atomic structure, chemical bonding, proteins, enzymes, metabolism and the molecular foundations for health sciences.",
    url: "https://chemistry-roan.vercel.app/",
    status: "live",
  },
  {
    id: "history-of-medicine",
    number: "09",
    title: "History of Medicine",
    description:
      "Key discoveries, figures and turning points that shaped modern health sciences.",
    url: "https://history-medicine.vercel.app/",
    status: "live",
  },
  {
    id: "moral-philosophy",
    number: "10",
    title: "Moral Philosophy",
    description:
      "Ethical frameworks for consent, confidentiality, end-of-life care and professional conduct.",
    url: "https://moral-philosophy.vercel.app/",
    status: "live",
  },
  {
    id: "health-technology-assessments",
    number: "11",
    title: "Health Technology Assessments",
    description:
      "HTA methods, evidence appraisal and decision-making for drugs, devices and health interventions.",
    url: "https://health-technology-assessments.vercel.app/",
    status: "live",
  },
  {
    id: "italian-health-system",
    number: "12",
    title: "Italian Health System",
    description:
      "Structure, funding and organisation of healthcare in Italy — regions, services and policy context.",
    url: "https://italian-health-system.vercel.app/",
    status: "live",
  },
];

const SOON_PACKAGES = [
  {
    id: "human-anatomy-2",
    number: "13",
    title: "Human Anatomy II",
    description:
      "Cardiovascular, respiratory, digestive, urinary and reproductive systems in depth.",
    status: "soon",
  },
  {
    id: "physiology-2",
    number: "14",
    title: "Physiology II",
    description:
      "Renal, digestive, endocrine and reproductive physiology for clinical reasoning.",
    status: "soon",
  },
  {
    id: "immunology",
    number: "15",
    title: "Immunology",
    description:
      "Adaptive immunity, vaccines, hypersensitivity, autoimmunity and clinical immunology.",
    status: "soon",
  },
  {
    id: "microbiology",
    number: "16",
    title: "Microbiology",
    description:
      "Bacteria, viruses, fungi and parasites — pathogenesis, diagnosis and treatment basics.",
    status: "soon",
  },
  {
    id: "pharmacology-1",
    number: "17",
    title: "Pharmacology I",
    description:
      "Pharmacokinetics, pharmacodynamics, and core drug classes for the nervous and cardiovascular systems.",
    status: "soon",
  },
  {
    id: "epidemiology",
    number: "18",
    title: "Epidemiology",
    description:
      "Frequency measures, study designs, screening and population health reasoning.",
    status: "soon",
  },
  {
    id: "economics-health-policy",
    number: "19",
    title: "Economics and Health Policy",
    description:
      "Health systems, funding models, and the social and political context of medicine.",
    status: "soon",
  },
  {
    id: "systemic-pathology",
    number: "20",
    title: "Systemic Pathology",
    description:
      "Organ-system pathology spanning heart, lung, kidney, liver and related clinical patterns.",
    status: "soon",
  },
  {
    id: "clinical-medicine-1",
    number: "21",
    title: "Clinical Medicine I",
    description:
      "Basic semiology, common symptoms and introductory clinical reasoning.",
    status: "soon",
  },
  {
    id: "clinical-medicine-2",
    number: "22",
    title: "Clinical Medicine II",
    description:
      "Common conditions such as hypertension, diabetes, asthma and major infections.",
    status: "soon",
  },
];

const ALL_PACKAGES = [...READY_PACKAGES, ...SOON_PACKAGES];

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

/** @type {Awaited<ReturnType<typeof loadPackageCatalog>> | null} */
let packageCatalog = null;
/** @type {Awaited<ReturnType<typeof loadProgressManifest>> | null} */
let progressManifest = null;

async function loadPackageCatalog() {
  if (packageCatalog) return packageCatalog;
  try {
    const response = await fetch("/packages/catalog.json");
    if (response.ok) packageCatalog = await response.json();
  } catch {
    /* ignore */
  }
  return packageCatalog ?? {};
}

async function loadProgressManifest() {
  if (progressManifest) return progressManifest;
  try {
    const response = await fetch("/packages/progress-manifest.json");
    if (response.ok) progressManifest = await response.json();
  } catch {
    /* ignore */
  }
  return progressManifest ?? {};
}

function isPurchasablePackage(id, catalog) {
  return (catalog.purchasablePackageIds ?? []).includes(id);
}

function isFreePackage(id, catalog) {
  return (catalog.freePackageIds ?? []).includes(id);
}

function sitePath(segment) {
  const page = document.body.dataset.page;
  return page === "home" ? segment : `../${segment}`;
}

function packageText(key, fallback = "") {
  if (window.SiteI18n) {
    const value = SiteI18n.siteT(SiteI18n.getSiteLang(), key);
    if (value !== key) return value;
  }
  return fallback || key;
}

function renderResourceBadges(resources, resourceTypes = {}) {
  return (resources ?? [])
    .map((code) => {
      const label = packageText(`packagesUi.resource.${code}`, resourceTypes[code] ?? code);
      return `<span class="package-resource-badge" title="${escapeHtml(label)}">${code}</span>`;
    })
    .join("");
}

function renderSyllabusBlock(pkg, catalog, manifest) {
  const isSoon = pkg.status !== "live" || !pkg.url;
  const purchasable = isPurchasablePackage(pkg.id, catalog);
  const topics = manifest?.packages?.[pkg.id]?.topics ?? [];
  const summaryLabel = packageText("packagesUi.viewContents");

  if (!topics.length) {
    if (!isSoon) return "";
    return `
      <details class="package-syllabus">
        <summary>${escapeHtml(summaryLabel)}</summary>
        <p class="package-syllabus-empty">${escapeHtml(packageText("packagesUi.syllabusPending"))}</p>
      </details>`;
  }

  const note = purchasable
    ? packageText("packagesUi.syllabusNotePurchase")
    : packageText("packagesUi.syllabusNoteBrowse");

  const list = topics
    .map(
      (topic) => `
        <li class="package-syllabus-topic">
          <span class="package-syllabus-label">${escapeHtml(topic.label)}</span>
          <span class="package-syllabus-badges">${renderResourceBadges(topic.resources, manifest.resourceTypes)}</span>
        </li>`,
    )
    .join("");

  return `
    <details class="package-syllabus">
      <summary>${escapeHtml(summaryLabel)} <span class="package-syllabus-count">${topics.length}</span></summary>
      <p class="package-syllabus-note">${escapeHtml(note)}</p>
      <ul class="package-syllabus-list">${list}</ul>
      <p class="package-syllabus-legend">${escapeHtml(packageText("packagesUi.resourceLegend"))}</p>
    </details>`;
}

function renderPackageCard(pkg, { compact = false, catalog = {}, manifest = {} } = {}) {
  const isSoon = pkg.status !== "live" || !pkg.url;
  const free = isFreePackage(pkg.id, catalog);
  const purchasable = isPurchasablePackage(pkg.id, catalog);
  const pricingConfig = getPricingConfig(catalog);
  const topicCount = manifest?.packages?.[pkg.id]?.topics?.length ?? 0;
  const tierId = topicCount > 0 ? resolvePackageTier(topicCount, pricingConfig) : null;

  let statusClass = "is-soon";
  let statusLabel = packageText("packagesUi.comingSoon");
  let action;

  if (isSoon) {
    action = `<span class="package-soon">${escapeHtml(packageText("packagesUi.launchingSoon"))}</span>`;
  } else if (purchasable) {
    statusClass = "is-live is-pilot-purchase";
    statusLabel = packageText("packagesUi.purchasable");
    action = `<a class="btn btn-pilot-purchase${compact ? " btn-secondary" : ""}" href="${escapeHtml(sitePath("conta/"))}">${escapeHtml(packageText("packagesUi.openViaAccount"))}</a>`;
  } else {
    statusClass = "is-live is-open-access";
    statusLabel = free
      ? packageText("packagesUi.live")
      : packageText("packagesUi.openAccess");
    action = `<a class="btn btn-open-access${compact ? " btn-secondary" : ""}" href="${escapeHtml(pkg.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(packageText("packagesUi.openApp"))}</a>`;
  }

  const title = packageText(`pkg.${pkg.id}.title`, pkg.title);
  const description = packageText(`pkg.${pkg.id}.description`, pkg.description);
  const syllabus = renderSyllabusBlock(pkg, catalog, manifest);
  const tierBadge =
    tierId != null
      ? `<div class="package-tier-row">${renderTierPriceBadge(tierId, pricingConfig, { free, topicCount })}</div>`
      : "";

  return `
    <article class="package-card ${statusClass}${compact ? " is-compact" : ""}${tierId ? ` has-tier-${tierId}` : ""}" id="package-${escapeHtml(pkg.id)}">
      <div class="package-card-top">
        <span class="package-number">${escapeHtml(pkg.number)}</span>
        <span class="package-status">${escapeHtml(statusLabel)}</span>
      </div>
      ${tierBadge}
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${syllabus}
      <div class="package-card-action">${action}</div>
    </article>`;
}

function renderPackages(root, catalog = packageCatalog ?? {}, manifest = progressManifest ?? {}) {
  if (!root) return;
  const compact = root.dataset.packagesCompact === "true";
  root.innerHTML = ALL_PACKAGES.map((pkg) =>
    renderPackageCard(pkg, { compact, catalog, manifest }),
  ).join("");
}

function initTomatoTimeLinks() {
  const navToggle = document.querySelector(".nav-toggle");
  const page = document.body.dataset.page;
  const landingHref =
    page === "tomatoTime" ? "./" : page === "home" ? "tomato-time/" : "../tomato-time/";

  document.querySelectorAll("[data-tomato-time]").forEach((link) => {
    link.href = landingHref;
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("[data-tomato-time-app]").forEach((link) => {
    link.href = TOMATO_TIME_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function initStudentProgressLinks() {
  const navToggle = document.querySelector(".nav-toggle");

  document.querySelectorAll("[data-student-progress]").forEach((link) => {
    link.href = STUDENT_PROGRESS_URL;
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function initNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const activePage = document.body.dataset.page;

  navToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === activePage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }

    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function pricingLocale() {
  const lang = window.SiteI18n?.getSiteLang?.() ?? "en";
  if (lang === "en") return "en-GB";
  if (lang === "pt") return "pt-PT";
  return lang;
}

function formatPlanAmount(amount, currency) {
  const hasFraction = Math.abs(amount % 1) > 0.001;
  const digits = hasFraction ? 2 : 0;
  if (currency === "usd") {
    const value = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: 2,
    }).format(amount);
    return `$${value}`;
  }
  const locale = pricingLocale();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  }).format(amount);
}

function planAmount(amountUsd, currency) {
  if (currency === "usd") return amountUsd;
  const rate = eurUsdRate ?? EUR_USD_FALLBACK;
  return Math.round((amountUsd / rate) * 100) / 100;
}

function getPricingConfig(catalog = packageCatalog ?? {}) {
  return (
    catalog.pricing ?? {
      tiers: {
        s: { label: "Small", minTopics: 1, maxTopics: 9, priceUsd: 9.99 },
        m: { label: "Medium", minTopics: 10, maxTopics: 19, priceUsd: 11.99 },
        l: { label: "Large", minTopics: 20, maxTopics: null, priceUsd: 14.99 },
      },
      volumeDiscounts: [
        { minPackages: 4, percentOff: 10 },
        { minPackages: 8, percentOff: 15 },
        { minPackages: 12, percentOff: 20 },
        { minPackages: 22, percentOff: 30 },
      ],
    }
  );
}

function resolvePackageTier(topicCount, pricingConfig = getPricingConfig()) {
  const tiers = pricingConfig.tiers ?? {};
  if (topicCount >= (tiers.l?.minTopics ?? 20)) return "l";
  if (topicCount >= (tiers.m?.minTopics ?? 10)) return "m";
  return "s";
}

function tierPriceUsd(tierId, pricingConfig = getPricingConfig()) {
  return pricingConfig.tiers?.[tierId]?.priceUsd ?? 0;
}

function formatTierTopicsRange(tierId, pricingConfig = getPricingConfig()) {
  const tier = pricingConfig.tiers?.[tierId];
  if (!tier) return "";
  const min = tier.minTopics ?? 1;
  const max = tier.maxTopics;
  if (max == null) {
    return packageText("packagesUi.tierTopicsPlus", `${min}+ topics`).replace("{min}", String(min));
  }
  return packageText("packagesUi.tierTopicsRange", `${min}–${max} topics`)
    .replace("{min}", String(min))
    .replace("{max}", String(max));
}

function renderTierPriceBadge(tierId, pricingConfig, { free = false, topicCount = null } = {}) {
  if (free) {
    return `<span class="package-tier-price package-tier-price--s">${escapeHtml(packageText("packagesUi.priceFree", "Free"))}</span>`;
  }

  const tierKey = tierId === "s" || tierId === "m" || tierId === "l" ? tierId : "s";
  const letter = tierKey.toUpperCase();
  const usd = tierPriceUsd(tierKey, pricingConfig);
  const formatted = formatPlanAmount(planAmount(usd, pricingCurrency), pricingCurrency);
  const label = packageText(`packagesUi.tier${letter}`, letter);
  const topics =
    topicCount != null
      ? packageText("packagesUi.tierTopicCount", `${topicCount} topics`).replace(
          "{count}",
          String(topicCount),
        )
      : formatTierTopicsRange(tierKey, pricingConfig);

  return `<span class="package-tier-price package-tier-price--${tierKey}" title="${escapeHtml(`${label} · ${topics}`)}"><span class="package-tier-letter" aria-hidden="true">${letter}</span><span class="package-tier-amount">${escapeHtml(formatted)}</span></span>`;
}

function renderPlanPrices() {
  document.querySelectorAll("[data-tier-price-usd]").forEach((el) => {
    const usd = Number(el.dataset.tierPriceUsd);
    if (!Number.isFinite(usd)) return;
    el.textContent = formatPlanAmount(planAmount(usd, pricingCurrency), pricingCurrency);
  });

  document.querySelectorAll(".plan-price[data-price-usd]").forEach((el) => {
    const mainUsd = Number(el.dataset.priceUsd);
    const eachUsd = el.dataset.priceEachUsd ? Number(el.dataset.priceEachUsd) : null;
    const subType = el.dataset.priceSub;
    const main = formatPlanAmount(planAmount(mainUsd, pricingCurrency), pricingCurrency);

    if (!eachUsd || !subType) {
      el.innerHTML = main;
      return;
    }

    const each = formatPlanAmount(planAmount(eachUsd, pricingCurrency), pricingCurrency);
    const subLabel =
      subType === "perModule"
        ? packageText("precos.pricing.perModuleLabel")
        : packageText("precos.pricing.eachLabel");
    el.innerHTML = `${main} <span>${each} ${subLabel}</span>`;
  });
}

async function ensureUsdRate() {
  if (eurUsdRate != null) return eurUsdRate;
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD");
    if (!response.ok) throw new Error("rate unavailable");
    const data = await response.json();
    eurUsdRate = data.rates?.USD ?? EUR_USD_FALLBACK;
  } catch {
    eurUsdRate = EUR_USD_FALLBACK;
  }
  return eurUsdRate;
}

function setPricingCurrency(next) {
  pricingCurrency = next;
  document.querySelectorAll("[data-currency]").forEach((btn) => {
    const active = btn.dataset.currency === next;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

async function applyPricingCurrency(next) {
  setPricingCurrency(next);
  if (next === "eur") await ensureUsdRate();
  renderPlanPrices();
}

function initPricingCurrency() {
  const selector = document.querySelector(".currency-selector");
  if (!selector) return;

  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored === "eur" || stored === "usd") pricingCurrency = stored;
  } catch {
    /* ignore */
  }

  selector.querySelectorAll("[data-currency]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.currency;
      if (next === "eur" || next === "usd") applyPricingCurrency(next);
    });
  });

  applyPricingCurrency(pricingCurrency);
}

function initPricingPlans(catalog = packageCatalog ?? {}) {
  const plans = catalog.plans ?? {};
  document.querySelectorAll("[data-plan]").forEach((planEl) => {
    const planId = planEl.dataset.plan;
    const config = plans[planId];
    if (!config || config.enabled !== false) return;

    planEl.classList.add("is-disabled");
    const cta = planEl.querySelector(".btn");
    if (!cta) return;
    cta.classList.remove("btn-primary", "btn-secondary");
    cta.classList.add("btn-disabled");
    cta.removeAttribute("href");
    cta.setAttribute("aria-disabled", "true");
    cta.textContent = packageText("precos.pricing.planSoon");
  });
}

async function init() {
  if (window.SiteI18n) {
    SiteI18n.initSiteLanguage();
    document.addEventListener("site:langchange", () => {
      document.querySelectorAll("[data-packages-root]").forEach((root) => {
        renderPackages(root, packageCatalog ?? {}, progressManifest ?? {});
      });
      initStudentProgressLinks();
      initTomatoTimeLinks();
      renderPlanPrices();
      initPricingPlans(packageCatalog ?? {});
    });
  }

  const [catalog, manifest] = await Promise.all([loadPackageCatalog(), loadProgressManifest()]);
  document.querySelectorAll("[data-packages-root]").forEach((root) => {
    renderPackages(root, catalog, manifest);
  });
  initPricingPlans(catalog);
  initStudentProgressLinks();
  initTomatoTimeLinks();
  initNavigation();
  initPricingCurrency();
}

document.addEventListener("DOMContentLoaded", init);
