/**
 * Ready-made interactive packages — edit titles, URLs and status here.
 * status: "live" (needs url) | "soon"
 */
const READY_PACKAGES = [
  {
    id: "medical-biology",
    number: "01",
    title: "Medical Biology",
    description:
      "Cell biology, tissues, metabolism and the foundations you need before clinical years.",
    url: "https://biology-genetics.vercel.app/#/login",
    status: "live",
  },
  {
    id: "genetics",
    number: "02",
    title: "Genetics",
    description:
      "Mendelian inheritance, mutations, pedigrees and clinical genetics scenarios.",
    url: "https://medica-genetics.vercel.app/",
    status: "live",
  },
  {
    id: "physics",
    number: "03",
    title: "Physics",
    description:
      "Physical principles applied to the human body, imaging, forces and measurement in medicine.",
    url: "https://physics-tau-five.vercel.app/",
    status: "live",
  },
  {
    id: "information-processing",
    number: "04",
    title: "Information Processing",
    description:
      "Data literacy and digital tools for evidence-based study — classes, videos, podcasts and questions.",
    url: "https://informatics-theta.vercel.app/",
    status: "live",
  },
  {
    id: "statistics",
    number: "05",
    title: "Statistics",
    description:
      "Descriptive and inferential statistics for health sciences — coming as a dedicated Studio9 package.",
    url: "",
    status: "soon",
  },
  {
    id: "history-of-medicine",
    number: "06",
    title: "History of Medicine",
    description:
      "Key discoveries, figures and turning points that shaped modern health sciences.",
    url: "https://history-medicine.vercel.app/",
    status: "live",
  },
  {
    id: "moral-philosophy",
    number: "07",
    title: "Moral Philosophy",
    description:
      "Ethical frameworks for consent, confidentiality, end-of-life care and professional conduct.",
    url: "https://moral-philosophy.vercel.app/",
    status: "live",
  },
  {
    id: "health-technology-assessments",
    number: "08",
    title: "Health Technology Assessments",
    description:
      "HTA methods, evidence appraisal and decision-making for drugs, devices and health interventions.",
    url: "https://health-technology-assessments.vercel.app/",
    status: "live",
  },
  {
    id: "italian-health-system",
    number: "09",
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

function renderPackageCard(pkg, { compact = false } = {}) {
  const isLive = pkg.status === "live" && pkg.url;
  const statusClass = isLive ? "is-live" : "is-soon";
  const statusLabel = isLive ? "Live" : "Coming soon";
  const action = isLive
    ? `<a class="btn ${compact ? "btn-secondary" : "btn-primary"}" href="${escapeHtml(pkg.url)}" target="_blank" rel="noopener noreferrer">Open app</a>`
    : `<span class="package-soon">Launching soon</span>`;

  return `
    <article class="package-card ${statusClass}${compact ? " is-compact" : ""}" id="package-${escapeHtml(pkg.id)}">
      <div class="package-card-top">
        <span class="package-number">${escapeHtml(pkg.number)}</span>
        <span class="package-status">${statusLabel}</span>
      </div>
      <h3>${escapeHtml(pkg.title)}</h3>
      <p>${escapeHtml(pkg.description)}</p>
      <div class="package-card-action">${action}</div>
    </article>`;
}

function renderPackages(root) {
  if (!root) return;
  const compact = root.dataset.packagesCompact === "true";
  root.innerHTML = READY_PACKAGES.map((pkg) => renderPackageCard(pkg, { compact })).join("");
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
  document.querySelectorAll("[data-packages-root]").forEach(renderPackages);
  initNavigation();

  document.querySelector(".sound-button")?.addEventListener("click", (event) => {
    event.currentTarget.textContent = "Video ready for sound";
  });
}

document.addEventListener("DOMContentLoaded", init);
