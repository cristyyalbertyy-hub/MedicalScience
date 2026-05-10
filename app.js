/**
 * Deployed / local app URLs — edit here when domains change.
 */
const EXTERNAL_APPS = {
  "medical-biology": "https://biology-genetics.vercel.app/#/login",
  "medical-genetics": "https://medica-genetics.vercel.app/",
};

const SYLLABI = {
  "medical-biology-and-genetics": {
    title: "Medical Biology and Genetics",
    subtitle:
      "Two companion apps: the biology app (online) covers the biology stack; Genetics covers clinical genetics — same Year 1 block, one syllabus.",
    sections: [
      {
        heading: "Biology — cell fundamentals",
        items: [
          "Cell theory (CT)",
          "Macromolecules (M)",
          "Prokaryotic vs eukaryotic (PE)",
          "Viruses (V)",
        ],
      },
      {
        heading: "Biology — cell structure & function",
        items: [
          "Plasma membrane (PM)",
          "Organelles (O)",
          "Cytoskeleton (CY)",
          "Mitochondria (MI)",
        ],
      },
      {
        heading: "Biology — molecular biology",
        items: [
          "DNA structure & duplication (DSD)",
          "RNA & transcription (RT)",
          "Protein synthesis (PS)",
          "Gene expression control (GEC)",
        ],
      },
      {
        heading: "Biology — cellular processes",
        items: [
          "Cell trafficking (CTR)",
          "Mitosis & meiosis (MM)",
          "Cell death (CD)",
          "Cell signalling (CS)",
        ],
      },
      {
        heading: "Biology — cancer biology",
        items: [
          "Tumour transformation (TT)",
          "Proto-oncogenes (PO)",
          "Tumour suppressors (TS)",
        ],
      },
      {
        heading: "Genetics — basic genetics (BG)",
        items: ["Terminology (T)", "Mendelian principles (MP)", "Population genetics (PG)"],
      },
      {
        heading: "Genetics — inheritance models (IM)",
        items: ["Monogenic (M)", "Chromosomal (C)", "Multifactorial (Mu)", "Mitochondrial (Mi)"],
      },
      {
        heading: "Genetics — clinical application (CA)",
        items: ["Pedigree analysis (PA)", "Risk calculation (RC)", "Genetic diagnosis (GD)"],
      },
    ],
    resourcesNote:
      "Biology topics map to media in the online app where files exist; genetics follows the same pattern in the Genetics app.",
    status: "live",
    apps: [
      { key: "medical-biology", label: "Open Biology app" },
      { key: "medical-genetics", label: "Open Genetics app" },
    ],
  },
};

function placeholderSyllabus(displayTitle) {
  return {
    title: displayTitle,
    subtitle: "Placeholder module",
    sections: [
      {
        heading: "Coming soon",
        items: [
          "Full syllabus and learning app are being built.",
          "We’ll rename this block and publish the full outline as soon as content is signed off.",
        ],
      },
    ],
    resourcesNote: "",
    status: "soon",
    appKey: null,
  };
}

SYLLABI["y1-2"] = placeholderSyllabus("2");
SYLLABI["y1-3"] = placeholderSyllabus("3");
SYLLABI["y1-4"] = placeholderSyllabus("4");

for (let i = 5; i <= 12; i += 1) {
  SYLLABI[`subject-${i}`] = placeholderSyllabus(`Subject ${i}`);
}

const BRICK_CYCLE = ["brick-red", "brick-blue", "brick-yellow", "brick-green"];
const YEAR_COLOURS = ["block-red", "block-blue", "block-yellow"];

/** Four subjects per year · twelve modules total */
const CURRICULUM = [
  {
    year: 1,
    colour: YEAR_COLOURS[0],
    modules: [
      { id: "medical-biology-and-genetics", label: "Medical Biology and Genetics" },
      { id: "y1-2", label: "2" },
      { id: "y1-3", label: "3" },
      { id: "y1-4", label: "4" },
    ],
  },
  {
    year: 2,
    colour: YEAR_COLOURS[1],
    modules: [
      { id: "subject-5", label: "Subject 5" },
      { id: "subject-6", label: "Subject 6" },
      { id: "subject-7", label: "Subject 7" },
      { id: "subject-8", label: "Subject 8" },
    ],
  },
  {
    year: 3,
    colour: YEAR_COLOURS[2],
    modules: [
      { id: "subject-9", label: "Subject 9" },
      { id: "subject-10", label: "Subject 10" },
      { id: "subject-11", label: "Subject 11" },
      { id: "subject-12", label: "Subject 12" },
    ],
  },
].map((y) => ({
  ...y,
  modules: y.modules.map((m, idx) => ({
    ...m,
    brick: BRICK_CYCLE[idx % BRICK_CYCLE.length],
  })),
}));

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderModalActions(data) {
  const actionsEl = document.getElementById("modal-actions");
  const links = [];

  if (Array.isArray(data.apps) && data.apps.length) {
    data.apps.forEach((a) => {
      const url = EXTERNAL_APPS[a.key];
      if (url) links.push({ url, label: a.label });
    });
  } else if (data.appKey && EXTERNAL_APPS[data.appKey]) {
    links.push({ url: EXTERNAL_APPS[data.appKey], label: "Open learning app" });
  }

  if (!links.length) {
    actionsEl.hidden = true;
    actionsEl.innerHTML = "";
    return;
  }

  actionsEl.hidden = false;
  actionsEl.innerHTML = links
    .map(
      (a) =>
        `<a class="btn-lego btn-green modal-app-link" href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(a.label)}</a>`
    )
    .join("");
}

function renderCurriculum() {
  const root = document.getElementById("curriculum-root");
  root.innerHTML = CURRICULUM.map(
    (y) => `
    <section class="year-stack leg-shadow ${escapeHtml(y.colour)}" aria-labelledby="year-${y.year}">
      <h2 class="year-title" id="year-${y.year}">Year ${y.year}</h2>
      <div class="brick-row">
        ${y.modules
          .map(
            (m) => `
          <button type="button" class="lego-brick ${escapeHtml(m.brick)} js-module" data-module="${escapeHtml(m.id)}">
            <span class="brick-label">${escapeHtml(m.label)}</span>
            <span class="brick-hint">Syllabus · pricing</span>
          </button>`
          )
          .join("")}
      </div>
    </section>`
  ).join("");
}

function openModal(moduleId) {
  const data = SYLLABI[moduleId];
  if (!data) return;

  const overlay = document.getElementById("modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");

  titleEl.textContent = data.title;

  const sectionsHtml = data.sections
    .map(
      (sec) => `
      <div class="syllabus-section">
        <h3>${escapeHtml(sec.heading)}</h3>
        <ul>${sec.items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");

  const noteHtml = data.resourcesNote
    ? `<p class="syllabus-note">${escapeHtml(data.resourcesNote)}</p>`
    : "";

  const pricingHtml = `
    <div class="pricing-strip leg-shadow">
      <p><strong>Single module:</strong> €15</p>
      <p><strong>Any four modules:</strong> €50 <span class="save-pill">save a tenner vs four singles</span></p>
    </div>`;

  const statusHtml =
    data.status === "soon"
      ? `<p class="soon-banner">Under construction — full drop landing shortly.</p>`
      : "";

  renderModalActions(data);

  bodyEl.innerHTML = `
    ${statusHtml}
    <p class="modal-sub">${escapeHtml(data.subtitle)}</p>
    ${pricingHtml}
    <div class="syllabus-scroll">${sectionsHtml}</div>
    ${noteHtml}
  `;

  overlay.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("modal-close").focus();
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.hidden = true;
  document.body.classList.remove("modal-open");
}

function init() {
  renderCurriculum();

  document.getElementById("curriculum-root").addEventListener("click", (e) => {
    const btn = e.target.closest(".js-module");
    if (btn) openModal(btn.getAttribute("data-module"));
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

document.addEventListener("DOMContentLoaded", init);
