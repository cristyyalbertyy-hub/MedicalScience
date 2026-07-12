# Package access split — Histology/Embryology & Chemistry/Biochemistry

Phase 1 (Site Medical only) defines catalogue IDs, pricing, syllabus topics and chapter-prefix mapping for partial entitlements. Apps enforce access in Phase 2.

## SKUs

| package_id | Topics | Price (USD) | App | Chapters |
|------------|--------|-------------|-----|----------|
| `histology` | 11 | $10.99 | histology-embryology | `cy`, `hi` |
| `embryology` | 15 | $11.99 | histology-embryology | `em`, `or` |
| `histology-embryology` | 26 | $15.99 | histology-embryology | all (`cy`, `hi`, `em`, `or`) |
| `chemistry` | 26 | $14.99 | chemistry-introductory-biochemistry | `gc`, `oc` |
| `introductory-biochemistry` | 4 | $6.99 | chemistry-introductory-biochemistry | `ib` |
| `chemistry-introductory-biochemistry` | 30 | $17.99 | chemistry-introductory-biochemistry | all (`gc`, `oc`, `ib`) |

Bundles keep the original full-discipline price. Buying a bundle grants only the bundle `package_id`; the app treats that ID as full access.

## Source of truth

- `packages/catalog.json` — `packageBundles`, `packageAccess`, `pricingTableGroups`, `packageMeta.parentApp`
- `packages/progress-manifest.json` — topic counts per SKU (regenerate with `node scripts/sync-progress-manifest.mjs`)
- `api/_lib/catalog.js` — `getChapterPrefixesForPackageId()`, `getParentAppPackageId()`, `isBundlePackageId()`

## Entitlements (unchanged in Phase 1)

`grantEntitlements()` stores the purchased `package_id` as-is. No auto-expansion of bundle → sub-packages in Firestore.

## Phase 2 (apps) — implemented

Each React app (`Histology And Embryology`, `Chemistry`) now:

1. Reads entitlements for `histology` / `embryology` / `histology-embryology` (or chemistry equivalents) via Firestore.
2. Maps owned IDs → allowed chapter prefixes via `src/lib/packageAccess.ts` (mirrors this catalog).
3. Locks chapter UI outside allowed prefixes when `OPEN_ACCESS` is off (default). Set `VITE_OPEN_ACCESS=true` for local dev without login.

## Phase 3 (Lemon Squeezy) — create 6 products

Create in LS dashboard (see `docs/lemon-squeezy-histology-chemistry-products.html`):

| Product name (exact) | package_id | Price |
|----------------------|------------|-------|
| Histology | `histology` | $10.99 |
| Embryology | `embryology` | $11.99 |
| Histology and Embryology | `histology-embryology` | $15.99 |
| Chemistry | `chemistry` | $14.99 |
| Introductory Biochemistry | `introductory-biochemistry` | $6.99 |
| Chemistry and Introductory Biochemistry | `chemistry-introductory-biochemistry` | $17.99 |

After creation: paste each **variant UUID** into `catalog.json` → `lemonSqueezy.variants` and `packageMeta.*.checkoutUrl`, then add IDs to `purchasablePackageIds` when ready to sell.

`productsByName` is already configured — webhook works by product name even before variant IDs are added.
