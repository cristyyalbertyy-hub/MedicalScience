/** Seconds before the end when a long clip counts as complete (within the 20–30s range). */
const COMPLETION_LEAD_SECONDS = 25;

/** Shorter clips keep the legacy near-end threshold. */
const SHORT_MEDIA_MAX_SECONDS = 40;

function completionThreshold(duration) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (duration <= SHORT_MEDIA_MAX_SECONDS) {
    return Math.max(0, duration - 0.75);
  }
  return Math.max(0, duration - COMPLETION_LEAD_SECONDS);
}

/** Fire once per play-through when media reaches the completion threshold. */
export function bindPlaybackProgress(element, onComplete) {
  let tracked = false;

  const reset = () => {
    tracked = false;
  };

  const completeOnce = () => {
    if (tracked) return;
    tracked = true;
    void onComplete();
  };

  const maybeNearEnd = () => {
    if (tracked) return;
    const duration = element.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (element.currentTime >= completionThreshold(duration)) {
      completeOnce();
    }
  };

  element.addEventListener("play", reset);
  element.addEventListener("seeking", reset);
  element.addEventListener("ended", completeOnce);
  element.addEventListener("timeupdate", maybeNearEnd);
  element.addEventListener("loadedmetadata", maybeNearEnd);
  element.addEventListener("durationchange", maybeNearEnd);

  maybeNearEnd();
}
