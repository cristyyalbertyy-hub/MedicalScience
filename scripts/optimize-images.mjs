import sharp from "sharp";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "assets", "source");
const PUBLIC = path.join(ROOT, "public");
const WIDTHS = [640, 960, 1024, 1280];
const SOURCE_NAMES = ["hero", "video", "podcast", "infographic", "questions"];
const SOURCE_EXTS = [".png", ".jpeg", ".jpg"];

function findSourcePath(name) {
  for (const ext of SOURCE_EXTS) {
    const candidate = path.join(SOURCE, `${name}${ext}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function optimizeOne(name) {
  const input = findSourcePath(name);
  if (!input) {
    console.warn(`skip ${name}: no source file in ${SOURCE}`);
    return null;
  }

  const meta = await sharp(input).metadata();
  const maxWidth = Math.min(meta.width, 1280);
  const targetWidths = [...new Set([...WIDTHS.filter((w) => w <= maxWidth), maxWidth])].sort(
    (a, b) => a - b,
  );

  const sizes = [];

  for (const width of targetWidths) {
    const resized = sharp(input).resize(width, null, { withoutEnlargement: true });
    const webpPath = path.join(PUBLIC, `${name}-${width}.webp`);
    const avifPath = path.join(PUBLIC, `${name}-${width}.avif`);

    await resized.clone().webp({ quality: 82, effort: 6 }).toFile(webpPath);
    await resized.clone().avif({ quality: 62, effort: 4 }).toFile(avifPath);

    const { width: w, height: h } = await sharp(webpPath).metadata();

    sizes.push({
      width: w,
      height: h,
      webpKb: Math.round(statSync(webpPath).size / 1024),
      avifKb: Math.round(statSync(avifPath).size / 1024),
    });

    console.log(`  ${name}-${width}: ${w}x${h}  webp ${sizes.at(-1).webpKb}KB  avif ${sizes.at(-1).avifKb}KB`);
  }

  return { name, sourceWidth: meta.width, sourceHeight: meta.height, sizes };
}

console.log("Optimizing homepage images…\n");
console.log(`Sources: ${SOURCE}`);
console.log(`Output:  ${PUBLIC}\n`);

const results = [];
for (const name of SOURCE_NAMES) {
  console.log(name);
  const result = await optimizeOne(name);
  if (result) results.push(result);
  console.log("");
}

if (!results.length) {
  console.error("No images processed. Add source masters to assets/source/ and retry.");
  process.exit(1);
}

const largest = results.map((r) => {
  const last = r.sizes.at(-1);
  return `${r.name}: ${last.width}x${last.height}`;
});
console.log("Largest variants:", largest.join(", "));
