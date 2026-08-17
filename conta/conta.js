import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const EMAIL_KEY = "studio9.emailForSignIn";
const LAST_EMAIL_KEY = "studio9.lastSignedInEmail";
const cfg = window.STUDIO9_FIREBASE ?? {};

const authPanel = document.getElementById("auth-panel");
const packagesPanel = document.getElementById("packages-panel");
const signinForm = document.getElementById("signin-form");
const linkConfirmForm = document.getElementById("link-confirm-form");
const googleSigninBlock = document.getElementById("google-signin-block");
const googleSigninBtn = document.getElementById("google-signin-btn");
const emailLinkFallback = document.getElementById("email-link-fallback");
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
const passBanner = document.getElementById("pass-banner");
const passBilling = document.getElementById("pass-billing");
const passRenewal = document.getElementById("pass-renewal");
const passPortalLink = document.getElementById("pass-portal-link");
const authTitle = document.getElementById("auth-title");
const refreshAccessBtn = document.getElementById("refresh-access-btn");
const packagesEmptyHint = document.getElementById("packages-empty-hint");
const packagesFootnote = document.getElementById("packages-footnote");
const packagesProgressEntry = document.getElementById("packages-progress");
const packagesSnapEntry = document.getElementById("packages-snap");
const packagesSnapList = document.getElementById("packages-snap-list");
const STUDENT_PROGRESS_URL = "https://progress-azure-five.vercel.app/";
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/** @type {import('firebase/app').FirebaseApp | null} */
let app = null;
/** @type {import('firebase/auth').Auth | null} */
let auth = null;
/** @type {Record<string, { title: string, url?: string, free?: boolean }>} */
let packageMeta = {};
/** @type {Set<string>} */
let activePackageIds = new Set();
/** @type {null | Record<string, unknown>} */
let activePass = null;
/** @type {Awaited<ReturnType<typeof loadCatalog>> | null} */
let catalogData = null;
/** @type {{ key?: string, raw?: string, vars?: Record<string, string>, type?: string } | null} */
let lastStatus = null;
/** @type {boolean} */
let authResolved = false;
/** @type {boolean} */
let linkConfirmPending = false;

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
    if (signinNote) signinNote.textContent = t("accountPage.signInNoteFallback");
  } else {
    authSubtitle.textContent = t("accountPage.signedOutSubtitle");
    if (signinNote) signinNote.textContent = t("accountPage.signInNoteFallback");
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

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function setGoogleSignInBusy(active) {
  if (!(googleSigninBtn instanceof HTMLButtonElement)) return;
  googleSigninBtn.disabled = active;
}

async function handleGoogleRedirectResult() {
  if (!auth) return;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      rememberSignedInEmail(result.user.email ?? "");
      setStatus("", "");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : t("accountPage.googleSignInError");
    setStatus(message, "error");
  }
}

async function signInWithGoogle() {
  if (!auth) return;
  setStatusKey("accountPage.signingInGoogle");
  setGoogleSignInBusy(true);
  try {
    if (isMobileBrowser()) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    await signInWithPopup(auth, googleProvider);
    setStatus("", "");
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
    if (code === "auth/popup-closed-by-user") {
      setStatus("", "");
      return;
    }
    if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
      try {
        await signInWithRedirect(auth, googleProvider);
        return;
      } catch (redirectErr) {
        const message =
          redirectErr instanceof Error ? redirectErr.message : t("accountPage.googleSignInError");
        setStatus(message, "error");
        return;
      }
    }
    const message = err instanceof Error ? err.message : t("accountPage.googleSignInError");
    setStatus(message, "error");
  } finally {
    setGoogleSignInBusy(false);
  }
}

function continueUrl(email = "") {
  const host = window.location.hostname.replace(/^www\./, "");
  const url = new URL(`${window.location.protocol}//${host}/conta/`);
  const normalized = email.trim().toLowerCase();
  if (normalized) url.searchParams.set("studio9_email", normalized);
  return url.toString();
}

function resolveEmailForSignInLink() {
  const params = new URL(window.location.href).searchParams;
  const fromUrl = params.get("studio9_email")?.trim().toLowerCase() ?? "";
  if (fromUrl) return fromUrl;
  const pending = getStoredEmail(EMAIL_KEY);
  if (pending) return pending.toLowerCase();
  const last = getStoredEmail(LAST_EMAIL_KEY);
  if (last) return last.toLowerCase();
  return "";
}

function showLinkConfirmForm(prefillEmail = "") {
  if (!linkConfirmForm) return;
  linkConfirmPending = true;
  if (googleSigninBlock) googleSigninBlock.hidden = true;
  if (emailLinkFallback) emailLinkFallback.hidden = true;
  linkConfirmForm.hidden = false;
  if (authLoading) authLoading.hidden = true;
  setAuthPanelMode("signed-out");
  authSubtitle.textContent = t("accountPage.linkConfirmSubtitle");
  const emailInput = linkConfirmForm.email;
  if (emailInput instanceof HTMLInputElement && prefillEmail) {
    emailInput.value = prefillEmail;
  }
}

function hideLinkConfirmForm() {
  linkConfirmPending = false;
  if (linkConfirmForm) linkConfirmForm.hidden = true;
}

function cleanEmailLinkFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("apiKey") && !url.searchParams.has("oobCode")) return;
  url.searchParams.delete("apiKey");
  url.searchParams.delete("oobCode");
  url.searchParams.delete("mode");
  url.searchParams.delete("lang");
  url.searchParams.delete("studio9_email");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

async function attemptEmailLinkSignIn(email) {
  try {
    setStatusKey("accountPage.completingLink");
    await signInWithEmailLink(auth, email, window.location.href);
    rememberSignedInEmail(email);
    window.localStorage.removeItem(EMAIL_KEY);
    hideLinkConfirmForm();
    cleanEmailLinkFromUrl();
    setStatus("", "");
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : t("accountPage.sendError");
    setStatus(message, "error");
    showLinkConfirmForm(email);
    return false;
  }
}

async function completeEmailLinkSignIn() {
  if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return false;
  const email = resolveEmailForSignInLink();
  if (!email) {
    showLinkConfirmForm();
    return false;
  }
  return attemptEmailLinkSignIn(email);
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

/** @type {string | null} */
let lastAccountUid = null;

async function loadEntitlements(user) {
  activePackageIds = new Set();
  activePass = null;
  const idToken = await user.getIdToken(true);
  let res;
  try {
    res = await fetch("/api/my-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });
  } catch {
    throw new Error(t("accountPage.entitlementsNetworkError"));
  }

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`${t("accountPage.entitlementsError")} (HTTP ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `${t("accountPage.entitlementsError")} (HTTP ${res.status})`);
  }

  lastAccountUid = data.user_id ?? user.uid ?? null;

  for (const id of data.package_ids ?? []) {
    activePackageIds.add(id);
  }

  activePass = data.pass && data.pass.active ? data.pass : null;
}

function formatPassDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    const lang = window.SiteI18n?.getSiteLang?.() ?? "en";
    const locale =
      lang === "pt"
        ? "pt-PT"
        : lang === "es"
          ? "es"
          : lang === "fr"
            ? "fr"
            : lang === "it"
              ? "it"
              : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function renderPassBanner() {
  if (!passBanner) return;

  if (!activePass) {
    passBanner.hidden = true;
    if (passPortalLink) {
      passPortalLink.hidden = true;
      passPortalLink.removeAttribute("href");
    }
    return;
  }

  passBanner.hidden = false;

  if (passBilling) {
    passBilling.textContent =
      activePass.billing === "annual"
        ? t("accountPage.passBillingAnnual")
        : t("accountPage.passBillingMonthly");
  }

  if (passRenewal) {
    if (activePass.cancel_at_period_end && activePass.ends_at) {
      const when = formatPassDate(activePass.ends_at);
      passRenewal.textContent = when
        ? t("accountPage.passEndsOn", { date: when })
        : t("accountPage.passEndsSoon");
    } else if (activePass.renews_at) {
      const when = formatPassDate(activePass.renews_at);
      passRenewal.textContent = when
        ? t("accountPage.passRenewsOn", { date: when })
        : t("accountPage.passRenewsSoon");
    } else {
      passRenewal.textContent = t("accountPage.passActiveFallback");
    }
  }

  if (passPortalLink) {
    const portal = activePass.customer_portal_url || activePass.update_payment_url;
    if (portal) {
      passPortalLink.href = String(portal);
      passPortalLink.hidden = false;
    } else {
      passPortalLink.hidden = true;
      passPortalLink.removeAttribute("href");
    }
  }
}

function handleEntitlementsFailure(err, catalog) {
  activePass = null;
  renderPassBanner();
  renderPackages(catalog);
  const message =
    err instanceof Error && err.message ? err.message : t("accountPage.entitlementsError");
  setStatus(message, "error");
}

async function refreshAccountAccess() {
  if (!auth?.currentUser || !catalogData) return;
  setStatusKey("accountPage.refreshing");
  try {
    await loadEntitlements(auth.currentUser);
    renderPackages(catalogData);
    setStatus("", "");
  } catch (err) {
    handleEntitlementsFailure(err, catalogData);
  }
}

function formatOwnedFamilyDetail(ownedIds, group, catalog) {
  const bundleId = group.bundleId;
  if (bundleId && ownedIds.includes(bundleId)) {
    return t("accountPage.bundleOwned");
  }
  return ownedIds
    .map((id) => {
      const meta = packageMeta[id] ?? catalog.packageMeta?.[id] ?? {};
      return t(`pkg.${id}.title`, meta.title ?? id);
    })
    .join(" · ");
}

function getChapterPrefixCount(catalog, parentAppId, packageId) {
  const access = catalog.packageAccess?.[parentAppId];
  return access?.chaptersByPackageId?.[packageId]?.length ?? 0;
}

function getMergedChapterPrefixCount(catalog, parentAppId, ownedIds) {
  const access = catalog.packageAccess?.[parentAppId];
  if (!access) return 0;
  const merged = new Set();
  for (const id of ownedIds) {
    for (const prefix of access.chaptersByPackageId?.[id] ?? []) {
      merged.add(prefix);
    }
  }
  return merged.size;
}

function formatChapterAccessDetail(catalog, parentAppId, ownedIds, bundleId) {
  const total = getChapterPrefixCount(catalog, parentAppId, bundleId);
  const unlocked = getMergedChapterPrefixCount(catalog, parentAppId, ownedIds);
  if (!total) return "";
  if (unlocked >= total) return t("accountPage.chaptersFull");
  return t("accountPage.chaptersPartial", {
    unlocked: String(unlocked),
    total: String(total),
  });
}

function resolveBestOpenPackageId(ownedIds, group, catalog) {
  const bundleId = group.bundleId;
  if (bundleId && ownedIds.includes(bundleId)) return bundleId;

  let bestId = ownedIds[0];
  let bestCount = getChapterPrefixCount(catalog, bundleId, bestId);
  for (const id of ownedIds) {
    const count = getChapterPrefixCount(catalog, bundleId, id);
    if (count > bestCount) {
      bestId = id;
      bestCount = count;
    }
  }
  return bestId;
}

function getGroupedPackageIdSet(catalog) {
  const groups = catalog.pricingTableGroups ?? [];
  return new Set(groups.flatMap((group) => group.packageIds ?? []));
}

function buildOwnedRenderPlan(catalog, ownedSet) {
  const groups = catalog.pricingTableGroups ?? [];
  const groupedIds = getGroupedPackageIdSet(catalog);
  const catalogOrder = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ];
  const items = [];

  for (const id of catalogOrder) {
    if (id === "history-of-medicine") {
      for (const group of groups) {
        const ownedInGroup = (group.packageIds ?? []).filter((packageId) => ownedSet.has(packageId));
        if (ownedInGroup.length) {
          items.push({ type: "family", group, ownedIds: ownedInGroup });
        }
      }
    }
    if (groupedIds.has(id)) continue;
    if (ownedSet.has(id)) {
      items.push({ type: "standalone", id });
    }
  }

  return items;
}

function createPackageActions(packageId, meta) {
  const actions = document.createElement("div");
  actions.className = "acesso-package__actions";

  if (meta.url) {
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = meta.loginReady ? "btn btn-pilot-purchase" : "btn btn-open-access";
    openBtn.textContent = t("accountPage.open");
    openBtn.addEventListener("click", () => void openPackage(packageId, meta, openBtn));
    actions.appendChild(openBtn);
  } else {
    actions.innerHTML = `<span class="acesso-muted">${t("accountPage.soon")}</span>`;
  }

  return actions;
}

function appendStandalonePackageRow(list, id) {
  const meta = packageMeta[id] ?? { title: id };
  const li = document.createElement("li");
  li.className = `acesso-package is-active${meta.free ? " is-free" : ""}`;

  const info = document.createElement("div");
  info.className = "acesso-package__meta";
  const title = t(`pkg.${id}.title`, meta.title ?? id);
  const freeLabel = meta.free ? ` · ${t("accountPage.free")}` : "";
  info.innerHTML = `<strong>${title}</strong><small>${id}${freeLabel} · ${t("accountPage.active")}</small>`;

  li.append(info, createPackageActions(id, meta));
  list.appendChild(li);
}

function isFamilyBundleFullyOwned(ownedIds, group) {
  const bundleId = group.bundleId;
  return Boolean(bundleId && ownedIds.includes(bundleId));
}

function resolveFamilyAppUrl(packageId, parentAppId, catalog, isBundle) {
  const parentMeta = packageMeta[parentAppId] ?? catalog.packageMeta?.[parentAppId] ?? {};
  const packageMetaEntry = packageMeta[packageId] ?? catalog.packageMeta?.[packageId] ?? {};
  if (isBundle) {
    return parentMeta.url ?? packageMetaEntry.url;
  }
  return packageMetaEntry.url ?? parentMeta.url;
}

function appendFamilyPackageCard(list, packageId, parentAppId, catalog, isBundle) {
  const parentMeta = packageMeta[parentAppId] ?? catalog.packageMeta?.[parentAppId] ?? {};
  const packageMetaEntry = packageMeta[packageId] ?? catalog.packageMeta?.[packageId] ?? {};
  const openMeta = {
    ...parentMeta,
    ...packageMetaEntry,
    url: resolveFamilyAppUrl(packageId, parentAppId, catalog, isBundle),
  };

  const cardTitle = isBundle
    ? t(`pkg.${parentAppId}.title`, parentMeta.title ?? parentAppId)
    : t(`pkg.${packageId}.title`, packageMetaEntry.title ?? packageId);

  const li = document.createElement("li");
  li.className = "acesso-package is-active is-family-app";

  const info = document.createElement("div");
  info.className = "acesso-package__meta";
  info.innerHTML = `<strong>${cardTitle}</strong><small>${packageId} · ${t("accountPage.active")}</small>`;

  li.append(info, createPackageActions(packageId, openMeta));
  list.appendChild(li);
}

function appendFamilyGroupRow(list, group, ownedIds, catalog) {
  const parentAppId = group.bundleId;
  const fullBundle = isFamilyBundleFullyOwned(ownedIds, group);

  if (fullBundle) {
    appendFamilyPackageCard(list, parentAppId, parentAppId, catalog, true);
    return;
  }

  for (const id of group.packageIds ?? []) {
    if (!ownedIds.includes(id) || id === parentAppId) continue;
    appendFamilyPackageCard(list, id, parentAppId, catalog, false);
  }
}

async function fillSnapList() {
  if (!packagesSnapList || packagesSnapList.dataset.filled === "1") return;
  try {
    const res = await fetch("../snap/catalog.json");
    if (!res.ok) throw new Error("catalog");
    const data = await res.json();
    packagesSnapList.replaceChildren();
    for (const pkg of data.packages ?? []) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "acesso-snap-chip";
      a.href = `../snap/?package=${encodeURIComponent(pkg.id)}`;
      a.textContent = pkg.title;
      li.appendChild(a);
      packagesSnapList.appendChild(li);
    }
    packagesSnapList.dataset.filled = "1";
  } catch {
    packagesSnapList.replaceChildren();
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "acesso-snap-chip";
    a.href = "../snap/";
    a.textContent = t("accountPage.snapOpen");
    li.appendChild(a);
    packagesSnapList.appendChild(li);
  }
}

function renderPackages(catalog) {
  packagesList.replaceChildren();
  renderPassBanner();
  const ownedSet = new Set(
    [
      ...catalog.paidPackageIds,
      ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
    ].filter((id) => activePackageIds.has(id)),
  );

  if (packagesEmptyHint && auth?.currentUser?.email) {
    packagesEmptyHint.textContent = t("accountPage.emptySignedInHint", {
      email: auth.currentUser.email,
      uid: lastAccountUid ?? ". ",
    });
  }

  if (!ownedSet.size) {
    packagesList.hidden = true;
    packagesIntro.hidden = true;
    packagesEmpty.hidden = false;
    packagesFootnote.hidden = true;
    if (packagesProgressEntry) packagesProgressEntry.hidden = true;
    if (packagesSnapEntry) packagesSnapEntry.hidden = true;
    return;
  }

  packagesList.hidden = false;
  packagesIntro.hidden = false;
  packagesEmpty.hidden = true;
  packagesFootnote.hidden = false;
  if (packagesProgressEntry) packagesProgressEntry.hidden = false;
  if (packagesSnapEntry) {
    packagesSnapEntry.hidden = !activePass?.active;
    if (activePass?.active) void fillSnapList();
  }

  const plan = buildOwnedRenderPlan(catalog, ownedSet);
  for (const item of plan) {
    if (item.type === "family") {
      appendFamilyGroupRow(packagesList, item.group, item.ownedIds, catalog);
    } else {
      appendStandalonePackageRow(packagesList, item.id);
    }
  }
}

async function openPackage(packageId, meta, button) {
  if (!auth?.currentUser) {
    setStatusKey("accountPage.signInFirst", {}, "error");
    return;
  }

  if (!meta.url) return;

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

    const target = new URL(meta.url, window.location.origin);
    target.searchParams.set("studio9_handoff", data.custom_token);
    if (auth.currentUser.email) {
      target.searchParams.set("studio9_email", auth.currentUser.email);
    }
    target.searchParams.set("studio9_open", packageId);
    window.open(target.toString(), "_blank", "noopener,noreferrer");
  } catch (err) {
    const message =
      err instanceof Error && err.message !== t("accountPage.openError")
        ? err.message
        : t("accountPage.openError");
    setStatus(message, "error");
  } finally {
    button.disabled = false;
    button.textContent = t("accountPage.open");
  }
}

async function showSignedIn(user, catalog) {
  hideLinkConfirmForm();
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
  } catch (err) {
    handleEntitlementsFailure(err, catalog);
  }
}

function showSignedOut() {
  signedInPanel.hidden = true;
  packagesPanel.hidden = true;

  if (!authResolved) {
    if (googleSigninBlock) googleSigninBlock.hidden = true;
    if (emailLinkFallback) emailLinkFallback.hidden = true;
    if (linkConfirmForm) linkConfirmForm.hidden = true;
    if (authLoading) authLoading.hidden = false;
    authSubtitle.textContent = t("accountPage.checkingSession");
    return;
  }

  if (authLoading) authLoading.hidden = true;

  if (linkConfirmPending) {
    if (googleSigninBlock) googleSigninBlock.hidden = true;
    if (emailLinkFallback) emailLinkFallback.hidden = true;
    if (linkConfirmForm) linkConfirmForm.hidden = false;
    setAuthPanelMode("signed-out");
    return;
  }

  if (googleSigninBlock) googleSigninBlock.hidden = false;
  if (emailLinkFallback) emailLinkFallback.hidden = false;
  if (linkConfirmForm) linkConfirmForm.hidden = true;
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
      url: continueUrl(email),
      handleCodeInApp: true,
    });
    window.localStorage.setItem(EMAIL_KEY, email.toLowerCase());
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

googleSigninBtn?.addEventListener("click", () => {
  void signInWithGoogle();
});

linkConfirmForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth) return;
  const form = event.currentTarget;
  const email = form.email.value.trim().toLowerCase();
  if (!email) return;
  await attemptEmailLinkSignIn(email);
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
        uid: lastAccountUid ?? ". ",
      });
    }
    if (catalogData && auth?.currentUser) renderPackages(catalogData);
  });
}

async function openProgressDashboard(event) {
  event?.preventDefault();
  const trigger = event?.currentTarget;
  const targetUrl = new URL(STUDENT_PROGRESS_URL);
  targetUrl.searchParams.set("return_to", continueUrl());

  if (trigger instanceof HTMLButtonElement) {
    trigger.disabled = true;
    trigger.textContent = t("accountPage.opening");
  }

  function restoreTrigger() {
    if (trigger instanceof HTMLButtonElement) {
      trigger.disabled = false;
      trigger.textContent = t("accountPage.progressOpen");
    }
  }

  if (!auth?.currentUser) {
    window.location.href = targetUrl.toString();
    return;
  }

  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/create-custom-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("accountPage.openError"));
    targetUrl.searchParams.set("studio9_handoff", data.custom_token);
    window.location.href = targetUrl.toString();
  } catch {
    restoreTrigger();
    window.location.href = targetUrl.toString();
  }
}

async function bootstrap() {
  initLanguage();
  document.querySelectorAll("[data-student-progress]").forEach((el) => {
    if (el instanceof HTMLAnchorElement) {
      el.href = STUDENT_PROGRESS_URL;
    }
    el.addEventListener("click", (event) => void openProgressDashboard(event));
  });
  authPanel.hidden = false;
  if (authLoading) authLoading.hidden = false;
  if (googleSigninBlock) googleSigninBlock.hidden = true;
  if (emailLinkFallback) emailLinkFallback.hidden = true;
  authSubtitle.textContent = t("accountPage.checkingSession");

  if (!configured()) {
    if (authLoading) authLoading.hidden = true;
    setStatusKey("accountPage.firebaseError", {}, "error");
    return;
  }

  app = initializeApp(cfg);
  auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);

  await handleGoogleRedirectResult();
  await completeEmailLinkSignIn();

  catalogData = await loadCatalog();
  packageMeta = catalogData.packageMeta ?? {};

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
