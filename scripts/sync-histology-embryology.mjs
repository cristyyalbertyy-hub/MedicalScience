import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");
const appRoot = join(siteRoot, "..", "Histology And  Embryology");
const distDir = join(appRoot, "dist");
const mediaOrigin = "https://histology-embryology.vercel.app/";

const targets = [
  { slug: "histology", base: "/histology/" },
  { slug: "embryology", base: "/embryology/" },
  { slug: "histology-embryology", base: "/histology-embryology/" },
];

if (!existsSync(join(appRoot, "package.json"))) {
  console.error("Histology And Embryology repo not found at:", appRoot);
  process.exit(1);
}

function syncDistTo(targetDir) {
  if (existsSync(targetDir)) {
    for (const entry of readdirSync(targetDir)) {
      rmSync(join(targetDir, entry), { recursive: true, force: true });
    }
  } else {
    mkdirSync(targetDir, { recursive: true });
  }
  cpSync(distDir, targetDir, { recursive: true });
}

for (const { slug, base } of targets) {
  console.log(`Building Histology And Embryology for ${slug}…`);
  execSync("npm run build", {
    cwd: appRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      STUDIO9_SITE_BASE: base,
      VITE_MEDIA_ORIGIN: mediaOrigin,
    },
  });

  if (!existsSync(distDir)) {
    console.error("Build output missing:", distDir);
    process.exit(1);
  }

  const targetDir = join(siteRoot, slug);
  syncDistTo(targetDir);
  console.log("Synced build to", targetDir);
}
