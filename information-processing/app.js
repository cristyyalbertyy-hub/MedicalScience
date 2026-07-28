import { getStudio9Session } from "./auth-gate.js";
import { recordWatchComplete, progressDocId } from "./progress-client.js";
import { bindPlaybackProgress } from "./playback-progress.js";
import { publicMediaUrl } from "./paths.js";

const OVERVIEW_IMAGE = publicMediaUrl("IPA.png");

const topics = [
  {
    title: "Health Information Systems",
    code: "HIS",
    color: "#14213d",
    aliases: ["HIP", "HIS"],
    extraVideos: ["HIS_V2.mp4", "HIS_V3.mp4"],
    files: {
      V: "HIS_V.mp4",
      P: "HIS_P.m4a",
      I: "HIS_I.png",
      Q: "HIS_Q.csv",
    },
  },
  {
    title: "Electronic Medical Records",
    code: "EMR",
    color: "#2d4636",
    aliases: ["HMR", "EMR", "EHR"],
    files: {
      V: "EHR_Vx.mp4",
      P: "EMR_P.m4a",
      I: "EMR_Ix.png",
      Q: "EMR_Q.csv",
    },
  },
  {
    title: "Privacy and Security",
    code: "PS",
    color: "#d36b31",
    aliases: ["PS"],
    files: {
      V: "PS_V.mp4",
      P: "PS_P.m4a",
      I: "PS_Ix.png",
      Q: "PS_Q.csv",
    },
  },
  {
    title: "DataBase and SQL",
    code: "DS",
    color: "#14213d",
    aliases: ["DS"],
    files: {
      V: "DS_V.mp4",
      P: "DS_P.m4a",
      I: "DS_Ix.png",
      Q: "DS_Q.csv",
    },
  },
  {
    title: "Data Mining",
    code: "DM",
    color: "#2d4636",
    aliases: ["DM"],
    files: {
      V: "DM_V.mp4",
      P: "DM_P.m4a",
      I: "DM_Ix.png",
      Q: "DM_Q.csv",
    },
  },
];

const resources = [
  { type: "V", label: "Video" },
  { type: "P", label: "Podcast" },
  { type: "I", label: "Infographic" },
  { type: "Q", label: "Questions" },
];

const extensionsByResource = {
  V: ["mp4"],
  P: ["m4a"],
  I: ["png"],
  Q: ["csv"],
};

const state = {
  activeTopicCode: null,
  activeResourceType: null,
  questions: [],
  questionIndex: 0,
  answerRevealed: false,
  atHome: true,
  mobileMenuOpen: true,
  mobileSubchapter: "",
};

const shellElement = document.querySelector("#app-shell");
const headerElement = document.querySelector("#app-header");
const mobileBarElement = document.querySelector("#mobileBar");
const mobileChapterElement = document.querySelector("#mobileChapter");
const mobileSubElement = document.querySelector("#mobileSub");
const overviewListElement = document.querySelector("#overviewList");
const treeElement = document.querySelector("#tree");
const contentElement = document.querySelector("#content");

function setShellMode() {
  shellElement.classList.toggle("is-mobile-menu", state.mobileMenuOpen);
  shellElement.classList.toggle("is-mobile-content", !state.mobileMenuOpen);
}

function updateMobileBar(topic, subchapter) {
  if (!topic || state.atHome || state.mobileMenuOpen) {
    mobileBarElement.hidden = true;
    headerElement.classList.remove("app-header--compact-mobile");
    return;
  }

  mobileBarElement.hidden = false;
  headerElement.classList.add("app-header--compact-mobile");
  mobileBarElement.style.borderLeftColor = topic.color;
  mobileChapterElement.textContent = topic.title;
  mobileSubElement.textContent = subchapter;
}

function renderOverviewList() {
  overviewListElement.innerHTML = topics
    .map(
      (topic) => `
        <li class="overview-systems__item" style="border-left-color: ${topic.color}">
          <strong>${topic.title}</strong>
          <span>4 resources</span>
        </li>
      `,
    )
    .join("");
}

function renderHome() {
  state.atHome = true;
  state.activeTopicCode = null;
  state.activeResourceType = null;
  contentElement.removeAttribute("data-tint");
  setActiveTopicButton(null);
  updateMobileBar(null);

  contentElement.innerHTML = `
    <div class="overview-panel">
      <div class="overview-intro">
        <p class="overview-lead">
          Five classes on health information systems, records, privacy, databases and data
          mining — each with video, podcast, infographic and questions.
        </p>
        <ul class="overview-systems" aria-label="Course classes">
          ${topics
            .map(
              (topic) => `
                <li class="overview-systems__item" style="border-left-color: ${topic.color}">
                  <strong>${topic.title}</strong>
                  <span>4 resources</span>
                </li>
              `,
            )
            .join("")}
        </ul>
      </div>
      <img
        class="overview-infographic"
        src="${OVERVIEW_IMAGE}"
        alt="Information Processing — course overview"
      />
      <p class="overview-hint">
        Open a coloured class on the left, then choose the resource you want to view.
      </p>
      <button type="button" class="mobile-browse-btn" id="mobileBrowseBtnInner">Browse classes →</button>
    </div>
  `;

  contentElement.querySelector("#mobileBrowseBtnInner")?.addEventListener("click", openMobileMenu);
}

function openMobileMenu() {
  state.mobileMenuOpen = true;
  setShellMode();
  updateMobileBar(
    topics.find((topic) => topic.code === state.activeTopicCode) || null,
    state.mobileSubchapter,
  );
}

function closeMobileMenu() {
  state.mobileMenuOpen = false;
  setShellMode();
  updateMobileBar(
    topics.find((topic) => topic.code === state.activeTopicCode) || null,
    state.mobileSubchapter,
  );
}

function renderTree() {
  treeElement.innerHTML = "";

  topics.forEach((topic) => {
    const topicButton = document.createElement("button");
    topicButton.type = "button";
    topicButton.className = "topic-button";
    topicButton.dataset.topic = topic.code;
    topicButton.style.backgroundColor = topic.color;
    topicButton.innerHTML = `<span class="topic-title">${topic.title}</span>`;
    topicButton.addEventListener("click", () => showTopic(topic));
    treeElement.appendChild(topicButton);
  });
}

function showTopicResources(topic) {
  state.atHome = false;
  state.activeTopicCode = topic.code;
  state.activeResourceType = null;
  state.mobileSubchapter = "Choose a resource";
  closeMobileMenu();
  setActiveTopicButton(topic.code);
  contentElement.dataset.tint = topic.code;
  contentElement.setAttribute("data-tint", topic.code);

  contentElement.innerHTML = `
    <header class="subchapter-head">
      <p class="eyebrow">Class</p>
      <h2>${topic.title}</h2>
    </header>
    <p>Choose the resource you want to open for this class.</p>
    <div class="resource-actions">
      ${resources
        .map(
          (resource) => `
            <button class="content-resource-button" type="button" data-resource="${resource.type}">
              ${resource.label}
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  updateMobileBar(topic, "Choose a resource");

  contentElement.querySelectorAll(".content-resource-button").forEach((button) => {
    const resource = resources.find((item) => item.type === button.dataset.resource);
    button.addEventListener("click", () => openResource(topic, resource));
  });
}

function showTopic(topic) {
  state.atHome = false;
  state.activeTopicCode = topic.code;
  closeMobileMenu();
  setActiveTopicButton(topic.code);
  contentElement.dataset.tint = topic.code;
  contentElement.setAttribute("data-tint", topic.code);

  const videoResource = resources.find((item) => item.type === "V");
  if (videoResource) {
    void openResource(topic, videoResource);
  } else {
    showTopicResources(topic);
  }
}

async function openResource(topic, resource) {
  state.atHome = false;
  state.activeTopicCode = topic.code;
  state.activeResourceType = resource.type;
  contentElement.setAttribute("data-tint", topic.code);
  setActiveTopicButton(topic.code);

  if (resource.type === "Q") {
    await openQuestions(topic);
    return;
  }

  const paths = getResourcePaths(topic, resource.type);

  if (resource.type === "V" && paths.length > 1) {
    renderVideoChoices(topic, resource, paths);
    return;
  }

  renderMediaResource(topic, resource, paths[0]);
}

function setActiveTopicButton(topicCode) {
  document.querySelectorAll(".topic-button").forEach((button) => {
    button.classList.toggle("active", topicCode != null && button.dataset.topic === topicCode);
  });
}

async function openQuestions(topic) {
  if (window.location.protocol === "file:") {
    renderQuestionsFileModeMessage(topic);
    return;
  }

  contentElement.innerHTML = `
    <p class="eyebrow">Questions</p>
    <h2>Loading questions...</h2>
    <p>Reading the questions file.</p>
  `;

  try {
    const csv = await fetchFirstText(topic, "Q");
    state.questions = parseQuestions(csv.text);
    state.questionIndex = 0;
    state.answerRevealed = false;

    if (state.questions.length === 0) {
      throw new Error("The questions file does not contain valid questions.");
    }

    renderQuestion(topic);
  } catch (error) {
    contentElement.innerHTML = `
      ${renderBackButtonHtml()}
      <p class="eyebrow">Questions</p>
      <h2>Questions could not be opened</h2>
      <div class="missing-resource">
        <p>${error.message}</p>
        <p>Please check that the questions file is available.</p>
      </div>
    `;
    bindBackButton(topic);
  }
}

function renderQuestionsFileModeMessage(topic) {
  contentElement.innerHTML = `
    ${renderBackButtonHtml()}
    <p class="eyebrow">Questions</p>
    <h2>Questions need the local server</h2>
    <div class="missing-resource">
      <p>
        The question files are available, but the browser blocks CSV loading when
        this page is opened directly from the file system.
      </p>
      <p>Open the app with <strong>start-app.bat</strong> and then use Questions again.</p>
    </div>
  `;

  bindBackButton(topic);
}

function renderQuestion(topic) {
  const current = state.questions[state.questionIndex];
  const total = state.questions.length;
  const currentNumber = state.questionIndex + 1;
  state.mobileSubchapter = "Questions";
  updateMobileBar(topic, "Questions");

  contentElement.innerHTML = `
    ${renderBackButtonHtml()}
    <header class="subchapter-head">
      <p class="eyebrow">Questions</p>
      <h2>${topic.title}</h2>
    </header>
    <div class="questionnaire">
      <p class="questionnaire__progress">Question ${currentNumber} of ${total}</p>
      <div class="questionnaire__nav-row">
        <button class="questionnaire__arrow" id="previousQuestion" type="button" aria-label="Previous question">←</button>
        <div class="questionnaire__card">
          <p class="questionnaire__question">${escapeHtml(current.question)}</p>
          ${
            state.answerRevealed
              ? `<div class="questionnaire__answer"><span class="questionnaire__answer-label">Answer</span><p>${escapeHtml(current.answer)}</p></div>`
              : ""
          }
        </div>
        <button class="questionnaire__arrow" id="nextQuestion" type="button" aria-label="Next question">→</button>
      </div>
      ${
        state.answerRevealed
          ? ""
          : `<button class="questionnaire__reveal" id="revealAnswer" type="button">Show answer</button>`
      }
    </div>
  `;

  bindBackButton(topic);

  const previousButton = document.querySelector("#previousQuestion");
  const nextButton = document.querySelector("#nextQuestion");
  const revealButton = document.querySelector("#revealAnswer");

  previousButton.disabled = state.questionIndex === 0;
  nextButton.disabled = state.questionIndex === total - 1;

  previousButton.addEventListener("click", () => {
    if (state.questionIndex > 0) {
      state.questionIndex -= 1;
      state.answerRevealed = false;
      renderQuestion(topic);
    }
  });

  nextButton.addEventListener("click", () => {
    if (state.questionIndex < total - 1) {
      state.questionIndex += 1;
      state.answerRevealed = false;
      renderQuestion(topic);
    }
  });

  revealButton?.addEventListener("click", () => {
    state.answerRevealed = true;
    renderQuestion(topic);
  });
}

async function fetchFirstText(topic, type) {
  const candidates = getCandidates(topic, type);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (response.ok) {
        return {
          path: candidate,
          text: await response.text(),
        };
      }
      lastError = new Error("The requested resource was not found.");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("The requested resource was not found.");
}

function getCandidates(topic, type) {
  const extensions = extensionsByResource[type] || [];
  const codes = [...new Set([topic.code, ...topic.aliases])];
  const configuredFile = topic.files?.[type];
  const configuredFiles = Array.isArray(configuredFile)
    ? configuredFile
    : [configuredFile].filter(Boolean);
  const configuredPath = configuredFiles.map((file) => publicMediaUrl(file));
  const suffixes = getSuffixes(type);

  if (configuredPath.length > 0) {
    return configuredPath;
  }

  const generatedPaths = codes.flatMap((code) =>
    suffixes.flatMap((suffix) =>
      extensions.map((extension) => publicMediaUrl(`${code}_${suffix}.${extension}`)),
    ),
  );

  return [...new Set([...configuredPath, ...generatedPaths])];
}

function getResourcePaths(topic, type) {
  return getCandidates(topic, type);
}

function getSuffixes(type) {
  if (type === "V" || type === "I") {
    return [type, `${type}x`];
  }

  return [type];
}

function protectMediaDownloads(root) {
  root.querySelectorAll("video, audio").forEach((el) => {
    el.setAttribute("controlsList", "nodownload");
    el.addEventListener("contextmenu", (event) => event.preventDefault());
  });
}

async function trackMediaComplete(topic, resourceType) {
  const session = getStudio9Session();
  if (!session?.user || !session.db || !topic?.code) return;
  if (resourceType !== "V" && resourceType !== "P") return;

  try {
    const level = await recordWatchComplete(
      session.db,
      session.user.uid,
      session.packageId,
      topic.code,
      resourceType,
    );
    console.info("Progress saved:", {
      packageId: session.packageId,
      itemKey: topic.code,
      resource: resourceType,
      level,
    });
  } catch (err) {
    console.warn("Could not save watch progress:", {
      id: progressDocId(session.user.uid, session.packageId, topic.code, resourceType),
      packageId: session.packageId,
      itemKey: topic.code,
      resource: resourceType,
      err,
    });
  }
}

function attachPlaybackProgress(root, topic, resourceType) {
  root.querySelectorAll("video, audio").forEach((el) => {
    bindPlaybackProgress(el, () => void trackMediaComplete(topic, resourceType));
  });
}

function getExtraVideoPaths(topic) {
  const extra = topic.extraVideos;
  if (!Array.isArray(extra) || extra.length === 0) return [];
  return extra.map((file) => publicMediaUrl(file));
}

function renderVideoElement(path, label = null) {
  const extension = path.split(".").pop().toLowerCase();
  const labelHtml = label ? `<p class="extra-video__label">${label}</p>` : "";

  return `
    ${labelHtml}
    <video class="media" controls controlsList="nodownload" playsinline>
      <source src="${path}" type="video/${extension}">
      Your browser does not support HTML5 video.
    </video>
  `;
}

function renderMediaResource(topic, resource, path, backOptions = {}) {
  const extension = path.split(".").pop().toLowerCase();
  const title = `${topic.title} — ${resource.label}`;
  state.mobileSubchapter = resource.label;
  updateMobileBar(topic, resource.label);

  let body = "";

  if (resource.type === "V") {
    body = renderVideoElement(path);
    const extraPaths = getExtraVideoPaths(topic);
    if (extraPaths.length > 0) {
      body += `
        <section class="extra-videos" aria-label="Additional videos">
          <h3 class="extra-videos__title">Additional videos</h3>
          ${extraPaths
            .map(
              (extraPath, index) => `
                <div class="extra-video">
                  ${renderVideoElement(extraPath, `Video ${index + 2}`)}
                </div>
              `,
            )
            .join("")}
        </section>
      `;
    }
  } else if (resource.type === "P") {
    body = `
      <audio class="media" controls controlsList="nodownload" src="${path}">
        Your browser does not support HTML5 audio.
      </audio>
    `;
  } else if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(extension)) {
    body = `<img class="media" src="${path}" alt="${title}" />`;
  } else {
    body = `<iframe class="resource-frame" src="${path}" title="${title}"></iframe>`;
  }

  contentElement.innerHTML = `
    ${renderBackButtonHtml(backOptions.label)}
    <header class="subchapter-head">
      <p class="eyebrow">${resource.label}</p>
      <h2>${title}</h2>
    </header>
    ${body}
  `;

  bindBackButton(topic, backOptions.onBack);
  protectMediaDownloads(contentElement);
  if (resource.type === "V" || resource.type === "P") {
    attachPlaybackProgress(contentElement, topic, resource.type);
  }
}

function renderVideoChoices(topic, resource, paths) {
  contentElement.innerHTML = `
    ${renderBackButtonHtml()}
    <p class="eyebrow">Video</p>
    <h2>${topic.title}</h2>
    <p>Choose the video you want to open.</p>
    <div class="resource-actions">
      ${paths
        .map(
          (_path, index) => `
            <button class="content-resource-button" type="button" data-video-index="${index}">
              Video ${index + 1}
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  bindBackButton(topic);

  contentElement.querySelectorAll("[data-video-index]").forEach((button) => {
    const path = paths[Number(button.dataset.videoIndex)];
    button.addEventListener("click", () =>
      renderMediaResource(topic, resource, path, {
        label: "Back to videos",
        onBack: () => renderVideoChoices(topic, resource, paths),
      }),
    );
  });
}

function renderMissingResource(topic, resource) {
  contentElement.innerHTML = `
    ${renderBackButtonHtml()}
    <p class="eyebrow">${resource.label}</p>
    <h2>Resource not found</h2>
    <div class="missing-resource">
      <p>This resource could not be opened. Please check that the file is available.</p>
    </div>
  `;
  bindBackButton(topic);
}

function renderBackButtonHtml(label = "Back to resources") {
  return `
    <button class="back-button" id="backToResources" type="button">
      ← ${label}
    </button>
  `;
}

function bindBackButton(topic, onBack = () => showTopicResources(topic)) {
  const backButton = document.querySelector("#backToResources");

  if (backButton) {
    backButton.addEventListener("click", onBack);
  }
}

function parseQuestions(csvText) {
  return parseCsv(csvText)
    .map((row) => ({
      question: (row[0] || "").trim(),
      answer: (row[1] || "").trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function init() {
  const homeImg = document.querySelector("#homeBtn img");
  if (homeImg) homeImg.src = OVERVIEW_IMAGE;

  renderOverviewList();
  renderTree();
  renderHome();
  setShellMode();

  document.querySelector("#homeBtn")?.addEventListener("click", () => {
    openMobileMenu();
    renderHome();
  });
  document.querySelector("#mobileMenuBack")?.addEventListener("click", openMobileMenu);
  document.querySelector("#mobileBrowseBtn")?.addEventListener("click", openMobileMenu);
}
