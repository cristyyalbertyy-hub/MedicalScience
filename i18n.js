/** @typedef {'en'|'es'|'fr'|'it'|'pt'} SiteLang */

const SITE_LANGS = /** @type {const} */ (["en", "es", "fr", "it", "pt"]);
const LANG_STORAGE_KEY = "studio9-medical-lang";

/** @type {Record<SiteLang, Record<string, unknown>>} */
const SITE_LOCALES = {
  en: {
    meta: {
      home: {
        title: "Medical Science · Studio9",
        description:
          "Studio9 Medical Science online course: short videos, podcasts and interactive exercises for health science students.",
      },
      curriculo: {
        title: "Full curriculum · Medical Science · Studio9",
        description:
          "Medical Science course catalogue: 22 modules with study hours and a description for each subject.",
      },
      packages: {
        title: "All disciplines · Medical Science · Studio9",
        description: "22 health-science disciplines — 12 live Studio9 apps and 10 coming soon.",
      },
      precos: {
        title: "How it works + Pricing · Medical Science · Studio9",
        description:
          "How the Studio9 Medical Science course works, with pricing plans for modules, bundles and the complete course.",
      },
      account: {
        title: "My account · Studio9 Medical Science",
      },
    },
    brand: { aria: "Studio9 Medical Science - home", name: "Studio9" },
    lang: { label: "Language" },
    nav: {
      skip: "Skip to content",
      menu: "Menu",
      home: "Home",
      packages: "Disciplines",
      precos: "How it works + Pricing",
      account: "My account",
      progress: "My progress",
      aria: "Main navigation",
    },
    footer: {
      brand: "Studio9 + Medical Science",
      packages: "Disciplines",
      howItWorks: "How it works",
      pricing: "Pricing",
      faq: "FAQ",
      progress: "My progress",
      contact: "Contact",
      copy: "© 2026 Studio9 – learning without stress, really",
      aria: "Footer links",
    },
    packagesUi: {
      live: "Live",
      comingSoon: "Coming soon",
      openApp: "Open app",
      launchingSoon: "Launching soon",
    },
    screenshots: {
      hero: { alt: "Studio9 app showing a short medical science video lesson" },
      videos: { alt: "Mobile app with a 5–10 minute video lesson" },
      podcasts: { alt: "Student listening to a medical science podcast outdoors in the park" },
      exercises: { alt: "Interactive exercise with instant feedback in the app" },
      infographics: { alt: "Tablet on a desk showing a human anatomy infographic summary" },
      quiz: { alt: "Interactive quiz with open questions and instant checking in the app" },
      packages: { alt: "Overview of ready-made Studio9 learning packages" },
      progress: { alt: "Student progress dashboard across disciplines" },
    },
    home: {
      hero: {
        eyebrow: "Online course · 22 modules · Studio9 app",
        title: "Medical Science — wherever and whenever you want.",
        lead: "Study anatomy, physiology, genetics and much more. In short videos, podcasts for the bus, and interactive exercises. All inside the Studio9 app.",
        ctaDisciplines: "Browse all disciplines",
        ctaHow: "See how it works",
        mediaAria: "App preview",
      },
      audience: {
        eyebrow: "No academic drama",
        title: "Who this is for.",
        c1Title: "Freshers and pre-university students",
        c1Text:
          "Want to arrive at university with solid foundations? Or need to study efficiently between classes?",
        c2Title: "Health science students",
        c2Text:
          "Medicine, nursing, biomedicine, biology, pharmacy. The course covers the shared foundations of health sciences.",
        c3Title: "Anyone with a packed routine",
        c3Text:
          "Working or juggling complicated schedules? Study on the bus, during your lunch break, or before bed. No guilt, no stress.",
      },
      preview: {
        eyebrow: "All disciplines",
        title: "22 subjects — pick the ones you need.",
        intro:
          "Twelve interactive Studio9 apps are live today. Ten more disciplines are coming soon. Each module includes 40–60 hours of study — videos, podcasts, infographics and quizzes.",
        liveCount: "12 apps live now",
        soonCount: "10 more coming soon",
        hours: "40–60 hours per module",
        cta: "See all disciplines →",
      },
      packages: {
        eyebrow: "Interactive catalogue",
        title: "All disciplines.",
        intro:
          'Twelve apps are live today — the rest are on the way. <a href="packages/">See the full list →</a>',
      },
      progress: {
        aria: "Student progress",
        eyebrow: "Already enrolled?",
        title: "Track your progress.",
        text: "See what you have completed across all your disciplines — videos, exercises and completion counts, discipline by discipline.",
        cta: "Open progress dashboard →",
      },
      study: {
        eyebrow: "The app goes with you",
        title: "Study wherever you want. Really.",
        c1Title: "5-10 min videos",
        c1Text: "One topic at a time. No waffle. Turn on captions and study in silence.",
        c2Title: "Podcasts to listen to",
        c2Text: "Learn the material while you are on the bus, walking to class or tidying your room.",
        c3Title: "Infographics at a glance",
        c3Text:
          "Complex topics in visual summaries — ideal for a quick review before class or exam.",
        c4Title: "Quizzes and questionnaires",
        c4Text:
          "Test what you learned. Instant feedback shows where you went wrong and explains it again.",
      },
      final: {
        title: "$14.97 per module. $49.97 for four.",
        text: "And a complete course that will not drive you mad.",
        cta: "See pricing and start",
      },
    },
    curriculo: {
      hero: {
        eyebrow: "22 modules · Studio9 apps",
        title: "Full catalogue · Medical Science",
        text: "22 modules. Each module = 40 to 60 hours of study. Go at your own pace.",
        statModules: "modules",
        statApps: "live apps",
        mediaAria: "Overview of Studio9 learning packages",
      },
      table: {
        subject: "Subject",
        hours: "Hours",
        description: "Brief description",
        packageLink: "Studio9 package (live) →",
      },
      note: {
        text: "You can buy individual modules or bundles. Each module includes videos, podcasts, exercises and a downloadable summary.",
        cta: "See pricing plans →",
      },
      listAria: "Subject list",
    },
    packagesPage: {
      hero: {
        eyebrow: "Interactive · catalogue",
        title: "All disciplines.",
        text: "22 health-science subjects — 12 live apps today, 10 coming soon. Buy only what you need.",
      },
      sectionAria: "Health science disciplines",
    },
    accountPage: {
      back: "← Medical Science site",
      eyebrow: "Studio9 account",
      title: "My account",
      leadHtml:
        "Open your packages from here. If this browser already knows you, your session loads automatically — <strong>no new email</strong>.",
      signInTitle: "Sign in",
      sessionTitle: "Your session",
      emailLabel: "Email",
      emailPlaceholder: "the email used at checkout",
      sendLink: "Send sign-in link",
      resendLink: "Send link again",
      signInNote:
        "After you sign in, this browser keeps your session. Use Open below — no new email needed.",
      signInNoteReturning:
        "Send a link only if this browser lost your session (after sign out or clearing data).",
      checkingSession: "Checking your session…",
      sessionLabel: "Session:",
      signOut: "Sign out",
      signedInSubtitle:
        "Account active in this browser. Use Open to enter your packages without a new email.",
      signedOutSubtitle: "Enter the email you used at checkout to receive a sign-in link.",
      signedOutReturningSubtitle:
        "Welcome back. No active session in this browser — send a link to sign in again.",
      linkPendingSubtitle: "We sent a link to {email}. Open it in this browser before requesting another.",
      linkPendingNote:
        "Check your spam folder. To save email quota, wait for the link instead of sending again.",
      myPackages: "My packages",
      packagesIntro: "Click Open — enter the package without a new magic link.",
      emptyTitle: "You don't have any modules on this account yet.",
      emptySignedInHint:
        "Signed in as {email}. If access was granted in admin, the email must match exactly — then click Refresh access.",
      emptyText: "After purchase, access will appear here automatically.",
      emptyCta: "See plans and buy",
      refreshAccess: "Refresh access",
      refreshing: "Refreshing access…",
      entitlementsError:
        "Could not load your access list. Check your connection and try Refresh access.",
      entitlementsNetworkError: "Network error while loading your access list.",
      footnoteHtml:
        'Want more modules? <a href="../packages/">See all disciplines</a> · <a href="../precos/">Buy</a>',
      open: "Open",
      opening: "Opening…",
      soon: "Coming soon",
      free: "free",
      active: "active",
      confirmEmail: "Confirm the email used to request the link",
      catalogError: "Catalog unavailable.",
      firebaseError: "Account unavailable — Firebase not configured on this deploy.",
      sendingLink: "Sending link…",
      linkSent: "Link sent to {email}. Open the email in this browser.",
      quotaError:
        "Daily email quota exceeded. Try tomorrow or use an active session.",
      signInFirst: "Sign in first.",
      openError: "Could not open the package.",
      sendError: "Could not send the link.",
      genericError: "Something went wrong.",
      startError: "Could not start.",
    },
    precos: {
      hero: {
        eyebrow: "Flexible method",
        title: "Studying should bring calm, not panic.",
        text: "A multimedia format for when you are focused, on the move, or only have ten minutes before bed.",
      },
      steps: {
        s1Title: "Choose your modules",
        s1Text: "Buy one module, a bundle of four, or more.",
        s2Title: "Access them in the Studio9 app",
        s2Text:
          "After purchase you receive a magic link by email — no password. Sign in on your phone or computer; access stays active for 1 year.",
        s3Title: "Study at your own pace",
        s3Text: "Videos when you are focused. Podcasts when you are moving. Exercises to test yourself.",
        s4Title: "Track your progress",
        s4Text:
          'See what you have completed and what is left, discipline by discipline. <a class="text-link" data-student-progress target="_blank" rel="noopener noreferrer">Open progress dashboard →</a>',
      },
      pricing: {
        eyebrow: "No surprises",
        title: "Simple pricing.",
        currencyLabel: "Currency",
        eachLabel: "each",
        perModuleLabel: "per module",
        p1Label: "Single module",
        p1l1: "40-60h of study",
        p1l2: "Immediate access (1 year)",
        p1l3: "Videos + podcasts + exercises + summary",
        p1cta: "Choose a discipline →",
        p2Label: "4-module bundle",
        p2l1: "4 modules of your choice",
        p2l2: "Immediate access (1 year)",
        p2l3: "Save 25% versus buying individually",
        p2cta: "Build your pack →",
        p3Label: "Full bundle",
        p3l1: "12 modules",
        p3l2: "Immediate access (1 year)",
        p3l3: "Save 40% versus buying individually",
        p3cta: "See all disciplines →",
        p4Label: "Complete course",
        p4l1: "22 modules",
        p4l2: "Lifetime access (while the app exists)",
        p4l3: "Save 58% versus buying individually",
        p4cta: "Most popular → I want everything",
      },
      faq: {
        eyebrow: "Quick questions",
        title: "FAQ.",
        q1: "Can I really study at the beach?",
        a1: "Absolutely — on the beach, in the park, on the bus, at the bar. Videos, podcasts and infographics are made to be absorbed in a relaxed way: you learn while life happens, not only when you are chained to a desk.",
        q2: "Are the teachers real?",
        a2: "Yes. Cristina Alberto, university professor with 30 years of experience, and Alexandra Sousa, business consultant with 20 years of experience, shape the academic vision of the course.",
        q3: "Does this replace university?",
        a3: "No. It is a complement to help you study in a lighter and more efficient way. The topics follow the common health-sciences curriculum.",
      },
    },
    pkg: {
      "human-anatomy-1": {
        title: "Human Anatomy I",
        description:
          "Skeletal, muscular and nervous systems — the base for clinical study and dissection-ready terminology.",
      },
      "medical-biology": {
        title: "Medical Biology",
        description:
          "Cell biology, tissues, metabolism and the core foundations for health-sciences study.",
      },
      genetics: {
        title: "Genetics",
        description: "Mendelian inheritance, mutations, pedigrees and clinical genetics scenarios.",
      },
      physics: {
        title: "Physics",
        description:
          "Physical principles applied to the human body, imaging, forces and measurement in medicine.",
      },
      "information-processing": {
        title: "Information Processing",
        description:
          "Data literacy and digital tools for evidence-based study — classes, videos, podcasts and questions.",
      },
      statistics: {
        title: "Statistics",
        description: "Descriptive and inferential statistics for health sciences.",
      },
      "histology-embryology": {
        title: "Histology and Embryology",
        description:
          "Microscopy, fundamental tissues, early development, and correlation with anatomy.",
      },
      "chemistry-introductory-biochemistry": {
        title: "Chemistry and Introductory Biochemistry",
        description:
          "Atomic structure, chemical bonding, proteins, enzymes, metabolism and the molecular foundations for health sciences.",
      },
      "history-of-medicine": {
        title: "History of Medicine",
        description: "Key discoveries, figures and turning points that shaped modern health sciences.",
      },
      "moral-philosophy": {
        title: "Moral Philosophy",
        description:
          "Ethical frameworks for consent, confidentiality, end-of-life care and professional conduct.",
      },
      "health-technology-assessments": {
        title: "Health Technology Assessments",
        description:
          "HTA methods, evidence appraisal and decision-making for drugs, devices and health interventions.",
      },
      "italian-health-system": {
        title: "Italian Health System",
        description:
          "Structure, funding and organisation of healthcare in Italy — regions, services and policy context.",
      },
    },
    mod: {
      y1bio: {
        name: "Biology and Genetics",
        desc: "Cell biology, molecular genetics, inheritance, and the foundations of clinical genetics",
      },
      y1chem: {
        name: "Chemistry and Introductory Biochemistry",
        desc: 'Atoms, molecules, bonds, pH, and core biochemical pathways for health sciences. <a href="../packages/#package-chemistry-introductory-biochemistry">Studio9 package (live) →</a>',
      },
      y1econ: {
        name: "Economics and International Social Politics",
        desc: "Health systems, global policy, and the social context of medicine and public health",
      },
      y1histo: {
        name: "Histology and Embryology",
        desc: 'Microscopy, fundamental tissues, early development, and correlation with anatomy. <a href="../packages/#package-histology-embryology">Studio9 package (live) →</a>',
      },
      y1anat: {
        name: "Human Anatomy I",
        desc: 'Skeletal, muscular and nervous systems – the base for clinical study. <a href="../packages/#package-human-anatomy-1">Studio9 package (live) →</a>',
      },
      y1psi: {
        name: "Physics, Statistics and Information Processing",
        desc: "Physical principles in medicine, data literacy, and tools for evidence-based study",
      },
      y2gen: {
        name: "Medical Genetics",
        desc: "Mendelian inheritance, mutations, genetic disorders, gene therapy",
      },
      y2anat: {
        name: "Human Anatomy II",
        desc: "Cardiovascular, respiratory, digestive, urinary and reproductive systems",
      },
      y2phys: {
        name: "Physiology II",
        desc: "Renal, digestive, endocrine and reproductive systems",
      },
      y2imm: {
        name: "Immunology",
        desc: "Adaptive immunity, vaccines, allergies, autoimmunity",
      },
      y2micro: {
        name: "Microbiology",
        desc: "Bacteria, viruses, fungi, parasites – pathogenesis and diagnosis",
      },
      y2pharm: {
        name: "Pharmacology I",
        desc: "Pharmacokinetics, pharmacodynamics, CNS and cardiovascular drugs",
      },
      y2epi: {
        name: "Epidemiology",
        desc: "Frequency measures, study designs, screening",
      },
      y2stats: {
        name: "Biostatistics",
        desc: 'Descriptive and inferential statistics for health sciences. <a href="../packages/#package-statistics">Studio9 package (live) →</a>',
      },
      y3path: {
        name: "Systemic Pathology",
        desc: "System pathology (heart, lung, kidney, liver)",
      },
      y3clin1: {
        name: "Clinical Medicine I",
        desc: "Basic semiology, common symptoms, clinical reasoning",
      },
      y3clin2: {
        name: "Clinical Medicine II",
        desc: "Common conditions: hypertension, diabetes, asthma, infections",
      },
      y3pharm: {
        name: "Pharmacology II",
        desc: "Drugs for infection, cancer and metabolic diseases",
      },
      y3ethics: {
        name: "Medical Ethics and Law",
        desc: "Consent, confidentiality, beginning and end of life",
      },
      y3evidence: {
        name: "Evidence-Based Practice",
        desc: "How to read papers, use guidelines and apply them to decisions",
      },
      y3psych: {
        name: "Health Psychology",
        desc: "Treatment adherence, clinician-patient communication, burnout",
      },
      y3cases: {
        name: "Integrated Cases",
        desc: "Cross-system clinical cases: from symptoms to treatment",
      },
    },
  },
};

function isSiteLang(value) {
  return SITE_LANGS.includes(value);
}

function detectSiteLang() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && isSiteLang(stored)) return stored;
  } catch {
    /* ignore */
  }
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (isSiteLang(browser)) return browser;
  return "en";
}

function getSiteLang() {
  return window.__siteLang ?? detectSiteLang();
}

function resolvePath(obj, path) {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) return acc[part];
    return undefined;
  }, obj);
}

function siteT(lang, key) {
  const value = resolvePath(SITE_LOCALES[lang], key) ?? resolvePath(SITE_LOCALES.en, key);
  return typeof value === "string" ? value : key;
}

function applySiteTranslations(lang) {
  window.__siteLang = lang;
  document.documentElement.lang = lang === "en" ? "en-GB" : lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (
      el.tagName === "META" ||
      el.tagName === "TITLE" ||
      el.hasAttribute("data-i18n-html") ||
      el.hasAttribute("data-i18n-attr")
    ) {
      return;
    }
    el.textContent = siteT(lang, el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = siteT(lang, el.dataset.i18nHtml || el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const attr = el.dataset.i18nAttr;
    const key = el.dataset.i18n;
    if (attr && key) el.setAttribute(attr, siteT(lang, key));
  });

  const titleKey = document.body.dataset.i18nTitle;
  if (titleKey) document.title = siteT(lang, titleKey);

  const descMeta = document.querySelector('meta[name="description"][data-i18n]');
  if (descMeta) descMeta.setAttribute("content", siteT(lang, descMeta.dataset.i18n));

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }

  document.dispatchEvent(new CustomEvent("site:langchange", { detail: { lang } }));
}

function initSiteLanguage() {
  const lang = detectSiteLang();
  applySiteTranslations(lang);

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.lang;
      if (next && isSiteLang(next)) applySiteTranslations(next);
    });
  });
}

window.SiteI18n = {
  SITE_LANGS,
  getSiteLang,
  siteT,
  applySiteTranslations,
  initSiteLanguage,
};
