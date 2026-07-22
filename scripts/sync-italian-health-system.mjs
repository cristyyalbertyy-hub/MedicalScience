import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");
const appRoot = join(siteRoot, "..", "ItalianHealthSystem");
const distDir = join(appRoot, "dist");
const targetDir = join(siteRoot, "italian-health-system");

if (!existsSync(join(appRoot, "package.json"))) {
  console.error("Italian Health System repo not found at:", appRoot);
  process.exit(1);
}

console.log("Building Italian Health System…");
execSync("npm run build", {
  cwd: appRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    STUDIO9_SITE_BASE: "/italian-health-system/",
    VITE_MEDIA_ORIGIN: "https://italian-health-system.vercel.app/",
  },
});

if (!existsSync(distDir)) {
  console.error("Build output missing:", distDir);
  process.exit(1);
}

if (existsSync(targetDir)) {
  for (const entry of readdirSync(targetDir)) {
    rmSync(join(targetDir, entry), { recursive: true, force: true });
  }
} else {
  mkdirSync(targetDir, { recursive: true });
}

cpSync(distDir, targetDir, { recursive: true });
console.log("Synced build to", targetDir);
