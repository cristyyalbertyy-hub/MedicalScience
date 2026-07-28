import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const solitaireRoot = path.join(siteRoot, "..");

const reactApps = [
  "Physics",
  "Statistics",
  "History_Medicine",
  "Moral Philosophy",
  "HealthTechnologyAssessment",
  "Biology",
  "Human Anatomy",
];

function patchAuthContext(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("skip missing", filePath);
    return;
  }
  let text = fs.readFileSync(filePath, "utf8");
  if (text.includes("returnToAccount")) {
    console.log("skip auth (done)", filePath);
    return;
  }

  text = text.replace(
    "  sendMagicLink: (email: string) => Promise<{ error: string | null }>\n  logout: () => Promise<void>",
    "  sendMagicLink: (email: string) => Promise<{ error: string | null }>\n  returnToAccount: () => void\n  logout: () => Promise<void>",
  );

  text = text.replace(
    "  const logout = useCallback(async () => {",
    `  const returnToAccount = useCallback(() => {
    window.location.assign(ACCOUNT_URL)
  }, [])

  const logout = useCallback(async () => {`,
  );

  text = text.replace(
    "      sendMagicLink,\n      logout,\n      refreshEntitlement,",
    "      sendMagicLink,\n      returnToAccount,\n      logout,\n      refreshEntitlement,",
  );

  text = text.replace(
    "      sendMagicLink,\n      logout,\n      refreshEntitlement,\n    ],",
    "      sendMagicLink,\n      returnToAccount,\n      logout,\n      refreshEntitlement,\n    ],",
  );

  text = text.replace(
    "      sendMagicLink,\n      logout,\n    ],",
    "      sendMagicLink,\n      returnToAccount,\n      logout,\n    ],",
  );

  fs.writeFileSync(filePath, text, "utf8");
  console.log("patched auth", filePath);
}

function patchApp(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("skip missing", filePath);
    return;
  }
  let text = fs.readFileSync(filePath, "utf8");
  if (text.includes("returnToAccount")) {
    console.log("skip app (done)", filePath);
    return;
  }

  text = text.replace(
    "const { userEmail, logout } = useAuth();",
    "const { userEmail, returnToAccount } = useAuth();",
  );
  text = text.replace(
    "const { userEmail, logout } = useAuth()",
    "const { userEmail, returnToAccount } = useAuth()",
  );
  text = text.replace(
    `<button type="button" className="btn-ghost" onClick={() => void logout()}>\n                Sair\n              </button>`,
    `<button type="button" className="btn-ghost" onClick={returnToAccount}>\n                Minha conta\n              </button>`,
  );

  fs.writeFileSync(filePath, text, "utf8");
  console.log("patched app", filePath);
}

function patchAuthGate(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("skip missing", filePath);
    return;
  }
  let text = fs.readFileSync(filePath, "utf8");
  if (text.includes("Minha conta</button>`") && !text.includes('class="btn-ghost">Sair</button>')) {
    console.log("skip auth-gate (done)", filePath);
    return;
  }

  text = text.replaceAll(
    `<button type="button" class="btn-ghost">Sair</button>`,
    `<button type="button" class="btn-ghost">Minha conta</button>`,
  );

  text = text.replace(
    `    wrap.querySelector("button")?.addEventListener("click", () => {
      studio9Session = null;
      accessGranted = false;
      sessionStorage.removeItem("studio9_from_conta");
      sessionStorage.removeItem("studio9_open_package");
      sessionStorage.removeItem("studio9.displayEmail");
      void signOut(auth).then(() => {
        window.location.assign(ACCOUNT_URL);
      });
    });`,
    `    wrap.querySelector("button")?.addEventListener("click", () => {
      window.location.assign(ACCOUNT_URL);
    });`,
  );

  text = text.replace(
    `    wrap.querySelector("button")?.addEventListener("click", () => {
      studio9Session = null;
      accessGranted = false;
      sessionStorage.removeItem("studio9.displayEmail");
      sessionStorage.removeItem("studio9_from_conta");
      if (auth) {
        void signOut(auth).then(() => {
          window.location.assign(ACCOUNT_URL);
        });
        return;
      }
      window.location.assign(ACCOUNT_URL);
    });`,
    `    wrap.querySelector("button")?.addEventListener("click", () => {
      window.location.assign(ACCOUNT_URL);
    });`,
  );

  fs.writeFileSync(filePath, text, "utf8");
  console.log("patched auth-gate", filePath);
}

for (const appName of reactApps) {
  const appRoot = path.join(solitaireRoot, appName);
  patchAuthContext(path.join(appRoot, "src", "context", "AuthContext.tsx"));
  const appFile = fs.existsSync(path.join(appRoot, "src", "App.tsx"))
    ? path.join(appRoot, "src", "App.tsx")
    : path.join(appRoot, "src", "App.jsx");
  patchApp(appFile);
}

patchAuthGate(path.join(solitaireRoot, "Genetics", "auth-gate.js"));
patchAuthGate(path.join(solitaireRoot, "Informatic", "auth-gate.js"));

console.log("Done.");
