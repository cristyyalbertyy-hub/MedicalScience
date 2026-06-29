import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function env(name, fallback = "") {
  return (process.env[name] || fallback).trim();
}

const cfg = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
};

const out = `window.STUDIO9_FIREBASE = ${JSON.stringify(cfg, null, 2)};\n`;
const target = path.join(__dirname, "..", "acesso", "firebase-config.js");
fs.writeFileSync(target, out, "utf8");
console.log("Wrote", target);
