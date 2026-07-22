const brandLabel = document.getElementById("app-brand-label");
const loadingEl = document.getElementById("app-loading");
const errorEl = document.getElementById("app-error");
const frame = document.getElementById("app-frame");

function getPackageId() {
  return window.location.pathname.split("/").filter(Boolean)[0] ?? "";
}

function buildEmbedUrl(entry) {
  const target = new URL(entry.embedUrl);
  const incoming = new URLSearchParams(window.location.search);
  incoming.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return target.toString();
}

function showError(message) {
  loadingEl.classList.add("is-hidden");
  errorEl.hidden = false;
  errorEl.textContent = message;
}

async function init() {
  const packageId = getPackageId();
  if (!packageId) {
    showError("Module not found.");
    return;
  }

  try {
    const res = await fetch("/apps/embed-manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load module manifest.");
    const manifest = await res.json();
    const entry = manifest[packageId];
    if (!entry?.embedUrl) {
      showError("This module is not available yet.");
      return;
    }

    const title = entry.title ?? packageId;
    document.title = `${title} · Studio9 Medical Science`;
    brandLabel.textContent = `${title} · Studio9`;
    loadingEl.textContent = `Loading ${title}…`;
    frame.title = `${title} app`;
    frame.hidden = false;
    frame.src = buildEmbedUrl(entry);
    frame.addEventListener(
      "load",
      () => {
        loadingEl.classList.add("is-hidden");
      },
      { once: true },
    );
  } catch (err) {
    showError(err instanceof Error ? err.message : "Could not open this module.");
  }
}

init();
