/** Student progress dashboard — edit URL here only. */
const STUDENT_PROGRESS_URL = "https://progress-azure-five.vercel.app/";

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
    url: "https://biology-genetics.vercel.app/app",
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

function init() {
  if (window.SiteI18n) {
    SiteI18n.initSiteLanguage();
    document.addEventListener("site:langchange", () => {
      document.querySelectorAll("[data-packages-root]").forEach(renderPackages);
      initStudentProgressLinks();
    });
  }

  document.querySelectorAll("[data-packages-root]").forEach(renderPackages);
  initStudentProgressLinks();
  initNavigation();
}

document.addEventListener("DOMContentLoaded", init);
