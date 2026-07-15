import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  entryPoints: [path.join(root, "scripts/analytics-init.js")],
  outfile: path.join(root, "analytics.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  logLevel: "info",
});

console.log("Built analytics.js");
