const FORM_ENDPOINT = "https://formsubmit.co/ajax/studio9.alex@gmail.com";

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("contact-status");
const submitBtn = form?.querySelector('button[type="submit"]');
const modal = document.getElementById("contact-modal");
const modalTitle = document.getElementById("contact-modal-title");
const modalBody = document.getElementById("contact-modal-body");
const modalCloseBtn = document.getElementById("contact-modal-close");

let sending = false;

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

function isSubmitSuccess(data) {
  return data?.success === true || data?.success === "true";
}

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.hidden = !message;
  statusEl.textContent = message;
  statusEl.className = `contact-status${type ? ` is-${type}` : ""}`;
}

function setSending(active) {
  sending = active;
  if (submitBtn instanceof HTMLButtonElement) {
    submitBtn.disabled = active;
    submitBtn.textContent = active ? t("contactPage.sending") : t("contactPage.submit");
  }
}

function openModal(titleKey, bodyKey, variant = "ok") {
  if (!modal) return;
  if (modalTitle) modalTitle.textContent = t(titleKey);
  if (modalBody) modalBody.textContent = t(bodyKey);
  modal.dataset.variant = variant;
  modal.hidden = false;
  document.body.classList.add("contact-modal-open");
  modalCloseBtn?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("contact-modal-open");
}

modalCloseBtn?.addEventListener("click", closeModal);
modal?.querySelector("[data-contact-modal-dismiss]")?.addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) closeModal();
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!(form instanceof HTMLFormElement) || sending) return;

  const data = new FormData(form);
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const topic = String(data.get("topic") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();
  const honey = String(data.get("_honey") ?? "").trim();

  if (!name || !email || !topic || !message) {
    setStatus(t("contactPage.errorRequired"), "error");
    return;
  }
  if (honey) return;

  setStatus("", "");
  setSending(true);

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        topic: topicLabel(topic),
        message,
        _subject: `Studio9 — ${topicLabel(topic)}`,
        _replyto: email,
        _template: "table",
        _captcha: "false",
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && isSubmitSuccess(result)) {
      form.reset();
      modal.dataset.reason = "";
      openModal("contactPage.modalSuccessTitle", "contactPage.modalSuccessBody", "ok");
      return;
    }

    const detail = typeof result?.message === "string" ? result.message.toLowerCase() : "";
    if (detail.includes("activate") || detail.includes("confirm")) {
      modal.dataset.reason = "activation";
      openModal("contactPage.modalActivationTitle", "contactPage.modalActivationBody", "error");
      return;
    }

    modal.dataset.reason = "";
    openModal("contactPage.modalErrorTitle", "contactPage.modalErrorBody", "error");
  } catch {
    openModal("contactPage.modalErrorTitle", "contactPage.modalErrorBody", "error");
  } finally {
    setSending(false);
  }
});

document.addEventListener("site:langchange", () => {
  if (!sending && submitBtn instanceof HTMLButtonElement) {
    submitBtn.textContent = t("contactPage.submit");
  }
  if (statusEl && !statusEl.hidden && statusEl.classList.contains("is-error")) {
    setStatus(t("contactPage.errorRequired"), "error");
  }
  if (modal && !modal.hidden && modalTitle && modalBody) {
    const variant = modal.dataset.variant === "error" ? "error" : "ok";
    const titleKey =
      modal.dataset.reason === "activation"
        ? "contactPage.modalActivationTitle"
        : variant === "error"
          ? "contactPage.modalErrorTitle"
          : "contactPage.modalSuccessTitle";
    const bodyKey =
      modal.dataset.reason === "activation"
        ? "contactPage.modalActivationBody"
        : variant === "error"
          ? "contactPage.modalErrorBody"
          : "contactPage.modalSuccessBody";
    if (modal.dataset.reason === "activation") {
      modalTitle.textContent = t(titleKey);
      modalBody.textContent = t(bodyKey);
    } else {
      openModal(titleKey, bodyKey, variant);
    }
  }
});
