const CONTACT_EMAIL = "studio9.alex@gmail.com";

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("contact-status");

function t(key) {
  const lang = window.SiteI18n?.getSiteLang?.() ?? "en";
  const value = window.SiteI18n?.siteT(lang, key);
  return value && value !== key ? value : key;
}

function topicLabel(value) {
  const map = {
    access: "contactPage.topicAccess",
    purchase: "contactPage.topicPurchase",
    technical: "contactPage.topicTechnical",
    other: "contactPage.topicOther",
  };
  return t(map[value] ?? "contactPage.topicOther");
}

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.hidden = !message;
  statusEl.textContent = message;
  statusEl.className = `contact-status${type ? ` is-${type}` : ""}`;
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!(form instanceof HTMLFormElement)) return;

  const data = new FormData(form);
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const topic = String(data.get("topic") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (!name || !email || !topic || !message) {
    setStatus(t("contactPage.errorRequired"), "error");
    return;
  }

  const subject = `Studio9 — ${topicLabel(topic)}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topicLabel(topic)}`,
    "",
    message,
  ].join("\n");

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  setStatus(t("contactPage.success"), "ok");
});

document.addEventListener("site:langchange", () => {
  if (statusEl && !statusEl.hidden && statusEl.classList.contains("is-error")) {
    setStatus(t("contactPage.errorRequired"), "error");
  }
});
