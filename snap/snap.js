import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const PACKAGE_ID = "genetics";
const NICK_KEY = "studio9.snap.nickname";
const cfg = window.STUDIO9_FIREBASE ?? {};

const gateEl = document.getElementById("snap-gate");
const playEl = document.getElementById("snap-play");
const resultEl = document.getElementById("snap-result");
const authEl = document.getElementById("snap-auth");
const lockedEl = document.getElementById("snap-locked");
const readyEl = document.getElementById("snap-ready");
const statusEl = document.getElementById("snap-status");
const googleBtn = document.getElementById("snap-google");
const startBtn = document.getElementById("snap-start");
const nickInput = document.getElementById("snap-nickname");
const roundEl = document.getElementById("snap-round");
const scoreEl = document.getElementById("snap-score");
const streakEl = document.getElementById("snap-streak");
const timerFill = document.getElementById("snap-timer-fill");
const topicEl = document.getElementById("snap-topic");
const blockEl = document.getElementById("snap-block");
const slotsEl = document.getElementById("snap-slots");
const feedbackEl = document.getElementById("snap-feedback");
const finalScoreEl = document.getElementById("snap-final-score");
const resultNoteEl = document.getElementById("snap-result-note");
const againBtn = document.getElementById("snap-again");
const showBoardBtn = document.getElementById("snap-show-board");
const boardEl = document.getElementById("snap-board");
const weekEl = document.getElementById("snap-week");
const youEl = document.getElementById("snap-you");

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let app = null;
let auth = null;
let deck = null;
let accessVia = null;
let session = null;
let roundLocked = false;
let timerId = null;
let timerStartedAt = 0;

function setStatus(message, isError = false) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("is-error", Boolean(isError && message));
}

function configured() {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadNickname(user) {
  try {
    const stored = localStorage.getItem(NICK_KEY);
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return (user?.email || "player").split("@")[0].slice(0, 24);
}

function saveNickname(value) {
  const nick = String(value || "Player").trim().slice(0, 24) || "Player";
  try {
    localStorage.setItem(NICK_KEY, nick);
  } catch {
    /* ignore */
  }
  return nick;
}

async function api(action, payload = {}) {
  if (!auth?.currentUser) throw new Error("Sign in first.");
  const idToken = await auth.currentUser.getIdToken(true);
  const res = await fetch("/api/snap-leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      id_token: idToken,
      package_id: PACKAGE_ID,
      ...payload,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function renderBoard(data) {
  weekEl.textContent = data.week_id || "";
  boardEl.replaceChildren();
  const board = data.board || [];
  if (!board.length) {
    const li = document.createElement("li");
    li.className = "snap-board-empty";
    li.textContent = "No scores yet this week — be the first.";
    boardEl.appendChild(li);
  } else {
    for (const row of board) {
      const li = document.createElement("li");
      if (row.is_you) li.classList.add("is-you");
      li.innerHTML = `<span>#${row.rank}</span><span>${escapeHtml(row.nickname)}</span><strong>${row.score}</strong>`;
      boardEl.appendChild(li);
    }
  }
  if (data.you) {
    youEl.hidden = false;
    youEl.textContent = `You: #${data.you.rank} · ${data.you.score} pts`;
  } else {
    youEl.hidden = true;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pickRounds() {
  return shuffle(deck.cards).slice(0, deck.roundsPerSession || 10);
}

function buildSlots(card) {
  const distractors = shuffle(
    deck.cards.filter((c) => c.id !== card.id && c.answer !== card.answer),
  )
    .slice(0, 3)
    .map((c) => c.answer);
  return shuffle([card.answer, ...distractors]);
}

function clearTimer() {
  if (timerId) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }
}

function startTimer(seconds) {
  clearTimer();
  timerStartedAt = performance.now();
  const total = seconds * 1000;

  const tick = (now) => {
    const left = Math.max(0, total - (now - timerStartedAt));
    const ratio = left / total;
    timerFill.style.transform = `scaleX(${ratio})`;
    if (left <= 0) {
      void resolveRound(null, 0);
      return;
    }
    timerId = requestAnimationFrame(tick);
  };
  timerId = requestAnimationFrame(tick);
}

function showPlay() {
  gateEl.hidden = true;
  resultEl.hidden = true;
  playEl.hidden = false;
}

function showGate() {
  playEl.hidden = true;
  resultEl.hidden = true;
  gateEl.hidden = false;
}

function showResult(score, submitted) {
  clearTimer();
  playEl.hidden = true;
  gateEl.hidden = true;
  resultEl.hidden = false;
  finalScoreEl.textContent = String(score);
  resultNoteEl.textContent = submitted
    ? "Weekly Genetics ranking updated with your best score."
    : "Session finished.";
}

function updateHud() {
  roundEl.textContent = `${session.index + 1} / ${session.rounds.length}`;
  scoreEl.textContent = String(session.score);
  streakEl.textContent = String(session.streak);
}

function renderRound() {
  const card = session.rounds[session.index];
  roundLocked = false;
  feedbackEl.textContent = "";
  blockEl.classList.remove("is-spent");
  blockEl.textContent = card.prompt;
  topicEl.textContent = card.topic;
  const slots = buildSlots(card);
  slotsEl.replaceChildren();
  for (const answer of slots) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "snap-slot";
    btn.textContent = answer;
    btn.dataset.answer = answer;
    btn.addEventListener("click", () => void resolveRound(answer));
    btn.addEventListener("dragover", (event) => {
      event.preventDefault();
      btn.classList.add("is-dragover");
    });
    btn.addEventListener("dragleave", () => btn.classList.remove("is-dragover"));
    btn.addEventListener("drop", (event) => {
      event.preventDefault();
      btn.classList.remove("is-dragover");
      void resolveRound(answer);
    });
    slotsEl.appendChild(btn);
  }
  updateHud();
  startTimer(deck.timerSeconds || 10);
}

async function resolveRound(answer, forcedSpeed = null) {
  if (roundLocked || !session) return;
  roundLocked = true;
  clearTimer();
  blockEl.classList.add("is-spent");

  const card = session.rounds[session.index];
  const elapsed = (performance.now() - timerStartedAt) / 1000;
  const limit = deck.timerSeconds || 10;
  const speedRatio = forcedSpeed != null ? forcedSpeed : Math.max(0, 1 - elapsed / limit);
  const correct = answer === card.answer;

  for (const slot of slotsEl.querySelectorAll(".snap-slot")) {
    slot.disabled = true;
    if (slot.dataset.answer === card.answer) slot.classList.add("is-correct");
    if (answer && slot.dataset.answer === answer && !correct) slot.classList.add("is-wrong");
  }

  if (correct) {
    const speedMul = speedRatio >= 0.6 ? 1.5 : speedRatio >= 0.3 ? 1 : 0.7;
    session.streak += 1;
    const streakMul = 1 + Math.floor(session.streak / 3) * 0.1;
    const gained = Math.round(100 * speedMul * streakMul);
    session.score += gained;
    feedbackEl.textContent = `Snap! +${gained}`;
  } else {
    session.streak = 0;
    feedbackEl.textContent = answer == null ? `Time! Answer: ${card.answer}` : `Miss · ${card.answer}`;
  }
  updateHud();

  await wait(900);
  session.index += 1;
  if (session.index >= session.rounds.length) {
    await finishSession();
    return;
  }
  renderRound();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function finishSession() {
  const score = session.score;
  let submitted = false;
  try {
    const nick = saveNickname(nickInput.value);
    const data = await api("submit", { score, nickname: nick });
    renderBoard(data);
    submitted = true;
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not submit score", true);
  }
  showResult(score, submitted);
  session = null;
}

function startSession() {
  if (!deck?.cards?.length) {
    setStatus("Deck unavailable.", true);
    return;
  }
  saveNickname(nickInput.value);
  session = {
    rounds: pickRounds(),
    index: 0,
    score: 0,
    streak: 0,
  };
  showPlay();
  renderRound();
}

async function refreshAccess(user) {
  setStatus("Checking access…");
  authEl.hidden = true;
  lockedEl.hidden = true;
  readyEl.hidden = true;
  try {
    const access = await api("access");
    accessVia = access.via;
    if (!access.allowed) {
      lockedEl.hidden = false;
      setStatus("");
      return;
    }
    nickInput.value = loadNickname(user);
    readyEl.hidden = false;
    setStatus(
      accessVia === "pass"
        ? "Studio9 Pass active — ranked Genetics Snap unlocked."
        : "Ranked Genetics Snap unlocked.",
    );
    const board = await api("board");
    renderBoard(board);
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not check access", true);
    authEl.hidden = false;
  }
}

async function initAuth() {
  if (!configured()) {
    setStatus("Firebase is not configured on this deploy.", true);
    return;
  }
  app = initializeApp(cfg);
  auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);
  try {
    await getRedirectResult(auth);
  } catch {
    /* ignore */
  }

  googleBtn?.addEventListener("click", async () => {
    setStatus("Signing in…");
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return;
      }
      setStatus(err instanceof Error ? err.message : "Sign-in failed", true);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      authEl.hidden = false;
      lockedEl.hidden = true;
      readyEl.hidden = true;
      setStatus("Sign in to play Genetics Snap.");
      return;
    }
    await refreshAccess(user);
  });
}

blockEl?.addEventListener("dragstart", (event) => {
  event.dataTransfer?.setData("text/plain", "snap-block");
  event.dataTransfer.effectAllowed = "move";
});

startBtn?.addEventListener("click", () => startSession());
againBtn?.addEventListener("click", () => startSession());
showBoardBtn?.addEventListener("click", () => {
  document.getElementById("snap-board-card")?.scrollIntoView({ behavior: "smooth" });
});

async function boot() {
  try {
    const res = await fetch("./decks/genetics.json");
    if (!res.ok) throw new Error("Could not load Genetics deck");
    deck = await res.json();
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Deck error", true);
  }
  await initAuth();
}

boot();
