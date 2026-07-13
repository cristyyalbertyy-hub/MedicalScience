const form = document.getElementById("grant-form");
const packagesRoot = document.getElementById("packages-root");
const statusEl = document.getElementById("grant-status");
const resultSection = document.getElementById("grant-result");
const resultSummary = document.getElementById("result-summary");
const resultLinks = document.getElementById("result-links");
const selectAllPaidBtn = document.getElementById("select-all-paid");

const PACKAGE_GROUPS_BEFORE_ID = "history-of-medicine";

/** @type {Record<string, { title: string, url?: string, free?: boolean, parentApp?: string, bundleOf?: string[] }>} */
let packageMeta = {};
/** @type {string[]} */
let paidIds = [];

function getChapterHint(catalog, packageId) {
  for (const access of Object.values(catalog.packageAccess ?? {})) {
    const chapters = access.chaptersByPackageId?.[packageId];
    if (chapters) return `${chapters.length} cap. (${chapters.join(", ")})`;
  }
  return "";
}

function createPackageCheckbox(id, meta, catalog, { isBundle = false } = {}) {
  const label = document.createElement("label");
  label.className = `admin-package${meta.free ? " is-free" : ""}${isBundle ? " is-bundle" : ""}${meta.parentApp ? " is-part" : ""}`;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = "package_ids";
  input.value = id;

  const text = document.createElement("span");
  const chapterHint = getChapterHint(catalog, id);
  const partNote = meta.parentApp && !isBundle ? ` · parte de ${meta.parentApp}` : "";
  const bundleNote = isBundle ? " · pacote completo" : "";
  const chapterNote = chapterHint ? ` · ${chapterHint}` : "";
  text.innerHTML = `<strong>${meta.title ?? id}</strong><small>${id}${partNote}${bundleNote}${chapterNote}${meta.free ? " · grátis" : ""}</small>`;

  label.append(input, text);
  return label;
}

function appendFamilyGroup(root, group, catalog) {
  const section = document.createElement("div");
  section.className = "admin-packages-family";

  const heading = document.createElement("h3");
  heading.className = "admin-packages-family__title";
  heading.textContent = group.title ?? group.id;
  section.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "admin-packages-family__grid";

  for (const id of group.packageIds ?? []) {
    const meta = packageMeta[id] ?? catalog.packageMeta?.[id] ?? { title: id };
    const isBundle = id === group.bundleId || Boolean(meta.bundleOf?.length);
    grid.appendChild(createPackageCheckbox(id, meta, catalog, { isBundle }));
  }

  section.appendChild(grid);
  root.appendChild(section);
}

function renderPackages(catalog) {
  packagesRoot.replaceChildren();
  const groups = catalog.pricingTableGroups ?? [];
  const groupedIds = new Set(groups.flatMap((group) => group.packageIds ?? []));
  const ids = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ];

  let insertedGroups = false;
  for (const id of ids) {
    if (id === PACKAGE_GROUPS_BEFORE_ID && !insertedGroups) {
      for (const group of groups) {
        appendFamilyGroup(packagesRoot, {
          ...group,
          title: group.titleKey ? group.id : group.title ?? group.id,
        }, catalog);
      }
      insertedGroups = true;
    }
    if (groupedIds.has(id)) continue;

    const meta = packageMeta[id] ?? { title: id };
    packagesRoot.appendChild(createPackageCheckbox(id, meta, catalog));
  }

  if (selectAllPaidBtn) {
    selectAllPaidBtn.textContent = `Todos os pagos (${paidIds.length})`;
  }
}

async function loadCatalog() {
  const res = await fetch("/packages/catalog.json");
  if (!res.ok) throw new Error("Could not load catalog.");
  const catalog = await res.json();
  packageMeta = catalog.packageMeta ?? {};
  paidIds = catalog.paidPackageIds ?? [];

  const groupTitles = {
    "histology-embryology": "Histology & Embryology",
    "chemistry-biochemistry": "Chemistry & Biochemistry",
  };
  const groups = (catalog.pricingTableGroups ?? []).map((group) => ({
    ...group,
    title: groupTitles[group.id] ?? group.id,
  }));
  renderPackages({ ...catalog, pricingTableGroups: groups });
}

function selectedPackageIds() {
  return [...form.querySelectorAll('input[name="package_ids"]:checked')].map(
    (el) => el.value,
  );
}

function setStatus(message, type = "") {
  statusEl.hidden = !message;
  statusEl.textContent = message;
  statusEl.className = `admin-status${type ? ` is-${type}` : ""}`;
}

selectAllPaidBtn?.addEventListener("click", () => {
  for (const input of form.querySelectorAll('input[name="package_ids"]')) {
    input.checked = paidIds.includes(input.value);
  }
});

document.getElementById("clear-all")?.addEventListener("click", () => {
  for (const input of form.querySelectorAll('input[name="package_ids"]')) {
    input.checked = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resultSection.hidden = true;
  setStatus("A conceder acesso…", "");

  const formData = new FormData(form);
  const payload = {
    email: String(formData.get("email") ?? "").trim(),
    secret: String(formData.get("secret") ?? ""),
    duration_days: Number(formData.get("duration_days") ?? 365),
    package_ids: selectedPackageIds(),
  };

  try {
    const res = await fetch("/api/admin-grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Pedido falhou.");
    }

    setStatus("Acesso concedido com sucesso.", "ok");
    resultSummary.textContent = `${data.email} · UID ${data.user_id} · válido até ${new Date(data.expires_at).toLocaleDateString("pt-PT")}`;
    resultLinks.replaceChildren();
    for (const id of data.package_ids) {
      const meta = packageMeta[id] ?? { title: id };
      const li = document.createElement("li");
      if (meta.url) {
        li.innerHTML = `<a href="${meta.url}" target="_blank" rel="noopener noreferrer">${meta.title} →</a> <small>(${id})</small>`;
      } else {
        li.textContent = `${meta.title} (${id})`;
      }
      resultLinks.appendChild(li);
    }
    resultSection.hidden = false;
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Erro desconhecido.", "error");
  }
});

loadCatalog().catch((err) => {
  setStatus(err instanceof Error ? err.message : "Erro ao carregar catálogo.", "error");
});
