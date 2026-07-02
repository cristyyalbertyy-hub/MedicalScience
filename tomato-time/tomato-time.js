const FOCUS_SECONDS = 25 * 60;
const SHORT_BREAK_SECONDS = 5 * 60;
const LONG_BREAK_SECONDS = 15 * 60;
const SESSIONS_BEFORE_LONG = 4;
const COUNT_KEY = "studio9.tomatoTime.sessionsToday";
const COUNT_DATE_KEY = "studio9.tomatoTime.sessionsDate";

/** @type {"focus"|"short"|"long"} */
let mode = "focus";
let remaining = FOCUS_SECONDS;
/** @type {number|null} */
let timerId = null;
let running = false;
let focusSessions = 0;

const displayEl = document.getElementById("tomato-display");
const modeEl = document.getElementById("tomato-mode");
const startBtn = document.getElementById("tomato-start");
const pauseBtn = document.getElementById("tomato-pause");
const resetBtn = document.getElementById("tomato-reset");
const countEl = document.getElementById("tomato-count");

function t(key, fallback) {
  return window.SiteI18n?.t?.(key) ?? fallback;
}

function modeLabel(currentMode) {
  if (currentMode === "focus") return t("tomatoTime.modeFocus", "Focus");
  if (currentMode === "short") return t("tomatoTime.modeShortBreak", "Short break");
  return t("tomatoTime.modeLongBreak", "Long break");
}

function modeSeconds(currentMode) {
  if (currentMode === "focus") return FOCUS_SECONDS;
  if (currentMode === "short") return SHORT_BREAK_SECONDS;
  return LONG_BREAK_SECONDS;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadTodayCount() {
  try {
    const storedDate = localStorage.getItem(COUNT_DATE_KEY);
    if (storedDate !== todayKey()) {
      localStorage.setItem(COUNT_DATE_KEY, todayKey());
      localStorage.setItem(COUNT_KEY, "0");
      return 0;
    }
    return Number(localStorage.getItem(COUNT_KEY) || "0");
  } catch {
    return 0;
  }
}

function saveTodayCount(value) {
  try {
    localStorage.setItem(COUNT_DATE_KEY, todayKey());
    localStorage.setItem(COUNT_KEY, String(value));
  } catch {
    /* ignore */
  }
}

function render() {
  if (displayEl) displayEl.textContent = formatTime(remaining);
  if (modeEl) {
    modeEl.textContent = modeLabel(mode);
    modeEl.classList.toggle("is-break", mode !== "focus");
  }
  if (countEl) countEl.textContent = String(focusSessions);
  document.title = `${formatTime(remaining)} · ${modeLabel(mode)} · Tomato Time`;
}

function setRunning(next) {
  running = next;
  if (startBtn) startBtn.hidden = running;
  if (pauseBtn) pauseBtn.hidden = !running;
}

function stopTimer() {
  if (timerId != null) {
    window.clearInterval(timerId);
    timerId = null;
  }
  setRunning(false);
}

function advanceMode() {
  if (mode === "focus") {
    focusSessions += 1;
    saveTodayCount(focusSessions);
    mode = focusSessions % SESSIONS_BEFORE_LONG === 0 ? "long" : "short";
  } else {
    mode = "focus";
  }
  remaining = modeSeconds(mode);
  render();
  maybeNotifyComplete();
}

function maybeNotifyComplete() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const title =
    mode === "focus"
      ? t("tomatoTime.notifyFocus", "Focus block finished — time for a break.")
      : t("tomatoTime.notifyBreak", "Break finished — ready to focus again.");
  try {
    new Notification("Tomato Time", { body: title });
  } catch {
    /* ignore */
  }
}

function tick() {
  remaining -= 1;
  if (remaining <= 0) {
    stopTimer();
    advanceMode();
    return;
  }
  render();
}

function startTimer() {
  if (running) return;
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
  setRunning(true);
  timerId = window.setInterval(tick, 1000);
}

function pauseTimer() {
  stopTimer();
}

function resetTimer() {
  stopTimer();
  mode = "focus";
  remaining = FOCUS_SECONDS;
  render();
}

function initTomatoTime() {
  focusSessions = loadTodayCount();
  render();

  startBtn?.addEventListener("click", startTimer);
  pauseBtn?.addEventListener("click", pauseTimer);
  resetBtn?.addEventListener("click", resetTimer);

  document.addEventListener("site:langchange", render);
}

document.addEventListener("DOMContentLoaded", initTomatoTime);
