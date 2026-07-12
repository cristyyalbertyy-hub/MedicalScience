/** Student progress dashboard — edit URL here only. */
const STUDENT_PROGRESS_URL = "https://progress-azure-five.vercel.app/";
/** Tomato Time Pomodoro app — edit URL here only. */
const TOMATO_TIME_URL = "https://tomato-time-rho.vercel.app/";

const CURRENCY_STORAGE_KEY = "studio9-medical-currency-v2";
const PURCHASE_TERMS_KEY = "studio9.purchaseTermsAccepted";
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

/** Family groups (H&E, Chem/Biochem) render before this curriculum slot. */
const PACKAGE_GROUPS_BEFORE_ID = "history-of-medicine";

const PACKAGE_GROUP_NUMBERS = {
  histology: "07a",
  embryology: "07b",
  "histology-embryology": "07",
  chemistry: "08a",
  "introductory-biochemistry": "08b",
  "chemistry-introductory-biochemistry": "08",
};

const SPLIT_PACKAGE_FALLBACK = {
  histology: {
    title: "Histology",
    description:
      "Cytology and fundamental tissues — epithelia, connective tissue, muscle and nervous tissue.",
    url: "https://histology-embryology.vercel.app/",
    parentApp: "histology-embryology",
  },
  embryology: {
    title: "Embryology",
    description:
      "Gametogenesis, early development, organogenesis and correlation with anatomy.",
    url: "https://histology-embryology.vercel.app/",
    parentApp: "histology-embryology",
  },
  "histology-embryology": {
    title: "Histology and Embryology",
    description:
      "Microscopy, fundamental tissues, early development, and correlation with anatomy.",
    url: "https://histology-embryology.vercel.app/",
    bundleOf: ["histology", "embryology"],
  },
  chemistry: {
    title: "Chemistry",
    description: "General and organic chemistry — structure, bonding, equilibrium and functional groups.",
    url: "https://chemistry-roan.vercel.app/",
    parentApp: "chemistry-introductory-biochemistry",
  },
  "introductory-biochemistry": {
    title: "Introductory Biochemistry",
    description:
      "Carbohydrates, proteins, lipids and nucleotides — the molecular foundations for health sciences.",
    url: "https://chemistry-roan.vercel.app/",
    parentApp: "chemistry-introductory-biochemistry",
  },
  "chemistry-introductory-biochemistry": {
    title: "Chemistry and Introductory Biochemistry",
    description:
      "Atomic structure, chemical bonding, proteins, enzymes, metabolism and the molecular foundations for health sciences.",
    url: "https://chemistry-roan.vercel.app/",
    bundleOf: ["chemistry", "introductory-biochemistry"],
  },
};

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

function getCheckoutUrl(pkgId, catalog) {
  return catalog.packageMeta?.[pkgId]?.checkoutUrl ?? null;
}

function ensureLemonSqueezyScript() {
  if (document.querySelector("script[data-lemon-squeezy]")) return;
  const script = document.createElement("script");
  script.src = "https://assets.lemonsqueezy.com/lemon.js";
  script.defer = true;
  script.dataset.lemonSqueezy = "";
  document.head.appendChild(script);
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

function getPackageChapterCount(id, catalog = packageCatalog ?? {}) {
  for (const access of Object.values(catalog?.packageAccess ?? {})) {
    const chapters = access.chaptersByPackageId?.[id];
    if (chapters) return chapters.length;
  }
  return 0;
}

function isBundlePackage(id, catalog = packageCatalog ?? {}) {
  const bundleOf = catalog?.packageMeta?.[id]?.bundleOf ?? SPLIT_PACKAGE_FALLBACK[id]?.bundleOf;
  return Array.isArray(bundleOf) && bundleOf.length > 0;
}

function buildCatalogPackage(id, catalog = packageCatalog ?? {}) {
  const meta = catalog?.packageMeta?.[id] ?? {};
  const fallback = SPLIT_PACKAGE_FALLBACK[id] ?? {};
  const parentApp = meta.parentApp ?? fallback.parentApp ?? null;
  return {
    id,
    number: PACKAGE_GROUP_NUMBERS[id] ?? "",
    title: meta.title ?? fallback.title ?? id,
    description: fallback.description ?? "",
    url: meta.url ?? fallback.url ?? "",
    status: meta.url || fallback.url ? "live" : "soon",
    parentApp,
    isBundle: isBundlePackage(id, catalog),
  };
}

function renderPartOfAppHint(pkg, catalog = packageCatalog ?? {}) {
  if (!pkg.parentApp || pkg.isBundle) return "";
  const parentTitle = packageText(`pkg.${pkg.parentApp}.title`, pkg.parentApp);
  const chapterCount = getPackageChapterCount(pkg.id, catalog);
  const chaptersLabel = packageText("packagesUi.chapterCount", "{count} chapters").replace(
    "{count}",
    String(chapterCount),
  );
  const hint = packageText("packagesUi.partOfApp", "Part of the {app} app · {chapters}")
    .replace("{app}", parentTitle)
    .replace("{chapters}", chaptersLabel);
  return `<p class="package-part-of">${escapeHtml(hint)}</p>`;
}

function renderPackageFamilyGroup(group, catalog = packageCatalog ?? {}, manifest = progressManifest ?? {}, { compact = false } = {}) {
  const title = packageText(group.titleKey ?? "", group.title ?? group.id ?? "");
  const cards = (group.packageIds ?? [])
    .map((id) => {
      const pkg = buildCatalogPackage(id, catalog);
      return renderPackageCard(pkg, { compact, catalog, manifest });
    })
    .join("");

  return `
    <section class="packages-family-group" aria-labelledby="family-${escapeHtml(group.id)}">
      <h2 class="packages-family-group__title" id="family-${escapeHtml(group.id)}">${escapeHtml(title)}</h2>
      <div class="packages-family-group__grid">${cards}</div>
    </section>`;
}

function renderPackageCard(pkg, { compact = false, catalog = {}, manifest = {} } = {}) {
  const isBundle = pkg.isBundle ?? isBundlePackage(pkg.id, catalog);
  const isSoon = pkg.status !== "live" || !pkg.url;
  const free = isFreePackage(pkg.id, catalog);
  const purchasable = isPurchasablePackage(pkg.id, catalog);
  const pricingConfig = getPricingConfig(catalog);
  const topicCount = manifest?.packages?.[pkg.id]?.topics?.length ?? 0;
  const tierId = topicCount > 0 ? resolvePackageTier(topicCount, pricingConfig) : null;
  const priceUsd = getPackagePriceUsd(pkg.id, catalog, topicCount);

  let statusClass = "is-soon";
  let statusLabel = packageText("packagesUi.comingSoon");
  let action;

  if (isSoon) {
    action = `<span class="package-soon">${escapeHtml(packageText("packagesUi.launchingSoon"))}</span>`;
  } else if (purchasable) {
    statusClass = "is-live is-pilot-purchase";
    statusLabel = packageText("packagesUi.purchasable");
    const title = packageText(`pkg.${pkg.id}.title`, pkg.title);
    const checkoutUrl = getCheckoutUrl(pkg.id, catalog);
    const buyLabel = packageText(
      `pkg.${pkg.id}.buyCta`,
      packageText("packagesUi.buyNow", `Buy ${title}`),
    );
    if (checkoutUrl) {
      action = `<a class="btn btn-pilot-purchase lemonsqueezy-button${compact ? " btn-secondary" : ""}" data-purchase-action href="${escapeHtml(checkoutUrl)}">${escapeHtml(buyLabel)}</a>`;
    } else {
      action = `<a class="btn btn-pilot-purchase${compact ? " btn-secondary" : ""}" data-purchase-action href="${escapeHtml(sitePath("conta/"))}">${escapeHtml(packageText("packagesUi.openViaAccount"))}</a>`;
    }
  } else {
    statusClass = free ? "is-live is-open-access is-free-module" : "is-live is-open-access";
    statusLabel = free
      ? packageText("packagesUi.priceFree", "Free")
      : packageText("packagesUi.openAccess");
    const openLabel = free
      ? packageText(`pkg.${pkg.id}.freeCta`, packageText("packagesUi.tryFree", "Try free"))
      : packageText("packagesUi.openApp");
    action = `<a class="btn btn-open-access${compact ? " btn-secondary" : ""}" href="${escapeHtml(pkg.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(openLabel)}</a>`;
  }

  if (isBundle) {
    statusClass += " is-bundle";
    statusLabel = packageText("packagesUi.bundleComplete", "Complete bundle");
  } else if (pkg.parentApp) {
    statusClass += " is-part";
  }

  const cardTitle = packageText(`pkg.${pkg.id}.title`, pkg.title);
  const description = packageText(`pkg.${pkg.id}.description`, pkg.description);
  const partHint = renderPartOfAppHint({ ...pkg, isBundle }, catalog);
  const syllabus = renderSyllabusBlock(pkg, catalog, manifest);
  const tierBadge =
    tierId != null
      ? `<div class="package-tier-row">${renderTierPriceBadge(tierId, pricingConfig, { free, topicCount, priceUsd })}</div>`
      : "";

  return `
    <article class="package-card ${statusClass}${compact ? " is-compact" : ""}${tierId ? ` has-tier-${tierId}` : ""}" id="package-${escapeHtml(pkg.id)}">
      <div class="package-card-top">
        <span class="package-number">${escapeHtml(pkg.number)}</span>
        <span class="package-status">${escapeHtml(statusLabel)}</span>
      </div>
      ${tierBadge}
      <h3>${escapeHtml(cardTitle)}</h3>
      ${partHint}
      <p>${escapeHtml(description)}</p>
      ${syllabus}
      <div class="package-card-action">${action}</div>
    </article>`;
}

function renderPackages(root, catalog = packageCatalog ?? {}, manifest = progressManifest ?? {}) {
  if (!root) return;
  const compact = root.dataset.packagesCompact === "true";
  const groups = catalog?.pricingTableGroups ?? [];
  const parts = [];

  for (const pkg of ALL_PACKAGES) {
    if (pkg.id === PACKAGE_GROUPS_BEFORE_ID) {
      for (const group of groups) {
        parts.push(renderPackageFamilyGroup(group, catalog, manifest, { compact }));
      }
    }
    parts.push(renderPackageCard(pkg, { compact, catalog, manifest }));
  }

  root.innerHTML = parts.join("");
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
      minPriceUsd: 5.99,
      maxPriceUsd: 18.99,
      tiers: {
        s: { label: "Small", minTopics: 1, maxTopics: 9, priceFromUsd: 5.99, priceToUsd: 9.99, priceUsd: 9.99 },
        m: { label: "Medium", minTopics: 10, maxTopics: 19, priceFromUsd: 9.99, priceToUsd: 12.99, priceUsd: 11.99 },
        l: { label: "Large", minTopics: 20, maxTopics: null, priceFromUsd: 13.99, priceToUsd: 18.99, priceUsd: 14.99 },
      },
      volumeDiscounts: [
        { minPackages: 3, percentOff: 5 },
        { minPackages: 5, percentOff: 10 },
        { minPackages: 8, percentOff: 12 },
        { minPackages: 15, percentOff: 15 },
        { minPackages: 22, percentOff: 20 },
      ],
    }
  );
}

function getPackagePriceUsd(pkgId, catalog = packageCatalog ?? {}, topicCount = 0) {
  const meta = catalog?.packageMeta?.[pkgId];
  if (meta?.priceUsd != null) return meta.priceUsd;
  const pricingConfig = getPricingConfig(catalog);
  const tierId = resolvePackageTier(topicCount, pricingConfig);
  return tierPriceUsd(tierId, pricingConfig);
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

function formatPriceRange(fromUsd, toUsd) {
  const from = formatPlanAmount(planAmount(fromUsd, pricingCurrency), pricingCurrency);
  const to = formatPlanAmount(planAmount(toUsd, pricingCurrency), pricingCurrency);
  return `${from} – ${to}`;
}

function renderTierPriceBadge(tierId, pricingConfig, { free = false, topicCount = null, priceUsd = null } = {}) {
  if (free) {
    return `<span class="package-tier-price package-tier-price--s">${escapeHtml(packageText("packagesUi.priceFree", "Free"))}</span>`;
  }

  const tierKey = tierId === "s" || tierId === "m" || tierId === "l" ? tierId : "s";
  const letter = tierKey.toUpperCase();
  const usd = priceUsd ?? tierPriceUsd(tierKey, pricingConfig);
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

  document.querySelectorAll("[data-tier-price-range]").forEach((el) => {
    const fromUsd = Number(el.dataset.tierPriceFromUsd);
    const toUsd = Number(el.dataset.tierPriceToUsd);
    if (!Number.isFinite(fromUsd) || !Number.isFinite(toUsd)) return;
    el.textContent = formatPriceRange(fromUsd, toUsd);
  });

  document.querySelectorAll("[data-module-price-table]").forEach((root) => {
    renderModulePriceTable(root, packageCatalog ?? {}, progressManifest ?? {});
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

function buildModulePriceRow(id, catalog, manifest) {
  const meta = catalog.packageMeta?.[id] ?? {};
  const topicCount = manifest?.packages?.[id]?.topics?.length ?? 0;
  const title = packageText(`pkg.${id}.title`, meta.title ?? id);
  const priceUsd = getPackagePriceUsd(id, catalog, topicCount);
  const price = formatPlanAmount(planAmount(priceUsd, pricingCurrency), pricingCurrency);
  const topics = packageText("packagesUi.tierTopicCount", `${topicCount} topics`).replace(
    "{count}",
    String(topicCount),
  );
  return { id, title, topics, price, topicCount };
}

function renderModulePriceTable(root, catalog = packageCatalog ?? {}, manifest = progressManifest ?? {}) {
  if (!root) return;
  const paidIds = catalog.paidPackageIds ?? [];
  const groups = catalog.pricingTableGroups ?? [];
  const groupedIds = new Set(groups.flatMap((group) => group.packageIds ?? []));
  const standaloneIds = paidIds.filter((id) => !groupedIds.has(id));

  const standaloneRows = standaloneIds
    .map((id) => buildModulePriceRow(id, catalog, manifest))
    .sort((a, b) => a.topicCount - b.topicCount || a.title.localeCompare(b.title));

  const moduleCol = packageText("precos.pricing.moduleTableModule", "Module");
  const topicsCol = packageText("precos.pricing.moduleTableTopics", "Topics");
  const priceCol = packageText("precos.pricing.moduleTablePrice", "Price");
  const bundleBadge = packageText("precos.pricing.moduleTableBundle", "Complete bundle");

  const renderDataRow = (row, { isBundle = false, isPart = false } = {}) => {
    const classes = [
      isBundle ? "module-price-table__bundle" : "",
      isPart ? "module-price-table__part" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const title = isBundle
      ? `${escapeHtml(row.title)} <span class="module-price-table__badge">${escapeHtml(bundleBadge)}</span>`
      : escapeHtml(row.title);
    return `
          <tr${classes ? ` class="${classes}"` : ""}>
            <td>${title}</td>
            <td>${escapeHtml(row.topics)}</td>
            <td>${escapeHtml(row.price)}</td>
          </tr>`;
  };

  const groupRows = groups
    .map((group) => {
      const groupLabel = packageText(
        group.titleKey ?? "",
        group.title ?? group.id ?? "",
      );
      const partRows = (group.packageIds ?? [])
        .filter((id) => id !== group.bundleId)
        .map((id) => renderDataRow(buildModulePriceRow(id, catalog, manifest), { isPart: true }))
        .join("");
      const bundleRow = group.bundleId
        ? renderDataRow(buildModulePriceRow(group.bundleId, catalog, manifest), { isBundle: true })
        : "";
      return `
        <tr class="module-price-table__group">
          <td colspan="3">${escapeHtml(groupLabel)}</td>
        </tr>
        ${partRows}
        ${bundleRow}`;
    })
    .join("");

  root.innerHTML = `
    <table class="module-price-table">
      <thead>
        <tr>
          <th scope="col">${escapeHtml(moduleCol)}</th>
          <th scope="col">${escapeHtml(topicsCol)}</th>
          <th scope="col">${escapeHtml(priceCol)}</th>
        </tr>
      </thead>
      <tbody>
        ${standaloneRows.map((row) => renderDataRow(row)).join("")}
        ${groupRows}
      </tbody>
    </table>`;
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

function isPurchaseTermsAccepted() {
  try {
    return localStorage.getItem(PURCHASE_TERMS_KEY) === "1";
  } catch {
    return false;
  }
}

function setPurchaseTermsAccepted(value) {
  try {
    if (value) localStorage.setItem(PURCHASE_TERMS_KEY, "1");
    else localStorage.removeItem(PURCHASE_TERMS_KEY);
  } catch {
    /* ignore */
  }
}

/** Dev/test helper: add ?terms=reset to the URL to clear stored acceptance. */
function maybeResetPurchaseTermsFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("terms") !== "reset") return;

    setPurchaseTermsAccepted(false);
    params.delete("terms");
    const query = params.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", cleanUrl);
    console.info("[Studio9] Purchase terms acceptance cleared (?terms=reset).");
  } catch {
    /* ignore */
  }
}

let purchaseTermsPendingLink = null;
let purchaseTermsClickBound = false;

function closePurchaseTermsModal() {
  const modal = document.querySelector("[data-purchase-terms-modal]");
  if (modal) modal.hidden = true;
  document.body.classList.remove("purchase-terms-modal-open");
  purchaseTermsPendingLink = null;
}

function ensurePurchaseTermsModal() {
  let modal = document.querySelector("[data-purchase-terms-modal]");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "purchase-terms-modal";
  modal.dataset.purchaseTermsModal = "";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="purchase-terms-modal__backdrop" data-purchase-terms-dismiss tabindex="-1"></div>
    <div class="purchase-terms-modal__panel" role="dialog" aria-modal="true" aria-labelledby="purchase-terms-modal-title">
      <h2 id="purchase-terms-modal-title" data-i18n="precos.terms.modalTitle">Before you purchase</h2>
      <label class="purchase-terms__label">
        <input type="checkbox" data-purchase-terms-modal-checkbox />
        <span data-i18n-html="precos.terms.labelHtml"></span>
      </label>
      <p class="purchase-terms__hint" data-i18n="precos.terms.hint"></p>
      <div class="purchase-terms-modal__actions">
        <button type="button" class="btn btn-secondary" data-purchase-terms-dismiss data-i18n="precos.terms.cancelCta">Cancel</button>
        <button type="button" class="btn btn-primary is-disabled" data-purchase-terms-confirm disabled data-i18n="precos.terms.confirmCta">Continue to purchase</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  refreshPurchaseTermsModalI18n();

  const checkbox = modal.querySelector("[data-purchase-terms-modal-checkbox]");
  const confirmBtn = modal.querySelector("[data-purchase-terms-confirm]");

  checkbox.addEventListener("change", () => {
    confirmBtn.disabled = !checkbox.checked;
    confirmBtn.classList.toggle("is-disabled", !checkbox.checked);
  });

  confirmBtn.addEventListener("click", () => {
    if (!checkbox.checked) return;
    setPurchaseTermsAccepted(true);
    const link = purchaseTermsPendingLink;
    closePurchaseTermsModal();
    if (link) link.click();
  });

  modal.querySelectorAll("[data-purchase-terms-dismiss]").forEach((el) => {
    el.addEventListener("click", closePurchaseTermsModal);
  });

  return modal;
}

function openPurchaseTermsModal(link) {
  purchaseTermsPendingLink = link;
  const modal = ensurePurchaseTermsModal();
  const checkbox = modal.querySelector("[data-purchase-terms-modal-checkbox]");
  const confirmBtn = modal.querySelector("[data-purchase-terms-confirm]");
  checkbox.checked = false;
  confirmBtn.disabled = true;
  confirmBtn.classList.add("is-disabled");
  modal.hidden = false;
  document.body.classList.add("purchase-terms-modal-open");
  checkbox.focus();
}

function refreshPurchaseTermsModalI18n() {
  if (!window.SiteI18n) return;
  const modal = document.querySelector("[data-purchase-terms-modal]");
  if (modal) SiteI18n.applySiteTranslations(SiteI18n.getSiteLang());
}

function initPurchaseTerms() {
  maybeResetPurchaseTermsFromUrl();
  refreshPurchaseTermsModalI18n();

  if (purchaseTermsClickBound) return;
  purchaseTermsClickBound = true;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-purchase-action]");
    if (!link) return;
    if (isPurchaseTermsAccepted()) return;
    event.preventDefault();
    openPurchaseTermsModal(link);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = document.querySelector("[data-purchase-terms-modal]");
    if (modal && !modal.hidden) closePurchaseTermsModal();
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
      document.querySelectorAll("[data-module-price-table]").forEach((root) => {
        renderModulePriceTable(root, packageCatalog ?? {}, progressManifest ?? {});
      });
      initPurchaseTerms();
    });
  }

  const [catalog, manifest] = await Promise.all([loadPackageCatalog(), loadProgressManifest()]);
  if ((catalog.purchasablePackageIds ?? []).some((id) => getCheckoutUrl(id, catalog))) {
    ensureLemonSqueezyScript();
  }
  document.querySelectorAll("[data-packages-root]").forEach((root) => {
    renderPackages(root, catalog, manifest);
  });
  initPricingPlans(catalog);
  initPurchaseTerms();
  initStudentProgressLinks();
  initTomatoTimeLinks();
  initNavigation();
  initPricingCurrency();
}

document.addEventListener("DOMContentLoaded", init);
