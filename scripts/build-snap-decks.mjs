import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(__dirname, "..");
const ROOT = path.resolve(SITE, "..");
const OUT_DIR = path.join(SITE, "snap", "decks");
const MANIFEST_PATH = path.join(SITE, "packages", "progress-manifest.json");

const PACKAGES = [
  { id: "human-anatomy-1", title: "Human Anatomy I", dir: path.join(ROOT, "Human Anatomy") },
  { id: "medical-biology", title: "Medical Biology", dir: path.join(ROOT, "Biology") },
  { id: "physics", title: "Physics", dir: path.join(ROOT, "Physics") },
  { id: "information-processing", title: "Information Processing", dir: path.join(ROOT, "Informatic") },
  { id: "statistics", title: "Statistics", dir: path.join(ROOT, "Statistics") },
  { id: "history-of-medicine", title: "History of Medicine", dir: path.join(ROOT, "History_Medicine") },
  { id: "moral-philosophy", title: "Moral Philosophy", dir: path.join(ROOT, "Moral Philosophy") },
  {
    id: "health-technology-assessments",
    title: "Health Technology Assessments (EU)",
    dir: path.join(ROOT, "HealthTechnologyAssessment"),
  },
  { id: "italian-health-system", title: "Italian Health System", dir: path.join(ROOT, "ItalianHealthSystem") },
];

const STEM_TOPIC = {
  CB_TT: "Cell theory",
  CB_TS: "Tumour suppressors",
  CB_P: "Proto-oncogenes",
  CF_M: "Macromolecules",
  CF_PE: "Prokaryotic vs eukaryotic",
  CF_V: "Viruses",
  CF_CT: "Cell theory",
  CSF_PM: "Plasma membrane",
  CSF_O: "Organelles",
  CSF_C: "Cytoskeleton",
  CSF_M: "Mitochondria",
  CP_S: "Cell signalling",
  CP_CD: "Cell death",
  CP_CT: "Cell trafficking",
  CP_MM: "Mitosis and meiosis",
  MB_DSD: "DNA structure and duplication",
  MB_RT: "RNA and transcription",
  MB_PS: "Protein synthesis",
  MB_GEC: "Gene expression control",
  LS_AT_S: "Anatomical sections",
  LS_AT_L: "Localization terms",
  LS_AT_MT: "Movement terms",
  LS_O_S: "Skull",
  LS_O_AS: "Axial skeleton",
  LS_O_APS: "Appendicular skeleton",
  LS_A_JD: "Joints and diarthroses",
  LS_A_VC: "Vertebral column",
  LS_A_T: "Thorax",
  LS_A_L: "Limb joints",
  LS_M_NTM: "Neck and trunk muscles",
  LS_M_CAM: "Chest and abdomen muscles",
  LS_M_LM: "Limb muscles",
  CLS_PH: "Pericardium and heart",
  CLS_CABV: "Chest and abdomen vessels",
  CLS_HNV: "Head and neck vessels",
  RSC_OC_TT: "Teeth and tongue",
  RSC_OC_SG: "Salivary glands",
  RSC_OC_FM: "Face muscles",
  RSC_NCS: "Nasal cavity and sinuses",
  RSC_PL: "Pharynx and larynx",
  RSC_TL: "Trachea and lungs",
  RSC_PM: "Pleura and mediastinum",
  F: "Fluids",
  AF_TH: "Theory of humors",
  AF_A: "Aristotle",
  SA_SR: "Scientific Revolution",
  SA_AVD: "Vesalius and dissection",
  SA_WH: "William Harvey",
  SA_AF: "Alexander Fleming",
  PH_MG: "Medical geography",
  PH_EJV: "Jenner and vaccines",
  PH_IS: "Ignaz Semmelweis",
  IHS_BC: "Basic concepts",
  IHS_SS: "System structure",
  IHS_OS: "Organizational levels",
  HTA_ER: "European regulations",
  HTA_CCA: "Cost-consequences approach",
  HTA_HTAS: "HTA structure",
  BD_VT: "Variable types",
  BD_PS: "Populations and samples",
  BD_DD: "Data display",
  NOA_MSD: "Mean and SD",
  NOA_ND: "Normal distribution",
  NOA_CIM: "Confidence intervals",
  NOA_HTPV: "Hypothesis testing",
  NOA_CTM: "Comparison of two means",
  NOA_AV: "ANOVA",
  NOA_LMR: "Linear regression",
  NOA_CC: "Correlation",
  BOA_DRO: "Risks and odds",
  BOA_BD: "Binomial distribution",
  BOA_CP: "Comparing proportions",
  BOA_CST: "Chi-squared tests",
  BOA_CS: "Confounding",
  BOA_LR: "Logistic regression",
  BOA_MS: "Matching studies",
  LSA_OHR: "Odds and hazard ratios",
  LSA_CR: "Computing risks",
  LSA_SA: "Kaplan-Meier survival",
  LSA_RA: "Cox regression",
  LSA_S: "Standardization",
  SM_LT: "Likelihood theory",
  SM_NPM: "Non-parametric methods",
  SM_BM: "Bayesian methods",
  SM_SRMA: "Meta-analysis",
  SM_DTA: "Diagnostic tests",
  SM_BJ: "Bootstrapping",
  SDI_SSPC: "Sample size and power",
  SDI_MER: "Measurement error",
  SDI_MAI: "Measures of association",
  SDI_AB: "Analysis bias",
  SDI_CIS: "Causal inference",
};

const SKIP_ANSWERS = new Set(["true", "false", "yes", "no", "t", "f"]);

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = "";
  let row = [];
  let inQ = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (row.some((c) => c.trim())) rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQ = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      pushField();
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      pushField();
      pushRow();
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length || row.length) {
    pushField();
    pushRow();
  }
  return rows;
}

function walkCsv(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkCsv(p, acc);
    else if (/_Q\.csv$/i.test(name)) acc.push(p);
  }
  return acc;
}

function tidy(raw) {
  return String(raw || "")
    .replace(/^Definition:\s*/i, "")
    .replace(/^Term:\s*/i, "")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^}]*)\}/g, "$1")
    .replace(/\\times/g, "×")
    .replace(/\\circ/g, "°")
    .replace(/\\rho/g, "ρ")
    .replace(/\\eta/g, "η")
    .replace(/\\gamma/g, "γ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\pi/g, "π")
    .replace(/\\mu/g, "μ")
    .replace(/\\omega/g, "ω")
    .replace(/\\lambda/g, "λ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\sigma/g, "σ")
    .replace(/\\theta/g, "θ")
    .replace(/\\phi/g, "φ")
    .replace(/\\approx/g, "≈")
    .replace(/\\cdot/g, "·")
    .replace(/\\pm/g, "±")
    .replace(/\\sqrt\{([^}]*)\}/g, "√($1)")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\^\{([^}]*)\}/g, "^$1")
    .replace(/_\{([^}]*)\}/g, "_$1")
    .replace(/\$+/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "")
    .trim();
}

function normalizeId(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function topicFromStem(stem, filePath, topics) {
  if (STEM_TOPIC[stem]) return STEM_TOPIC[stem];
  const stemN = normalizeId(stem);
  let best = null;
  let bestScore = 0;
  for (const topic of topics) {
    const idN = normalizeId(topic.id);
    if (idN === stemN) {
      best = topic;
      bestScore = 1000;
      break;
    }
    if (stemN.endsWith(`_${idN}`) || idN.endsWith(`_${stemN}`)) {
      const score = Math.min(idN.length, stemN.length) + 20;
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    }
  }
  if (best) {
    const parts = String(best.label).split(" · ");
    return parts[parts.length - 1] || best.label;
  }
  const folder = path.basename(path.dirname(filePath));
  if (folder && !/^(public|media|content)$/i.test(folder)) {
    const label = folder
      .replace(/^\d+/, "")
      .replace(/[-_]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();
    if (label) return label;
  }
  return stem.replace(/_/g, " ");
}

function eligibleCard(prompt, answer, maxAnswer) {
  if (!prompt || !answer) return false;
  if (answer.length > maxAnswer) return false;
  if (prompt.length < 12) return false;
  if (/[\\{]/.test(answer)) return false;
  if (SKIP_ANSWERS.has(answer.toLowerCase())) return false;
  return true;
}

function collectCards(pkg, topics, maxAnswer) {
  const files = walkCsv(pkg.dir);
  const cards = [];
  for (const file of files) {
    const stem = path.basename(file).replace(/_Q\.csv$/i, "");
    const topic = topicFromStem(stem, file, topics);
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    for (const row of rows) {
      if (row.length < 2) continue;
      let prompt = tidy(row[0]);
      const answer = tidy(row[1]);
      if (/^term:/i.test(String(row[0] || ""))) {
        const term = tidy(String(row[0]).replace(/^term:\s*/i, ""));
        if (term) prompt = `What is meant by "${term}"?`;
      }
      if (!eligibleCard(prompt, answer, maxAnswer)) continue;
      if (prompt.length > 160) prompt = `${prompt.slice(0, 157)}...`;
      cards.push({
        id: `${stem}_${cards.length}`,
        topic,
        prompt,
        answer,
      });
    }
  }
  return cards;
}

function pickCards(cards, perTopic, uniqueAnswers) {
  const byTopic = {};
  const seen = new Set();
  const picked = [];
  for (const card of cards) {
    const key = card.answer.toLowerCase();
    if (uniqueAnswers && seen.has(key)) continue;
    byTopic[card.topic] = byTopic[card.topic] || [];
    if (byTopic[card.topic].length >= perTopic) continue;
    byTopic[card.topic].push(card);
    seen.add(key);
    picked.push(card);
  }
  return { picked, byTopic };
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
fs.mkdirSync(OUT_DIR, { recursive: true });

const summary = {};
for (const pkg of PACKAGES) {
  const topics = manifest.packages?.[pkg.id]?.topics ?? [];
  let cards = collectCards(pkg, topics, 56);
  const topicCount = new Set(cards.map((c) => c.topic)).size || 1;
  const perTopic = topicCount <= 5 ? 14 : topicCount <= 12 ? 8 : 5;
  let { picked, byTopic } = pickCards(cards, perTopic, true);
  if (picked.length < 20 || new Set(picked.map((c) => c.answer.toLowerCase())).size < 8) {
    cards = collectCards(pkg, topics, 72);
    ({ picked, byTopic } = pickCards(cards, Math.max(perTopic, 10), true));
  }
  if (picked.length < 16) {
    ({ picked, byTopic } = pickCards(cards, 16, false));
  }
  const unique = new Set(picked.map((c) => c.answer.toLowerCase())).size;
  const deck = {
    packageId: pkg.id,
    title: pkg.title,
    version: 1,
    timerSeconds: 10,
    roundsPerSession: 10,
    cards: picked,
  };
  fs.writeFileSync(path.join(OUT_DIR, `${pkg.id}.json`), JSON.stringify(deck, null, 2));
  summary[pkg.id] = {
    files: walkCsv(pkg.dir).length,
    eligible: cards.length,
    picked: picked.length,
    uniqueAnswers: unique,
    topics: Object.fromEntries(Object.entries(byTopic).map(([k, v]) => [k, v.length])),
  };
}

console.log(JSON.stringify(summary, null, 2));
