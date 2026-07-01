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
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://esm.sh/firebase@12.15.0/firestore";

const EMAIL_KEY = "studio9.emailForSignIn";
const cfg = window.STUDIO9_FIREBASE ?? {};

const authPanel = document.getElementById("auth-panel");
const packagesPanel = document.getElementById("packages-panel");
const signinForm = document.getElementById("signin-form");
const signedInPanel = document.getElementById("signed-in-panel");
const signedInEmail = document.getElementById("signed-in-email");
const authStatus = document.getElementById("auth-status");
const authSubtitle = document.getElementById("auth-subtitle");
const packagesList = document.getElementById("packages-list");
const packagesIntro = document.getElementById("packages-intro");
const packagesEmpty = document.getElementById("packages-empty");
const packagesFootnote = document.getElementById("packages-footnote");

/** @type {import('firebase/app').FirebaseApp | null} */
let app = null;
/** @type {import('firebase/auth').Auth | null} */
let auth = null;
/** @type {import('firebase/firestore').Firestore | null} */
let db = null;
/** @type {Record<string, { title: string, url?: string, free?: boolean }>} */
let packageMeta = {};
/** @type {Set<string>} */
let activePackageIds = new Set();
/** @type {Awaited<ReturnType<typeof loadCatalog>> | null} */
let catalogData = null;
/** @type {{ key?: string, raw?: string, vars?: Record<string, string>, type?: string } | null} */
let lastStatus = null;

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

function refreshAuthSubtitle(signedIn) {
  authSubtitle.textContent = signedIn
    ? t("accountPage.signedInSubtitle")
    : t("accountPage.signedOutSubtitle");
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
  window.localStorage.removeItem(EMAIL_KEY);
  cleanEmailLinkFromUrl();
}

async function loadCatalog() {
  const res = await fetch("/packages/catalog.json");
  if (!res.ok) throw new Error(t("accountPage.catalogError"));
  return res.json();
}

async function loadEntitlements(userId) {
  activePackageIds = new Set();
  if (!db) return;
  const snap = await getDocs(
    query(collection(db, "entitlements"), where("user_id", "==", userId)),
  );
  const now = new Date();
  snap.forEach((doc) => {
    const data = doc.data();
    const expires = new Date(data.expires_at);
    if (!Number.isNaN(expires.getTime()) && expires > now) {
      activePackageIds.add(data.package_id);
    }
  });
}

function renderPackages(catalog) {
  packagesList.replaceChildren();
  const ownedIds = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ].filter((id) => activePackageIds.has(id));

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
  signedInEmail.textContent = user.email ?? user.uid;
  refreshAuthSubtitle(true);
  await loadEntitlements(user.uid);
  renderPackages(catalog);
  packagesPanel.hidden = false;
  setStatus("", "");
}

function showSignedOut() {
  signinForm.hidden = false;
  signedInPanel.hidden = true;
  packagesPanel.hidden = true;
  refreshAuthSubtitle(false);
}

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
    refreshAuthSubtitle(Boolean(auth?.currentUser));
    refreshStatusMessage();
    if (catalogData && auth?.currentUser) renderPackages(catalogData);
  });
}

async function bootstrap() {
  initLanguage();
  authPanel.hidden = false;

  if (!configured()) {
    setStatusKey("accountPage.firebaseError", {}, "error");
    return;
  }

  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);

  catalogData = await loadCatalog();
  packageMeta = catalogData.packageMeta ?? {};

  await completeEmailLinkSignIn().catch(() => undefined);
  cleanEmailLinkFromUrl();

  onAuthStateChanged(auth, (user) => {
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
