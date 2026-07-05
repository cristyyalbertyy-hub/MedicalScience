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
      tomatoTime: {
        title: "Tomato Time · Medical Science · Studio9",
        description:
          "Free Pomodoro focus timer for Medical Science students — forward-counting sessions, short breaks, and 2-hour study journeys.",
      },
      termos: {
        title: "Terms of Sale · Medical Science · Studio9",
        description:
          "Terms of sale for Studio9 Medical Science digital modules — access duration, refunds and consumer information.",
      },
      privacidade: {
        title: "Privacy Policy · Medical Science · Studio9",
        description:
          "Privacy policy for Studio9 Medical Science — how we collect and use your data.",
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
      tomatoTime: "Tomato Time",
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
      tomatoTime: "Tomato Time",
      contact: "Contact",
      terms: "Terms of sale",
      privacy: "Privacy policy",
      copy: "© 2026 Studio9 – learning without stress, really",
      aria: "Footer links",
      socialAria: "Social media",
      tiktok: "TikTok",
      facebook: "Facebook",
      instagram: "Instagram",
      aiNote:
        "Content, design, and code developed with AI support under human academic direction.",
    },
    packagesUi: {
      live: "Live",
      comingSoon: "Coming soon",
      openApp: "Open app",
      launchingSoon: "Launching soon",
      loginSoon: "Login coming soon",
      loginSoonHint: "Account login is being rolled out for this module.",
      purchasable: "Available to buy",
      openViaAccount: "Open via account",
      openAccess: "Free access",
      viewContents: "View included content",
      syllabusNotePurchase:
        "Full index — access to videos, podcasts and exercises after purchase.",
      syllabusNoteBrowse: "Full module index — each topic includes the formats below.",
      syllabusPending: "Full index coming soon.",
      resourceLegend: "V · Video · P · Podcast · I · Infographic · Q · Questions",
      resource: {
        V: "Video",
        P: "Podcast",
        I: "Infographic",
        Q: "Questions",
      },
      tierS: "Small",
      tierM: "Medium",
      tierL: "Large",
      tierTopicsRange: "{min}–{max} topics",
      tierTopicsPlus: "{min}+ topics",
      tierTopicCount: "{count} topics",
      priceFree: "Free",
    },
    screenshots: {
      hero: { alt: "Studio9 app course overview for Medical Statistics with chapters and syllabus infographic" },
      videos: { alt: "Mobile app with a 5–10 minute video lesson" },
      podcasts: { alt: "Student listening to a medical science podcast on the go" },
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
        mediaAria: "Studio9 app showing a course overview with chapters and syllabus",
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
      testimonials: {
        aria: "Testimonials",
        eyebrow: "Real voices",
        title: "What students and<br>families say.",
        t1Quote:
          "The packages are fantastic for a first approach to the subject — you learn with confidence and without stress. When students get to class, they can take almost full advantage, because the material is no longer new.",
        t1Name: "Cristina Alberto",
        t1Role: "University professor · Studio9",
        t2Quote:
          "Studio9 has been the perfect tool for my daughter. She puts tremendous effort into her studies and sometimes feels completely overwhelmed. This app gives her clarity and guidance on challenging subjects — she knows exactly how to tackle each topic. Plus, she can listen to the podcasts while commuting to university or walking between classes, which makes every moment count. It's been a game-changer for her confidence and routine.",
        t2Name: "Patricia Moreira",
        t2Role: "Mother of a university student",
        pendingQuote: "Testimonial coming soon.",
        t3Name: "Student",
        t3Role: "University · coming soon",
      },
      aiCredit: {
        aria: "AI partnership acknowledgment",
        eyebrow: "Human expertise + AI",
        title: "Open about how this was built.",
        text: "Studio9 Medical Science rests on decades of university teaching — and on thoughtful use of artificial intelligence. AI helped develop the course content, design this website, and build the code that powers it. We say that openly and proudly: when human experts lead and AI assists, learning can be richer, clearer, and more accessible for students everywhere.",
      },
      progress: {
        aria: "Student progress",
        eyebrow: "Already enrolled?",
        title: "Progress dashboard",
        text: "One place to follow your study across every package — videos, podcasts, infographics and quizzes, updated as you learn. Available from My account after purchase.",
        cta: "Open progress dashboard →",
      },
      tomatoTime: {
        aria: "Tomato Time focus timer",
        eyebrow: "Free tool · Studio9",
        title: "Tomato Time — study without wishing the clock away.",
        text:
          "A Pomodoro timer that counts forward (0:00 → 25:00), not down. Build focus and presence — then open your Medical Science packages when the journey is done.",
        cta: "Discover Tomato Time →",
        ctaApp: "Open app",
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
        title: "From $9.99 per module. Save up to 30% when you buy more.",
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
    tomatoTimePage: {
      hero: {
        eyebrow: "Focus · Pomodoro · Studio9",
        title: "Tomato Time",
        lead:
          "Four 25-minute focus blocks, short breaks, one 2-hour journey. The timer counts forward — so you build time studying, instead of waiting for it to end.",
        cta: "Open Tomato Time",
        ctaHint: "Free · in your browser · no account needed",
        ringPhase: "Focus",
        ringSub: "of 25 min",
      },
      philosophy: {
        eyebrow: "Count forward, not down",
        title: "Presence beats escape.",
        text:
          "Most timers count backwards. That quietly tells your brain: “how soon can this be over?” Tomato Time counts up — 0:00, 0:01, 0:02 — so you track progress, not escape.",
        quote:
          "When the clock runs down, you unconsciously wish the task away. When it runs up, you accumulate focus.",
      },
      how: {
        eyebrow: "One journey",
        title: "How a 2-hour cycle works.",
        intro:
          "Press Go once. The tomato walks four tracks — work, break, work, break — until the journey is complete.",
        f1Title: "Forward timer",
        f1Text: "0:00 → 25:00 with a filling ring. You see time earned, not time left to endure.",
        f2Title: "Tomato on the track",
        f2Text: "Four session lines show where you are in the cycle — visual progress, not just numbers.",
        f3Title: "Journey complete",
        f3Text: "Finish all four blocks and celebrate — then open your Studio9 packages refreshed.",
        f4Title: "Harvest",
        f4Text: "Tomatoes and journeys add up over days. Study streaks without guilt or rush.",
      },
      keyboard: {
        text: "Press Space to start or pause.",
      },
      final: {
        title: "Ready for a focused session?",
        text: "Open Tomato Time, start a journey, then return to Medical Science when you are done.",
        cta: "Open Tomato Time",
      },
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
        "Signed in as {email} (UID: {uid}). If access was granted in admin, use the same email — Gmail dots count (studio9.cris ≠ studio9cris as separate accounts). Then click Refresh access.",
      emptyText: "After purchase, access will appear here automatically.",
      emptyCta: "See plans and buy",
      refreshAccess: "Refresh access",
      refreshing: "Refreshing access…",
      entitlementsError:
        "Could not load your access list. Check your connection and try Refresh access.",
      entitlementsNetworkError: "Network error while loading your access list.",
      footnoteHtml:
        'Want more modules? <a href="../packages/">See all disciplines</a> · <a href="../precos/">Buy</a>',
      progressTitle: "My progress",
      progressHint: "Progress dashboard · videos, podcasts, infographics and quizzes",
      progressOpen: "Open",
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
        s1Text: "Each module is priced by size — Small, Medium or Large — based on how many topics it includes.",
        s2Title: "Access them in the Studio9 app",
        s2Text:
          "After purchase you receive a magic link by email — no password. Sign in on your phone or computer; access stays active for 1 year.",
        s3Title: "Study at your own pace",
        s3Text: "Videos when you are focused. Podcasts when you are moving. Exercises to test yourself.",
        s4Title: "Track your progress",
        s4Text:
          "See what you have completed and what is left, discipline by discipline.",
      },
      pricing: {
        eyebrow: "No surprises",
        title: "Simple pricing.",
        pilotNotice:
          "During the pilot, online purchase is available for Medical Biology and Genetics only. Other modules will follow soon.",
        currencyLabel: "Currency",
        tierSLabel: "Small",
        tierSRange: "1–9 topics",
        tierMLabel: "Medium",
        tierMRange: "10–19 topics",
        tierLLabel: "Large",
        tierLRange: "20+ topics",
        tierItem1: "40–60h of study",
        tierItem2: "Immediate access (1 year)",
        tierItem3: "Videos + podcasts + exercises + summary",
        volumeTitle: "Buy more, save more",
        volume4: "4 modules — 10% off",
        volume8: "8 modules — 15% off",
        volume12: "12 modules — 20% off",
        volume22: "All 22 modules — 30% off",
        volumeNote:
          "Discount applies to the combined total at checkout. Each module is priced by its size (S, M or L).",
        chooseCta: "Choose your disciplines →",
        planSoon: "Coming soon",
      },
      terms: {
        modalTitle: "Before you purchase",
        labelHtml:
          'I have read and accept the <a href="../termos/">Terms of Sale</a> and <a href="../privacidade/">Privacy Policy</a>. I understand that access is <strong>digital</strong>, <strong>immediate</strong>, and <strong>valid for 12 months</strong> from purchase; <strong>no refunds</strong> are available after payment is confirmed. I expressly waive my 14-day right of withdrawal as digital content is supplied immediately.',
        hint: "You must accept before continuing to purchase.",
        confirmCta: "Continue to purchase",
        cancelCta: "Cancel",
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
        q4: "Can I get a refund?",
        a4: "No. All sales are final. Each module includes 12 months of digital access from purchase. By completing checkout you accept immediate delivery and waive the EU 14-day withdrawal right for digital content. See our Terms of Sale for full details.",
      },
    },
    legal: {
      termos: {
        eyebrow: "Legal",
        title: "Terms of Sale",
        updated: "Last updated: July 2026",
        s01Title: "1. Who we are",
        s01Body:
          'Studio9 (“we”, “Studio9”) sells online access to health-sciences study modules through medical-science-lilac.vercel.app and associated apps. Payments are processed by Lemon Squeezy as merchant of record.',
        s02Title: "2. What you are buying",
        s02Body:
          "A personal, non-transferable licence to access digital content (videos, podcasts, infographics, exercises, summaries) for the module(s) selected. You are not buying downloadable software or physical goods.",
        s03Title: "3. Access duration",
        s03Body:
          "Unless stated otherwise at checkout, each paid module includes 12 months (365 days) of access from the date payment is confirmed. When it expires, access ends automatically. You may purchase again if the module is still offered.",
        s04Title: "4. Immediate delivery",
        s04Body:
          "After confirmed payment you receive an email with access instructions (magic link). Access may begin immediately.",
        s05Title: "5. No refunds",
        s05Body:
          "All sales are final. We do not offer refunds — including if you do not use the content, if access expires after 12 months, if you change course or university, or due to device incompatibility (provided your device meets minimum requirements stated on the site). Exceptions apply only where required by law (e.g. proven duplicate charge) or under Lemon Squeezy’s dispute policy as payment processor.",
        s06Title: "6. Right of withdrawal (EU)",
        s06Body:
          "For digital content with immediate delivery: by completing purchase and ticking the acceptance box, you consent to immediate performance and acknowledge that you lose the 14-day right of withdrawal under applicable EU consumer law.",
        s07Title: "7. Changes and discontinuation",
        s07Body:
          "We may update, modify or remove content for corrections, pedagogical updates or technical reasons. We may discontinue a module, feature or the platform, in whole or in part, for commercial, technical or legal reasons. If we discontinue access before your paid period ends, you are not entitled to a full or partial refund except where the law requires it. When possible, we will give reasonable notice by email or on the site.",
        s08Title: "8. Permitted use",
        s08Body:
          "Access is for personal, educational use only. You may not share credentials, copy, redistribute, record or resell the content.",
        s09Title: "9. Account and email",
        s09Body:
          "Access is linked to the email used at checkout. You are responsible for keeping that email active and secure.",
        s10Title: "10. Educational nature",
        s10Body:
          "Content complements official university teaching; it does not guarantee exam passes or replace your institution.",
        s11Title: "11. Prices and errors",
        s11Body:
          "Prices are shown in USD or the currency indicated at checkout. We may correct obvious pricing errors before an order is confirmed.",
        s12Title: "12. Contact",
        s12Body:
          'Questions about access or payments: <a href="mailto:hello@studio9.example">hello@studio9.example</a>. See also our <a href="../privacidade/">Privacy Policy</a>.',
        s13Title: "13. Governing law",
        s13Body:
          "These terms are governed by the laws of Portugal, without prejudice to mandatory consumer protection in your country of residence within the European Union.",
      },
      privacidade: {
        eyebrow: "Legal",
        title: "Privacy Policy",
        updated: "Last updated: July 2026",
        s01Title: "1. Data controller",
        s01Body:
          'Studio9 is responsible for personal data processed through Medical Science websites and apps. Contact: <a href="mailto:hello@studio9.example">hello@studio9.example</a>.',
        s02Title: "2. Data we collect",
        s02Body:
          "Email address (sign-in and purchase), Firebase user identifier, purchase and entitlement records, optional study-progress data (e.g. videos completed), and basic technical logs (browser, approximate region, pages visited) when you use the site or apps.",
        s03Title: "3. Why we use it",
        s03Body:
          "To provide access after purchase, authenticate you without passwords, show your active modules, sync progress across apps, respond to support requests, and improve the service. We do not sell your personal data.",
        s04Title: "4. Payment processing",
        s04Body:
          "Card and billing data are handled by Lemon Squeezy (merchant of record). We receive order confirmation, email and product purchased — not full card numbers. See Lemon Squeezy’s privacy policy for payment details.",
        s05Title: "5. Authentication and hosting",
        s05Body:
          "We use Google Firebase (Auth, Firestore) and Vercel for hosting. Data may be processed in the EU or other regions where these providers operate, under their standard contractual safeguards.",
        s06Title: "6. Retention",
        s06Body:
          "We keep account and entitlement data while your access is active and for a reasonable period afterwards for support, accounting and legal obligations. Progress data is kept while you use the service or until you ask us to delete it where applicable.",
        s07Title: "7. Your rights",
        s07Body:
          "Under GDPR you may request access, correction, deletion, restriction or portability of your data, and object to certain processing. Contact us at the email above. You may also lodge a complaint with your local data-protection authority.",
        s08Title: "8. Cookies and local storage",
        s08Body:
          "We use local storage for language preference, sign-in state and purchase-term acceptance. Firebase may use cookies or similar technologies for authentication. We do not use third-party advertising trackers on the core Medical Science site.",
        s09Title: "9. Changes",
        s09Body:
          'We may update this policy; the date at the top will change. Continued use after updates constitutes acceptance where permitted by law. See also our <a href="../termos/">Terms of Sale</a>.',
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
