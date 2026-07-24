import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");
const appRoot = join(siteRoot, "..", "HealthTechnologyAssessment");
const distDir = join(appRoot, "dist");
const targetDir = join(siteRoot, "health-technology-assessments");

if (!existsSync(join(appRoot, "package.json"))) {
  console.error("Health Technology Assessment repo not found at:", appRoot);
  process.exit(1);
}

console.log("Building Health Technology Assessment…");
execSync("npm run build", {
  cwd: appRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    STUDIO9_SITE_BASE: "/health-technology-assessments/",
    VITE_MEDIA_ORIGIN: "https://health-technology-assessments.vercel.app/",
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
