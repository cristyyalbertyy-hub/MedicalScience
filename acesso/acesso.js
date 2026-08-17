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

function configured() {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

function setStatus(message, type = "") {
  authStatus.hidden = !message;
  authStatus.textContent = message;
  authStatus.className = `acesso-status${type ? ` is-${type}` : ""}`;
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
    email = window.prompt("Confirme o email usado para pedir o link");
  }
  if (!email) return;
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_KEY);
  cleanEmailLinkFromUrl();
}

async function loadCatalog() {
  const res = await fetch("/packages/catalog.json");
  if (!res.ok) throw new Error("Catálogo indisponível.");
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
  const ids = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ];

  for (const id of ids) {
    const meta = packageMeta[id] ?? { title: id };
    const active = activePackageIds.has(id);
    const li = document.createElement("li");
    li.className = `acesso-package${active ? " is-active" : ""}${meta.free ? " is-free" : ""}`;

    const info = document.createElement("div");
    info.className = "acesso-package__meta";
    info.innerHTML = `<strong>${meta.title}</strong><small>${id}${meta.free ? " · grátis" : ""}${active ? " · activo" : ""}</small>`;

    const actions = document.createElement("div");
    actions.className = "acesso-package__actions";

    if (meta.url && (active || meta.free)) {
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "btn btn-primary";
      openBtn.textContent = "Abrir";
      openBtn.addEventListener("click", () => void openPackage(meta.url, openBtn));
      actions.appendChild(openBtn);
    } else if (!meta.url) {
      actions.innerHTML = `<span class="acesso-muted">Em breve</span>`;
    } else {
      const buy = document.createElement("a");
      buy.className = "btn btn-secondary";
      buy.href = "../precos/";
      buy.textContent = "Comprar";
      actions.appendChild(buy);
    }

    li.append(info, actions);
    packagesList.appendChild(li);
  }
}

async function openPackage(appUrl, button) {
  if (!auth?.currentUser) {
    setStatus("Inicie sessão primeiro.", "error");
    return;
  }

  button.disabled = true;
  button.textContent = "A abrir…";
  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/create-custom-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Não foi possível abrir o pacote.");

    const target = new URL(appUrl, window.location.origin);
    target.searchParams.set("studio9_handoff", data.custom_token);
    window.location.href = target.toString();
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Erro ao abrir.", "error");
    button.disabled = false;
    button.textContent = "Abrir";
  }
}

async function showSignedIn(user, catalog) {
  signinForm.hidden = true;
  signedInPanel.hidden = false;
  signedInEmail.textContent = user.email ?? user.uid;
  authSubtitle.textContent =
    "Conta activa neste browser. Use «Abrir» para entrar nos pacotes sem novo email.";
  await loadEntitlements(user.uid);
  renderPackages(catalog);
  packagesPanel.hidden = false;
  setStatus("", "");
}

function showSignedOut() {
  signinForm.hidden = false;
  signedInPanel.hidden = true;
  packagesPanel.hidden = true;
  authSubtitle.textContent =
    "Primeira vez? Envie um magic link. Depois disso, volte sempre a esta página.";
}

signinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  setStatus("A enviar link…", "");
  try {
    await sendSignInLinkToEmail(auth, email, {
      url: continueUrl(),
      handleCodeInApp: true,
    });
    window.localStorage.setItem(EMAIL_KEY, email);
    setStatus(`Link enviado para ${email}. Abra o email neste browser.`, "ok");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao enviar.";
    if (message.includes("auth/quota-exceeded")) {
      setStatus(
        "Quota diária de emails esgotada. Tente amanhã ou use a sessão já activa.",
        "error",
      );
    } else {
      setStatus(message, "error");
    }
  }
});

document.getElementById("signout-btn")?.addEventListener("click", () => {
  if (!auth) return;
  void signOut(auth);
});

async function bootstrap() {
  authPanel.hidden = false;

  if (!configured()) {
    setStatus("Conta indisponível. Firebase não configurado neste deploy.", "error");
    return;
  }

  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);

  const catalog = await loadCatalog();
  packageMeta = catalog.packageMeta ?? {};

  await completeEmailLinkSignIn().catch(() => undefined);
  cleanEmailLinkFromUrl();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      void showSignedIn(user, catalog);
    } else {
      showSignedOut();
    }
  });
}

bootstrap().catch((err) => {
  setStatus(err instanceof Error ? err.message : "Erro ao iniciar.", "error");
});
