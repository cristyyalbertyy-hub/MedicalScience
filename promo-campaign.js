/** Launch promo — edit here when campaigns change. */
const LAUNCH_PROMO = {
  code: "U5NZA4MW",
  discountPercent: 10,
  /** Campaign ends end of day (Portugal, WEST). */
  endAt: "2026-07-24T23:59:59+01:00",
  pageIds: new Set(["home", "packages", "precos"]),
};

function isLaunchPromoActive() {
  return Date.now() <= new Date(LAUNCH_PROMO.endAt).getTime();
}

function shouldShowLaunchPromo() {
  if (!isLaunchPromoActive()) return false;
  const page = document.body?.dataset?.page;
  return Boolean(page && LAUNCH_PROMO.pageIds.has(page));
}

function promoText(key) {
  if (!window.SiteI18n) return key;
  return SiteI18n.siteT(SiteI18n.getSiteLang(), key);
}

function getLaunchPromoPricingHref() {
  const page = document.body?.dataset?.page;
  if (page === "home") return "precos/#precos";
  if (page === "precos") return "#precos";
  return "../precos/#precos";
}

function removeLaunchPromoBanner() {
  document.querySelector("[data-launch-promo-banner]")?.remove();
}

function buildLaunchPromoBanner() {
  const banner = document.createElement("aside");
  banner.className = "promo-banner";
  banner.dataset.launchPromoBanner = "";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", promoText("promo.launch.aria"));

  const pricingHref = getLaunchPromoPricingHref();

  banner.innerHTML = `
    <div class="promo-banner__inner">
      <div class="promo-banner__copy">
        <p class="promo-banner__eyebrow" data-promo-i18n="promo.launch.eyebrow"></p>
        <p class="promo-banner__title" data-promo-i18n="promo.launch.title"></p>
        <p class="promo-banner__hint" data-promo-i18n="promo.launch.hint"></p>
      </div>
      <div class="promo-banner__code-wrap">
        <span class="promo-banner__code-label" data-promo-i18n="promo.launch.codeLabel"></span>
        <div class="promo-banner__code-row">
          <code class="promo-banner__code">${LAUNCH_PROMO.code}</code>
          <button type="button" class="promo-banner__copy" data-copy-promo-code>${promoText("promo.launch.copy")}</button>
        </div>
        <p class="promo-banner__until" data-promo-i18n="promo.launch.until"></p>
      </div>
      <a class="btn btn-primary promo-banner__cta" href="${pricingHref}" data-promo-i18n="promo.launch.cta"></a>
    </div>
  `;

  const copyBtn = banner.querySelector("[data-copy-promo-code]");
  copyBtn.addEventListener("click", async () => {
    const copiedLabel = promoText("promo.launch.copied");
    const copyLabel = promoText("promo.launch.copy");
    try {
      await navigator.clipboard.writeText(LAUNCH_PROMO.code);
      copyBtn.textContent = copiedLabel;
      window.setTimeout(() => {
        copyBtn.textContent = copyLabel;
      }, 2000);
    } catch {
      copyBtn.textContent = LAUNCH_PROMO.code;
    }
  });

  return banner;
}

function refreshLaunchPromoI18n(root = document) {
  root.querySelectorAll("[data-promo-i18n]").forEach((el) => {
    el.textContent = promoText(el.dataset.promoI18n);
  });
  const copyBtn = root.querySelector("[data-copy-promo-code]");
  if (copyBtn) copyBtn.textContent = promoText("promo.launch.copy");
}

function refreshLaunchPromoVolumeNote() {
  const note = document.querySelector("[data-launch-promo-volume-note]");
  if (!note || !window.SiteI18n) return;
  if (shouldShowLaunchPromo() && document.body.dataset.page === "precos") {
    note.textContent = promoText("promo.launch.volumeNote");
    note.hidden = false;
  } else {
    note.hidden = true;
  }
}

function mountLaunchPromoBanner() {
  removeLaunchPromoBanner();
  if (!shouldShowLaunchPromo()) {
    refreshLaunchPromoVolumeNote();
    return;
  }

  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const banner = buildLaunchPromoBanner();
  refreshLaunchPromoI18n(banner);
  nav.insertAdjacentElement("afterend", banner);
  refreshLaunchPromoVolumeNote();
}

function initLaunchPromo() {
  mountLaunchPromoBanner();
  document.addEventListener("site:langchange", () => {
    refreshLaunchPromoI18n();
    refreshLaunchPromoVolumeNote();
  });
}

window.Studio9LaunchPromo = {
  LAUNCH_PROMO,
  isLaunchPromoActive,
  shouldShowLaunchPromo,
  initLaunchPromo,
};
