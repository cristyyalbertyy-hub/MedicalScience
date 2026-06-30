/** Student progress dashboard — edit URL here only. */
const STUDENT_PROGRESS_URL = "https://progress-azure-five.vercel.app/";

const CURRENCY_STORAGE_KEY = "studio9-medical-currency";
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
      "Cell biology, tissues, metabolism and the foundations you need before clinical years.",
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

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

function packageText(key) {
  if (window.SiteI18n) {
    return SiteI18n.siteT(SiteI18n.getSiteLang(), key);
  }
  return key;
}

function renderPackageCard(pkg, { compact = false } = {}) {
  const isLive = pkg.status === "live" && pkg.url;
  const statusClass = isLive ? "is-live" : "is-soon";
  const statusLabel = isLive
    ? packageText("packagesUi.live")
    : packageText("packagesUi.comingSoon");
  const title = packageText(`pkg.${pkg.id}.title`);
  const description = packageText(`pkg.${pkg.id}.description`);
  const action = isLive
    ? `<a class="btn ${compact ? "btn-secondary" : "btn-primary"}" href="${escapeHtml(pkg.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(packageText("packagesUi.openApp"))}</a>`
    : `<span class="package-soon">${escapeHtml(packageText("packagesUi.launchingSoon"))}</span>`;

  return `
    <article class="package-card ${statusClass}${compact ? " is-compact" : ""}" id="package-${escapeHtml(pkg.id)}">
      <div class="package-card-top">
        <span class="package-number">${escapeHtml(pkg.number)}</span>
        <span class="package-status">${escapeHtml(statusLabel)}</span>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="package-card-action">${action}</div>
    </article>`;
}

function renderPackages(root) {
  if (!root) return;
  const compact = root.dataset.packagesCompact === "true";
  root.innerHTML = READY_PACKAGES.map((pkg) => renderPackageCard(pkg, { compact })).join("");
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
  return new Intl.NumberFormat(pricingLocale(), {
    style: "currency",
    currency: currency === "usd" ? "USD" : "EUR",
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

function renderPlanPrices() {
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

function init() {
  if (window.SiteI18n) {
    SiteI18n.initSiteLanguage();
    document.addEventListener("site:langchange", () => {
      document.querySelectorAll("[data-packages-root]").forEach(renderPackages);
      initStudentProgressLinks();
      renderPlanPrices();
    });
  }

  document.querySelectorAll("[data-packages-root]").forEach(renderPackages);
  initStudentProgressLinks();
  initNavigation();
  initPricingCurrency();
}

document.addEventListener("DOMContentLoaded", init);
