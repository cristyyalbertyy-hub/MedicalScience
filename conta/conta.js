import { initializeApp } from "https://esm.sh/firebase@12.15.0/app";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "https://esm.sh/firebase@12.15.0/auth";

const EMAIL_KEY = "studio9.emailForSignIn";
const LAST_EMAIL_KEY = "studio9.lastSignedInEmail";
const cfg = window.STUDIO9_FIREBASE ?? {};

const authPanel = document.getElementById("auth-panel");
const packagesPanel = document.getElementById("packages-panel");
const signinForm = document.getElementById("signin-form");
const signedInPanel = document.getElementById("signed-in-panel");
const signedInEmail = document.getElementById("signed-in-email");
const authStatus = document.getElementById("auth-status");
const authSubtitle = document.getElementById("auth-subtitle");
const authLoading = document.getElementById("auth-loading");
const sendLinkBtn = document.getElementById("send-link-btn");
const signinNote = document.getElementById("signin-note");
const packagesList = document.getElementById("packages-list");
const packagesIntro = document.getElementById("packages-intro");
const packagesEmpty = document.getElementById("packages-empty");
const authTitle = document.getElementById("auth-title");
const refreshAccessBtn = document.getElementById("refresh-access-btn");
const packagesEmptyHint = document.getElementById("packages-empty-hint");

/** @type {import('firebase/app').FirebaseApp | null} */
let app = null;
/** @type {import('firebase/auth').Auth | null} */
let auth = null;
/** @type {Record<string, { title: string, url?: string, free?: boolean }>} */
let packageMeta = {};
/** @type {Set<string>} */
let activePackageIds = new Set();
/** @type {Awaited<ReturnType<typeof loadCatalog>> | null} */
let catalogData = null;
/** @type {{ key?: string, raw?: string, vars?: Record<string, string>, type?: string } | null} */
let lastStatus = null;
/** @type {boolean} */
let authResolved = false;

function getStoredEmail(key) {
  try {
    return window.localStorage.getItem(key)?.trim() ?? "";
  } catch {
    return "";
  }
}

function rememberSignedInEmail(email) {
  if (!email) return;
  try {
    window.localStorage.setItem(LAST_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    /* ignore */
  }
}

function configureSignInForm() {
  if (!signinForm) return;

  const emailInput = signinForm.email;
  const pendingEmail = getStoredEmail(EMAIL_KEY);
  const lastEmail = getStoredEmail(LAST_EMAIL_KEY);

  if (pendingEmail) {
    emailInput.value = pendingEmail;
    authSubtitle.textContent = t("accountPage.linkPendingSubtitle", { email: pendingEmail });
    if (sendLinkBtn) sendLinkBtn.textContent = t("accountPage.resendLink");
    if (signinNote) signinNote.textContent = t("accountPage.linkPendingNote");
    return;
  }

  if (lastEmail && !emailInput.value.trim()) {
    emailInput.value = lastEmail;
  }

  if (lastEmail) {
    authSubtitle.textContent = t("accountPage.signedOutReturningSubtitle");
    if (signinNote) signinNote.textContent = t("accountPage.signInNoteReturning");
  } else {
    authSubtitle.textContent = t("accountPage.signedOutSubtitle");
    if (signinNote) signinNote.textContent = t("accountPage.signInNote");
  }

  if (sendLinkBtn) sendLinkBtn.textContent = t("accountPage.sendLink");
}

function t(key, vars = {}) {
  const lang = window.SiteI18n?.getSiteLang?.() ?? "en";
  let text = window.SiteI18n?.siteT(lang, key) ?? key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(`{${name}}`, value);
  }
  return text;
}

function configured() {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

function setStatus(message, type = "") {
  lastStatus = message ? { raw: message, type } : null;
  authStatus.hidden = !message;
  authStatus.textContent = message;
  authStatus.className = `acesso-status${type ? ` is-${type}` : ""}`;
}

function setStatusKey(key, vars = {}, type = "") {
  lastStatus = { key, vars, type };
  authStatus.hidden = false;
  authStatus.textContent = t(key, vars);
  authStatus.className = `acesso-status${type ? ` is-${type}` : ""}`;
}

function refreshStatusMessage() {
  if (!lastStatus) return;
  authStatus.textContent = lastStatus.raw
    ? lastStatus.raw
    : t(lastStatus.key ?? "", lastStatus.vars ?? {});
}

function continueUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function cleanEmailLinkFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("apiKey") && !url.searchParams.has("oobCode")) return;
  url.searchParams.delete("apiKey");
  url.searchParams.delete("oobCode");
  url.searchParams.delete("mode");
  url.searchParams.delete("lang");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

async function completeEmailLinkSignIn() {
  if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return;
  let email = window.localStorage.getItem(EMAIL_KEY);
  if (!email) {
    email = window.prompt(t("accountPage.confirmEmail"));
  }
  if (!email) return;
  await signInWithEmailLink(auth, email, window.location.href);
  rememberSignedInEmail(email);
  window.localStorage.removeItem(EMAIL_KEY);
  cleanEmailLinkFromUrl();
}

async function loadCatalog() {
  const res = await fetch("/packages/catalog.json");
  if (!res.ok) throw new Error(t("accountPage.catalogError"));
  return res.json();
}

function setAuthPanelMode(mode) {
  if (!authTitle) return;
  if (mode === "signed-in") {
    authTitle.dataset.i18n = "accountPage.sessionTitle";
    authTitle.textContent = t("accountPage.sessionTitle");
    return;
  }
  authTitle.dataset.i18n = "accountPage.signInTitle";
  authTitle.textContent = t("accountPage.signInTitle");
}

async function loadEntitlements(user) {
  activePackageIds = new Set();
  const idToken = await user.getIdToken();
  const res = await fetch("/api/my-entitlements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || t("accountPage.entitlementsError"));
  }
  for (const id of data.package_ids ?? []) {
    activePackageIds.add(id);
  }
}

async function refreshAccountAccess() {
  if (!auth?.currentUser || !catalogData) return;
  setStatusKey("accountPage.refreshing");
  try {
    await loadEntitlements(auth.currentUser);
    renderPackages(catalogData);
    setStatus("", "");
  } catch {
    setStatusKey("accountPage.entitlementsError", {}, "error");
  }
}

function renderPackages(catalog) {
  packagesList.replaceChildren();
  const ownedIds = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ].filter((id) => activePackageIds.has(id));

  if (packagesEmptyHint && auth?.currentUser?.email) {
    packagesEmptyHint.textContent = t("accountPage.emptySignedInHint", {
      email: auth.currentUser.email,
    });
  }

  if (!ownedIds.length) {
    packagesList.hidden = true;
    packagesIntro.hidden = true;
    packagesEmpty.hidden = false;
    packagesFootnote.hidden = true;
    return;
  }

  packagesList.hidden = false;
  packagesIntro.hidden = false;
  packagesEmpty.hidden = true;
  packagesFootnote.hidden = false;

  for (const id of ownedIds) {
    const meta = packageMeta[id] ?? { title: id };
    const li = document.createElement("li");
    li.className = `acesso-package is-active${meta.free ? " is-free" : ""}`;

    const info = document.createElement("div");
    info.className = "acesso-package__meta";
    const freeLabel = meta.free ? ` · ${t("accountPage.free")}` : "";
    info.innerHTML = `<strong>${meta.title}</strong><small>${id}${freeLabel} · ${t("accountPage.active")}</small>`;

    const actions = document.createElement("div");
    actions.className = "acesso-package__actions";

    if (meta.url) {
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "btn btn-primary";
      openBtn.textContent = t("accountPage.open");
      openBtn.addEventListener("click", () => void openPackage(meta.url, openBtn));
      actions.appendChild(openBtn);
    } else {
      actions.innerHTML = `<span class="acesso-muted">${t("accountPage.soon")}</span>`;
    }

    li.append(info, actions);
    packagesList.appendChild(li);
  }
}

async function openPackage(appUrl, button) {
  if (!auth?.currentUser) {
    setStatusKey("accountPage.signInFirst", {}, "error");
    return;
  }

  button.disabled = true;
  button.textContent = t("accountPage.opening");
  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/create-custom-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("accountPage.openError"));

    const target = new URL(appUrl, window.location.origin);
    target.searchParams.set("studio9_handoff", data.custom_token);
    window.location.href = target.toString();
  } catch (err) {
    const message =
      err instanceof Error && err.message !== t("accountPage.openError")
        ? err.message
        : t("accountPage.openError");
    setStatus(message, "error");
    button.disabled = false;
    button.textContent = t("accountPage.open");
  }
}

async function showSignedIn(user, catalog) {
  signinForm.hidden = true;
  signedInPanel.hidden = false;
  if (authLoading) authLoading.hidden = true;
  signedInEmail.textContent = user.email ?? user.uid;
  rememberSignedInEmail(user.email ?? "");
  setAuthPanelMode("signed-in");
  authSubtitle.textContent = t("accountPage.signedInSubtitle");
  packagesPanel.hidden = false;
  try {
    await loadEntitlements(user);
    renderPackages(catalog);
    setStatus("", "");
  } catch {
    renderPackages(catalog);
    setStatusKey("accountPage.entitlementsError", {}, "error");
  }
}

function showSignedOut() {
  signedInPanel.hidden = true;
  packagesPanel.hidden = true;

  if (!authResolved) {
    signinForm.hidden = true;
    if (authLoading) authLoading.hidden = false;
    authSubtitle.textContent = t("accountPage.checkingSession");
    return;
  }

  if (authLoading) authLoading.hidden = true;
  signinForm.hidden = false;
  setAuthPanelMode("signed-out");
  configureSignInForm();
}

refreshAccessBtn?.addEventListener("click", () => {
  void refreshAccountAccess();
});

signinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  setStatusKey("accountPage.sendingLink");
  try {
    await sendSignInLinkToEmail(auth, email, {
      url: continueUrl(),
      handleCodeInApp: true,
    });
    window.localStorage.setItem(EMAIL_KEY, email);
    setStatusKey("accountPage.linkSent", { email }, "ok");
    configureSignInForm();
  } catch (err) {
    const message = err instanceof Error ? err.message : t("accountPage.sendError");
    if (message.includes("auth/quota-exceeded")) {
      setStatusKey("accountPage.quotaError", {}, "error");
    } else {
      setStatus(message.includes("accountPage.") ? t(message) : message, "error");
    }
  }
});

document.getElementById("signout-btn")?.addEventListener("click", () => {
  if (!auth) return;
  void signOut(auth);
});

function initLanguage() {
  if (!window.SiteI18n) return;
  SiteI18n.initSiteLanguage();
  document.addEventListener("site:langchange", () => {
    if (auth?.currentUser) {
      setAuthPanelMode("signed-in");
      authSubtitle.textContent = t("accountPage.signedInSubtitle");
    } else if (authResolved) {
      setAuthPanelMode("signed-out");
      configureSignInForm();
    } else if (authLoading && !authLoading.hidden) {
      authSubtitle.textContent = t("accountPage.checkingSession");
    }
    refreshStatusMessage();
    if (packagesEmptyHint && auth?.currentUser?.email) {
      packagesEmptyHint.textContent = t("accountPage.emptySignedInHint", {
        email: auth.currentUser.email,
      });
    }
    if (catalogData && auth?.currentUser) renderPackages(catalogData);
  });
}

async function bootstrap() {
  initLanguage();
  authPanel.hidden = false;
  if (authLoading) authLoading.hidden = false;
  signinForm.hidden = true;
  authSubtitle.textContent = t("accountPage.checkingSession");

  if (!configured()) {
    if (authLoading) authLoading.hidden = true;
    setStatusKey("accountPage.firebaseError", {}, "error");
    return;
  }

  app = initializeApp(cfg);
  auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);

  catalogData = await loadCatalog();
  packageMeta = catalogData.packageMeta ?? {};

  await completeEmailLinkSignIn().catch(() => undefined);
  cleanEmailLinkFromUrl();

  onAuthStateChanged(auth, (user) => {
    authResolved = true;
    if (user) {
      void showSignedIn(user, catalogData);
    } else {
      showSignedOut();
    }
  });
}

bootstrap().catch((err) => {
  const message = err instanceof Error ? err.message : t("accountPage.startError");
  setStatus(message, "error");
});
