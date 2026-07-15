import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectAdminStats } from "../api/_lib/stats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toCsvRow(values) {
  return values
    .map((value) => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    })
    .join(",");
}

async function main() {
  const stats = await collectAdminStats();
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(__dirname, "..", "reports");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `admin-stats-${stamp}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(stats, null, 2)}\n`, "utf8");

  const csvPath = path.join(outDir, `admin-stats-${stamp}.csv`);
  const header = [
    "package_id",
    "title",
    "active_entitlements",
    "expired_entitlements",
    "active_users",
    "progress_documents",
    "users_with_progress",
  ];
  const rows = stats.packages.map((pkg) =>
    toCsvRow([
      pkg.package_id,
      pkg.title,
      pkg.active_entitlements,
      pkg.expired_entitlements,
      pkg.active_users,
      pkg.progress_documents,
      pkg.users_with_progress,
    ]),
  );
  fs.writeFileSync(csvPath, `${toCsvRow(header)}\n${rows.join("\n")}\n`, "utf8");

  console.log("Studio9 Medical — relatório admin");
  console.log(`Gerado: ${stats.generated_at}`);
  console.log("");
  console.log("Resumo");
  console.log(`  Utilizadores Auth: ${stats.summary.total_auth_users}`);
  console.log(`  Entitlements activos: ${stats.summary.active_entitlements}`);
  console.log(`  Utilizadores com acesso activo: ${stats.summary.distinct_users_with_active_access}`);
  console.log(`  Utilizadores com progresso: ${stats.summary.users_with_progress}`);
  console.log(`  Encomendas processadas (LS): ${stats.summary.orders_processed}`);
  console.log("");
  if (stats.traffic?.configured && !stats.traffic.error) {
    console.log(`Tráfego Vercel (${stats.traffic.period?.label ?? "produção"})`);
    console.log(`  Pageviews: ${stats.traffic.pageviews ?? 0}`);
    console.log(`  Visitantes únicos: ${stats.traffic.unique_visitors ?? 0}`);
    if (stats.traffic.daily?.length) {
      console.log("  Por dia:");
      for (const entry of stats.traffic.daily) {
        console.log(`    ${entry.date}: ${entry.pageviews}`);
      }
    }
    if (stats.traffic.devices?.length) {
      console.log("  Dispositivos:");
      for (const entry of stats.traffic.devices) {
        console.log(`    ${entry.device_label ?? entry.device_type}: ${entry.pageviews}`);
      }
    }
    if (stats.traffic.countries?.length) {
      console.log("  Top países:");
      for (const entry of stats.traffic.countries.slice(0, 10)) {
        const label = entry.country_name ?? entry.country_code ?? entry.country;
        console.log(`    ${label}: ${entry.pageviews}`);
      }
    }
    console.log("");
  } else if (stats.traffic?.message) {
    console.log(stats.traffic.message);
    console.log("");
  } else if (stats.traffic?.error) {
    console.log(`Tráfego Vercel: ${stats.traffic.error}`);
    console.log("");
  }
  console.log("Por disciplina (activos / users / progresso)");
  for (const pkg of stats.packages) {
    if (
      pkg.active_entitlements === 0 &&
      pkg.users_with_progress === 0 &&
      pkg.expired_entitlements === 0
    ) {
      continue;
    }
    console.log(
      `  ${pkg.title} (${pkg.package_id}): ${pkg.active_entitlements} activos · ${pkg.active_users} users · ${pkg.users_with_progress} c/ progresso`,
    );
  }
  console.log("");
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV:  ${csvPath}`);
  console.log("");
  console.log(stats.notes.traffic);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
