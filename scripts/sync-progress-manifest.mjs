/**
 * Regenerates packages/progress-manifest.json (syllabus index for package cards).
 * Run: node scripts/sync-progress-manifest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "packages", "progress-manifest.json");

const RES = ["V", "P", "I", "Q"];

function topic(id, label) {
  return { id, label, resources: RES };
}

function chapterTopics(chapter, leaves) {
  return leaves.map(([id, title]) => topic(id, `${chapter} · ${title}`));
}

const packages = {
  "human-anatomy-1": {
    title: "Human Anatomy I",
    topics: [
      ...chapterTopics("Locomotor System · Anatomical Terminology", [
        ["ls-at-sec", "Sections"],
        ["ls-at-loc", "Localization"],
        ["ls-at-mt", "Movement terms"],
      ]),
      ...chapterTopics("Locomotor System · Osteology", [
        ["ls-os-sk", "Skull"],
        ["ls-os-as", "Axial skeleton"],
        ["ls-os-aps", "Appendicular skeleton"],
      ]),
      ...chapterTopics("Locomotor System · Arthrology", [
        ["ls-ar-jd", "Joint dynamics"],
        ["ls-ar-vc", "Vertebral column"],
        ["ls-ar-thx", "Thorax"],
        ["ls-ar-lim", "Limbs"],
      ]),
      ...chapterTopics("Locomotor System · Myology", [
        ["ls-my-ntm", "Neck and trunk muscles"],
        ["ls-my-cam", "Chest and abdomen muscles"],
        ["ls-my-lm", "Limb muscles"],
      ]),
      topic("cls/cls-ph", "Cardiovascular and Lymphatic Systems · Pericardium and heart"),
      topic("cls/cls-cabv", "Cardiovascular and Lymphatic Systems · Chest and abdomen blood vessels"),
      topic("cls/cls-hnv", "Cardiovascular and Lymphatic Systems · Head and neck vessels"),
      ...chapterTopics("Respiratory System and Cavities · Oral Cavity", [
        ["rs-oc-tt", "Teeth and tongue"],
        ["rs-oc-sg", "Salivary glands"],
        ["rs-oc-fm", "Face muscles"],
      ]),
      topic("rs/rs-ncs", "Respiratory System and Cavities · Nasal cavity and sinuses"),
      topic("rs/rs-pl", "Respiratory System and Cavities · Pharynx and larynx"),
      topic("rs/rs-tl", "Respiratory System and Cavities · Trachea and lungs"),
      topic("rs/rs-pm", "Respiratory System and Cavities · Pleura and mediastinum"),
    ],
  },
  "medical-biology": {
    title: "Medical Biology",
    topics: [
      ...chapterTopics("Cell Fundamentals", [
        ["cell-theory", "Cell Theory"],
        ["macromolecules", "Macromolecules"],
        ["prokaryotic-vs-eukaryotic", "Prokaryotic vs Eukaryotic"],
        ["viruses", "Viruses"],
      ]),
      ...chapterTopics("Cell Structure & Function", [
        ["plasma-membrane", "Plasma Membrane"],
        ["organelles", "Organelles"],
        ["cytoskeleton", "Cytoskeleton"],
        ["mitochondria", "Mitochondria"],
      ]),
      ...chapterTopics("Molecular Biology", [
        ["dna-structure-duplication", "DNA Structure & Duplication"],
        ["rna-transcription", "RNA & Transcription"],
        ["protein-synthesis", "Protein Synthesis"],
        ["gene-expression-control", "Gene Expression Control"],
      ]),
      ...chapterTopics("Cellular Processes", [
        ["cell-trafficking", "Cell Trafficking"],
        ["mitosis-meiosis", "Mitosis & Meiosis"],
        ["cell-death", "Cell Death"],
        ["cell-signaling", "Cell Signaling"],
      ]),
      ...chapterTopics("Cancer Biology", [
        ["tumour-transformation", "Tumour Transformation"],
        ["proto-oncogenes", "Proto-oncogenes"],
        ["tumour-suppressors", "Tumour Suppressors"],
      ]),
    ],
  },
  genetics: {
    title: "Genetics",
    topics: [
      ...chapterTopics("Basic Genetics", [
        ["BG/T", "Terminology"],
        ["BG/MP", "Mendelian Principles"],
        ["BG/PG", "Population Genetics"],
      ]),
      ...chapterTopics("Inheritance Models", [
        ["IM/M", "Monogenic"],
        ["IM/C", "Chromosomal"],
        ["IM/Mu", "Multifactorial"],
        ["IM/Mi", "Mitochondrial"],
      ]),
      ...chapterTopics("Clinical Application", [
        ["CA/PA", "Pedigree Analysis"],
        ["CA/RC", "Risk Calculation"],
        ["CA/GD", "Genetic Diagnosis"],
      ]),
    ],
  },
  physics: {
    title: "Physics",
    topics: [
      ...chapterTopics("Mechanics", [
        ["M/MU", "Measurement and Units"],
        ["M/K", "Kinematics"],
        ["M/NL", "Newton's Laws"],
        ["M/WE", "Work and Energy"],
        ["M/RM", "Rotational Motion"],
      ]),
      ...chapterTopics("Electricity & Magnetism", [
        ["EM/ECF", "Electric Charge and Field"],
        ["EM/EP", "Electric Potential"],
        ["EM/ECDC", "Electric Currents and DC Circuits"],
        ["EM/M", "Magnetism"],
        ["EM/EI", "Electromagnetic Induction"],
      ]),
      ...chapterTopics("Vibrations & Waves", [
        ["VW/WMS", "Wave Motion and Sound"],
        ["VW/EW", "Electromagnetic Waves"],
        ["VW/LO", "Light and Optics"],
        ["VW/XRC", "X-Rays and CT Scans"],
      ]),
      ...chapterTopics("Thermodynamics", [
        ["T/TK", "Temperature and Kinetic Theory"],
        ["T/HC", "Heat and Calorimetry"],
        ["T/TL", "Thermodynamic Laws"],
      ]),
      ...chapterTopics("Nuclear Physics", [
        ["N/R", "Radioactivity"],
        ["N/NF", "Nuclear Forces"],
        ["N/MN", "MRI and NMR"],
      ]),
      topic("F/FL", "Fluids · Properties, pressure, and flow"),
    ],
  },
  "information-processing": {
    title: "Information Processing",
    topics: [
      topic("HIS", "Health Information Systems"),
      topic("EMR", "Electronic Medical Records"),
      topic("PS", "Privacy and Security"),
      topic("DS", "DataBase and SQL"),
      topic("DM", "Data Mining"),
    ],
  },
  statistics: {
    title: "Statistics",
    topics: [
      ...chapterTopics("Basics and Data", [
        ["populations-and-samples", "Populations and Samples"],
        ["variable-types", "Variable Types"],
        ["data-display", "Data Display"],
      ]),
      ...chapterTopics("Numerical Outcome Analysis", [
        ["mean-sd-standard-error", "Mean, SD, and Standard Error"],
        ["normal-distribution", "Normal Distribution"],
        ["confidence-intervals-means", "Confidence Intervals of Means"],
        ["hypothesis-testing-p-values", "Hypothesis Testing and P-values"],
        ["comparison-two-means-t-tests", "Comparison of Two Means (t-tests)"],
        ["analysis-of-variance-anova", "Analysis of Variance (ANOVA)"],
        ["linear-and-multiple-regression", "Linear and Multiple Regression"],
        ["correlation-coefficients", "Correlation Coefficients"],
      ]),
      ...chapterTopics("Binary Outcome Analysis", [
        ["differences-risks-and-odds", "Differences, Risks, and Odds"],
        ["binomial-distribution", "Binomial Distribution"],
        ["comparing-proportions", "Comparing Proportions"],
        ["chi-squared-tests", "Chi-squared Tests"],
        ["confounding-and-stratification", "Confounding and Stratification"],
        ["logistic-regression", "Logistic Regression"],
        ["matching-studies", "Matching Studies"],
      ]),
      ...chapterTopics("Longitudinal and Survival Analysis", [
        ["odds-and-hazard-ratios", "Odds and Hazard Ratios"],
        ["computing-risks", "Computing Risks"],
        ["survival-analysis-kaplan-meier", "Survival Analysis (Kaplan-Meier)"],
        ["regression-analysis-cox-hazards", "Regression Analysis (Cox Hazards)"],
        ["standardization", "Standardization"],
      ]),
      ...chapterTopics("Statistical Modelling", [
        ["likelihood-theory", "Likelihood Theory"],
        ["non-parametric-methods-ranking", "Non-parametric Methods (Ranking)"],
        ["bayesian-methods", "Bayesian Methods"],
        ["systematic-reviews-meta-analysis", "Systematic Reviews and Meta-Analysis"],
        ["diagnostic-test-analysis", "Diagnostic Test Analysis"],
        ["bootstrapping-and-jackknifing", "Bootstrapping and Jackknifing"],
      ]),
      ...chapterTopics("Study Design and Interpretation", [
        ["sample-size-and-power-calculation", "Sample Size and Power Calculation"],
        ["measurement-error-reproducibility", "Measurement Error and Reproducibility"],
        ["measures-of-association-impact", "Measures of Association and Impact"],
        ["analysis-of-bias", "Analysis of Bias"],
        ["causal-inference-studies", "Causal Inference and Studies"],
      ]),
    ],
  },
  "histology-embryology": {
    title: "Histology and Embryology",
    topics: [
      ...chapterTopics("Elements of Cytology", [
        ["cy-eco", "Eukaryotic cell organization"],
        ["cy-om", "Organelles and membranes"],
        ["cy-nc", "Nucleus and chromatin"],
        ["cy-cd", "Cell cycle and death"],
      ]),
      ...chapterTopics("Histology · Tissues", [
        ["hi-eg", "Epithelia and Glands"],
        ["hi-ct", "Connective Tissues and ECM"],
        ["hi-cb", "Cartilage and Bone"],
        ["hi-bh", "Blood and Hemopoiesis"],
        ["hi-il", "Immune and Lymphatic organs"],
        ["hi-mt", "Muscle Tissues"],
        ["hi-nt", "Nervous Tissue"],
      ]),
      ...chapterTopics("Embryology · Gametogenesis", [
        ["em-sp", "Spermatogenesis"],
        ["em-og", "Oogenesis"],
        ["em-hc", "Hormonal control"],
      ]),
      ...chapterTopics("Embryology · Early Development", [
        ["em-fe", "Fertilization"],
        ["em-w14", "Weeks 1–4"],
        ["em-pl", "Primitive layers"],
        ["em-ef", "Embryonic folding"],
      ]),
      topic("em/em-sr", "Embryology · Stem Cells and Regeneration"),
      topic("em/em-pm", "Embryology · Placenta and Membranes"),
      ...chapterTopics("Organogenesis", [
        ["or-in", "Integumentary system"],
        ["or-hn", "Head, neck, and oropharyngeal"],
        ["or-gr", "Gut and Respiratory"],
        ["or-ug", "Urogenital"],
        ["or-sm", "Skeleton and Muscle"],
        ["or-nc", "Nervous and Cardiovascular"],
      ]),
    ],
  },
  "chemistry-introductory-biochemistry": {
    title: "Chemistry and Introductory Biochemistry",
    topics: [
      ...chapterTopics("General Chemistry · Atomic Structure", [
        ["AS_API", "Atomic particles and isotopes"],
        ["AS_QMM", "Quantum mechanical model"],
        ["AS_QNO", "Quantum numbers and orbitals"],
        ["AS_CB", "Chemical bonds"],
      ]),
      ...chapterTopics("General Chemistry · Matter and Thermodynamics", [
        ["MT_GIGL", "Gases and their properties"],
        ["MT_LVP", "Liquid-vapor pressure"],
        ["MT_SC", "Solids classification"],
        ["MT_EEFE", "Entropy, Energy and Free energy"],
      ]),
      ...chapterTopics("General Chemistry · Solutions and Equilibrium", [
        ["SE_CD", "Concentration and Dilution"],
        ["SE_KEL", "Kinetics and Energy Laws"],
        ["SE_EC", "Equilibrium constants"],
        ["SE_LCF", "Le Chatelier's Principle"],
      ]),
      ...chapterTopics("General Chemistry · Electrolytes and Kinetics", [
        ["EK_ABT", "Acid-base theories"],
        ["EK_PB", "pH and Buffers"],
        ["EK_CP", "Colligative properties"],
        ["EK_AE", "Activation energy"],
        ["EK_RR", "Redox reactions"],
      ]),
      ...chapterTopics("Organic Chemistry · Hydrocarbons", [
        ["H_CH", "Carbon hybridization"],
        ["H_AC", "Alkanes and Cycloalkanes"],
        ["H_AA", "Alkenes and Alkynes"],
        ["H_ACB", "Aromatic compounds and Benzene"],
      ]),
      ...chapterTopics("Organic Chemistry · Functional Groups", [
        ["FG_APT", "Alcohols, Phenols and Ethers"],
        ["FG_AK", "Aldehydes and Ketones"],
        ["FG_CAE", "Carboxylic acids and Esters"],
        ["FG_AA", "Amines and Amides"],
      ]),
      topic("OC_SC", "Organic Chemistry · Stereochemistry and Chirality"),
      ...chapterTopics("Introductory Biochemistry", [
        ["IB_CM", "Carbohydrates and Monosaccharides"],
        ["IB_AP", "Amino acids and Proteins"],
        ["IB_LSP", "Lipids and Biomembranes"],
        ["IB_NBN", "Nitrogen Bases and Nucleotides"],
      ]),
    ],
  },
  "history-of-medicine": {
    title: "History of Medicine",
    topics: [
      ...chapterTopics("Ancient Foundations", [
        ["AF_MAG", "Medicine of Ancient Greece"],
        ["AF_HRM", "Hippocrates and Rational Medicine"],
        ["AF_THM", "Theory of Humors"],
        ["AF_ARI", "Aristotle"],
      ]),
      ...chapterTopics("Scientific Advancement", [
        ["SA_SRE", "Scientific Revolution"],
        ["SA_VES", "Andreas Vesalius and Dissection"],
        ["SA_HAR", "William Harvey"],
        ["SA_FLE", "Alexander Fleming"],
      ]),
      ...chapterTopics("Public Health", [
        ["PH_JEN", "Edward Jenner and Vaccines"],
        ["PH_SEM", "Ignaz Semmelweis"],
        ["PH_MGE", "Medical Geography"],
        ["PH_SNO", "John Snow and Cholera"],
      ]),
    ],
  },
  "moral-philosophy": {
    title: "Moral Philosophy",
    topics: [
      ...chapterTopics("Theoretical Foundations", [
        ["TF/MS", "Moral Systems"],
        ["TF/PA", "Philosophical Anthropology"],
        ["TF/SER", "Science and Ethics Relationship"],
      ]),
      ...chapterTopics("Clinical Ethics", [
        ["CE/PPR", "Patient–Physician Relationship"],
        ["CE/NM", "Narrative Medicine"],
        ["CE/E", "Empathy"],
        ["CE/EC", "Ethical Committees"],
      ]),
      ...chapterTopics("Global Context", [
        ["GC/SDG", "Sustainable Development Goals 2030"],
        ["GC/HD", "Health Diplomacy"],
        ["GC/HRH", "Human Rights and Health"],
        ["GC/TM", "Transcultural Medicine"],
      ]),
    ],
  },
  "health-technology-assessments": {
    title: "Health Technology Assessments",
    topics: [
      topic("ER", "European Regulations in Health Technology Assessment"),
      topic("CCA", "Cost Consequences Approach"),
      topic("HTAS", "HTA Structure"),
    ],
  },
  "italian-health-system": {
    title: "Italian Health System",
    topics: [
      topic("OS", "Organization Structure — Governance, regions and institutional roles"),
      topic("SS", "Supply Structure — Services, workforce and delivery networks"),
      topic("BC", "Budgeting and Costs — Financing, spending and cost control"),
    ],
  },
};

const manifest = {
  version: 1,
  resourceTypes: {
    V: "video",
    P: "podcast",
    I: "infographic",
    Q: "questions",
  },
  packages,
};

fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT}`);
for (const [id, pkg] of Object.entries(packages)) {
  console.log(`  ${id}: ${pkg.topics.length} topics`);
}
