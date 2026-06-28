const form = document.getElementById("grant-form");
const packagesRoot = document.getElementById("packages-root");
const statusEl = document.getElementById("grant-status");
const resultSection = document.getElementById("grant-result");
const resultSummary = document.getElementById("result-summary");
const resultLinks = document.getElementById("result-links");

/** @type {Record<string, { title: string, url?: string, free?: boolean }>} */
let packageMeta = {};
/** @type {string[]} */
let paidIds = [];

async function loadCatalog() {
  const res = await fetch("/packages/catalog.json");
  if (!res.ok) throw new Error("Could not load catalog.");
  const catalog = await res.json();
  packageMeta = catalog.packageMeta ?? {};
  paidIds = catalog.paidPackageIds ?? [];
  renderPackages(catalog);
}

function renderPackages(catalog) {
  packagesRoot.replaceChildren();
  const ids = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ];

  for (const id of ids) {
    const meta = packageMeta[id] ?? { title: id };
    const label = document.createElement("label");
    label.className = `admin-package${meta.free ? " is-free" : ""}`;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "package_ids";
    input.value = id;

    const text = document.createElement("span");
    text.innerHTML = `<strong>${meta.title}</strong><small>${id}${meta.free ? " · grátis" : ""}</small>`;

    label.append(input, text);
    packagesRoot.appendChild(label);
  }
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

document.getElementById("select-all-paid")?.addEventListener("click", () => {
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
        li.innerHTML = `<a href="${meta.url}" target="_blank" rel="noopener noreferrer">${meta.title} →</a>`;
      } else {
        li.textContent = meta.title;
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
