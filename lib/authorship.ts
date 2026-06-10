/**
 * Network-wide publisher and per-site editorial team. Authored as an
 * Organization (data-aggregator pattern) — schema author/publisher fields
 * point at EDITORIAL_TEAM and PUBLISHER below.
 *
 * Vintage dates anchor to real git mtime (commits that touched the
 * underlying data or page). See _shared/docs/playbook-phase6.md.
 */

// ===== Vintage layers (each anchored to real git mtime) =====
// ENTITY: per-product FDA additive snapshot — lib/db.ts + lib/data/additives.ts
//         + lib/product-facts.ts + lib/product-commentary.ts (HCU 5-chunk P3)
// PSU 2차 (2026-05-12) bumped: product page wired with 3rd lever (NutrientDensityBand)
// and 4-paragraph composite (ingredient-interpretation.ts).
export const ENTITY_VINTAGE = '2026-05-12';
// ALLERGEN: lib/generated/allergen-matrix.json + app/allergen/[type]/page.tsx
// PSU 2차 bumped: allergen page now also surfaces NutrientDensityBand subset distribution.
export const ALLERGEN_VINTAGE = '2026-05-12';
// METHODOLOGY: app/methodology/page.tsx — bumped for PSU 2차 NutrientDensityBand section.
export const METHODOLOGY_VINTAGE = '2026-05-12';
// ABOUT: app/about/page.tsx — bumped for PSU 2차 3-lever + 4-paragraph interpretation note.
export const ABOUT_VINTAGE = '2026-05-12';
// SITE_PUBLISHED: initial commit cc6d9e2 (2026-03-27)
export const SITE_PUBLISHED = '2026-03-27';
// LEGAL_REVIEWED: privacy/terms — review cycle baseline (2026-04-01)
export const LEGAL_REVIEWED = '2026-04-01';
// DISCLAIMER_REVIEWED: split from LEGAL_REVIEWED in PSU 2차 — disclaimer rewritten with
// NutrientDensityBand caveats and FDA 21 CFR 101.9(c) Daily Value attribution.
export const DISCLAIMER_REVIEWED = '2026-05-12';
// EDITORIAL/CORRECTIONS: introduced in PSU 5/11 (editorial-policy + corrections-policy NEW)
// PSU 2차 bumped with NutrientDensityBand citation + 4-paragraph composite documentation.
export const EDITORIAL_REVIEWED = '2026-05-12';
export const CORRECTIONS_REVIEWED = '2026-05-12';
// GUIDE_VINTAGE: introduced PSU 2차 for the 3 NEW /guide hubs
// (nutrient-density-band, reading-product-pages, processing-vs-allergen-tradeoff).
export const GUIDE_VINTAGE = '2026-05-12';

// Back-compat alias (pre-Phase-6 imports keep working).
export const DB_UPDATED = ENTITY_VINTAGE;

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description: 'A public-data network aggregating government and public datasets across US food, housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'IngrediPeek Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

// ===== SOURCE AUTHORITIES (5 regulatory bodies, MEDIUM-HIGH YMYL) =====
// Cited in AuthorBox + injected into product/allergen schema as reviewedBy/isBasedOn.
export const SOURCE_AUTHORITIES = [
  { name: 'FDA Food Additive Status List', url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list' },
  { name: 'FDA GRAS Notice Inventory', url: 'https://www.cfsanappsexternal.fda.gov/scripts/fdcc/?set=GRASNotices' },
  { name: 'EFSA Food Additives Database', url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives' },
  { name: 'USDA FoodData Central', url: 'https://fdc.nal.usda.gov/' },
  { name: 'WHO/FAO Codex Alimentarius', url: 'https://www.fao.org/fao-who-codexalimentarius/en/' },
];

/**
 * Compact source list for the above-the-fold TrustBlock component.
 * Mirrors SOURCE_AUTHORITIES (same 5 regulatory bodies) in the
 * `{name, url}` shape that TrustBlock expects.
 */
export const TRUST_BLOCK_SOURCES: ReadonlyArray<{ name: string; url: string }> = [
  { name: 'FDA Food Additive Status List', url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list' },
  { name: 'FDA GRAS Notice Inventory', url: 'https://www.cfsanappsexternal.fda.gov/scripts/fdcc/?set=GRASNotices' },
  { name: 'EFSA Food Additives Database', url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives' },
  { name: 'USDA FoodData Central', url: 'https://fdc.nal.usda.gov/' },
  { name: 'WHO/FAO Codex Alimentarius', url: 'https://www.fao.org/fao-who-codexalimentarius/en/' },
];

// Optional disclaimer for allergen/additive pages (medical-adjacent).
export const REVIEWER_DISCLAIMER = 'Ingredient and additive classifications reflect current FDA and EFSA listings. Not a substitute for medical advice on allergies or dietary restrictions.';
