// First-party SQL accessors that drive the Layer 1++ inject sections on
// product / brand / allergen pages. Everything here either:
//   - aggregates `data/foods.db` at SSG build time (cached implicitly by
//     better-sqlite3's prepared statements), OR
//   - matches static reference data (lib/data/additives.ts, the allergen
//     co-occurrence matrix in lib/generated/allergen-matrix.json).
//
// NOTE on NOVA group 3.43: 1,502 products in this catalog have a non-integer
// nova_group of 3.43 — it's the global mean of the four real groups
// (computed at OFF import time as a placeholder for products where NOVA
// couldn't be derived). We treat 3.43 as "unrated" rather than rounding
// up to 4 (data fabrication risk for YMYL signal).

import { getDb } from '@/lib/db';
import { ADDITIVES, type Additive, type AdditiveTier } from '@/lib/data/additives';
import allergenMatrixData from '@/lib/generated/allergen-matrix.json';

// ── Types ─────────────────────────────────────────────────────────

type AllergenName = 'milk' | 'gluten' | 'nuts' | 'soy' | 'eggs' | 'fish' | 'shellfish' | 'peanuts';

interface AllergenMatrix {
  generatedAt: string;
  totalProducts: number;
  perAllergen: Record<AllergenName, {
    total: number;
    coOccur: { allergen: AllergenName; pct: number }[];
  }>;
}

const ALLERGEN_MATRIX = allergenMatrixData as AllergenMatrix;

export interface AdditiveMatch {
  additive: Additive;
}

export interface AdditiveProfile {
  matched: Additive[];
  score: number;
  byTier: Record<AdditiveTier, number>;
  hasIngredientsText: boolean;
}

export interface NovaInfo {
  display: string;
  isUnrated: boolean;
  group: 1 | 2 | 3 | 4 | null;
}

export interface CategoryFingerprint {
  category: string;
  productCount: number;
  avgCalories: number | null;
  avgSugars: number | null;
  avgSaturatedFat: number | null;
  avgSalt: number | null;
  novaDistribution: { rated: Record<1 | 2 | 3 | 4, number>; unrated: number };
  topAllergen: { name: AllergenName; pct: number } | null;
}

export interface BrandFingerprint {
  brand: string;
  productCount: number;
  avgNova: number | null;
  novaDistribution: { rated: Record<1 | 2 | 3 | 4, number>; unrated: number };
  topAllergens: { name: AllergenName; pct: number }[];
  ingredientsCoverage: number;
  transparencyTier: 1 | 2 | 3 | 4;
  transparencyLabel: string;
}

// ── Additive matcher ──────────────────────────────────────────────

export function getAdditiveProfile(ingredientsText: string | null | undefined): AdditiveProfile {
  const byTier: Record<AdditiveTier, number> = { 1: 0, 2: 0, 3: 0 };
  if (!ingredientsText || ingredientsText.trim() === '') {
    return { matched: [], score: 0, byTier, hasIngredientsText: false };
  }
  const text = ingredientsText.toLowerCase();
  const matched: Additive[] = [];
  const seen = new Set<string>();
  for (const a of ADDITIVES) {
    if (seen.has(a.id)) continue;
    if (a.aliases.some((alias) => text.includes(alias))) {
      matched.push(a);
      seen.add(a.id);
      byTier[a.tier]++;
    }
  }
  // Tier 1 weighs 3, tier 2 weighs 2, tier 3 weighs 1.
  const score = matched.reduce((sum, a) => sum + (4 - a.tier), 0);
  return { matched, score, byTier, hasIngredientsText: true };
}

// ── NOVA helper ───────────────────────────────────────────────────

export function getNovaInfo(novaRaw: number | null | undefined): NovaInfo {
  if (novaRaw == null) return { display: 'Unrated', isUnrated: true, group: null };
  // 3.43 is the OFF-import mean placeholder — treat as unrated.
  if (Math.abs(novaRaw - 3.43) < 0.01) return { display: 'Unrated', isUnrated: true, group: null };
  if (Number.isInteger(novaRaw) && novaRaw >= 1 && novaRaw <= 4) {
    const g = novaRaw as 1 | 2 | 3 | 4;
    const labels: Record<1 | 2 | 3 | 4, string> = {
      1: 'NOVA 1 — Unprocessed',
      2: 'NOVA 2 — Processed culinary ingredient',
      3: 'NOVA 3 — Processed food',
      4: 'NOVA 4 — Ultra-processed',
    };
    return { display: labels[g], isUnrated: false, group: g };
  }
  return { display: 'Unrated', isUnrated: true, group: null };
}

// ── Allergen co-occurrence ────────────────────────────────────────

export function getAllergenCoOccurrence(type: AllergenName) {
  return ALLERGEN_MATRIX.perAllergen[type] ?? null;
}

export function getAllergenMatrixMeta() {
  return {
    generatedAt: ALLERGEN_MATRIX.generatedAt,
    totalProducts: ALLERGEN_MATRIX.totalProducts,
  };
}

// ── Category fingerprint ──────────────────────────────────────────

const ALLERGEN_COLS: AllergenName[] = ['milk', 'gluten', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'peanuts'];

function primaryCategoryFromString(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim();
  if (!first || first === 'en:null') return null;
  return first;
}

export function getPrimaryCategory(categoriesField: string | null | undefined): string | null {
  return primaryCategoryFromString(categoriesField);
}

export function formatCategoryLabel(raw: string): string {
  return raw.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');
}

export function getCategoryFingerprint(category: string): CategoryFingerprint {
  const db = getDb();
  const like = `${category}%`;
  const stats = db.prepare(
    `SELECT
       COUNT(*) AS n,
       AVG(calories) AS avg_cal,
       AVG(sugars) AS avg_sugars,
       AVG(saturated_fat) AS avg_sat,
       AVG(salt) AS avg_salt,
       SUM(CASE WHEN nova_group = 1 THEN 1 ELSE 0 END) AS nova1,
       SUM(CASE WHEN nova_group = 2 THEN 1 ELSE 0 END) AS nova2,
       SUM(CASE WHEN nova_group = 3 THEN 1 ELSE 0 END) AS nova3,
       SUM(CASE WHEN nova_group = 4 THEN 1 ELSE 0 END) AS nova4,
       SUM(CASE WHEN ABS(nova_group - 3.43) < 0.01 OR nova_group IS NULL THEN 1 ELSE 0 END) AS nova_unrated
     FROM products WHERE categories LIKE ?`,
  ).get(like) as {
    n: number;
    avg_cal: number | null; avg_sugars: number | null; avg_sat: number | null; avg_salt: number | null;
    nova1: number; nova2: number; nova3: number; nova4: number; nova_unrated: number;
  };

  let topAllergen: { name: AllergenName; pct: number } | null = null;
  if (stats.n > 0) {
    for (const a of ALLERGEN_COLS) {
      const row = db.prepare(
        `SELECT SUM(allergen_${a}) AS k FROM products WHERE categories LIKE ?`,
      ).get(like) as { k: number | null };
      const pct = ((row.k ?? 0) / stats.n) * 100;
      if (!topAllergen || pct > topAllergen.pct) topAllergen = { name: a, pct: Math.round(pct * 10) / 10 };
    }
  }

  return {
    category,
    productCount: stats.n,
    avgCalories: stats.avg_cal,
    avgSugars: stats.avg_sugars,
    avgSaturatedFat: stats.avg_sat,
    avgSalt: stats.avg_salt,
    novaDistribution: {
      rated: { 1: stats.nova1, 2: stats.nova2, 3: stats.nova3, 4: stats.nova4 },
      unrated: stats.nova_unrated,
    },
    topAllergen,
  };
}

// ── Brand fingerprint ─────────────────────────────────────────────

const TRANSPARENCY_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Excellent — full ingredient and nutrition labeling on this catalog',
  2: 'Good — most products have full ingredient lists',
  3: 'Mixed — partial ingredient disclosure across the lineup',
  4: 'Sparse — limited ingredient or nutrition data on file',
};

export function getBrandFingerprint(brand: string): BrandFingerprint {
  const db = getDb();
  const stats = db.prepare(
    `SELECT
       COUNT(*) AS n,
       SUM(CASE WHEN ingredients_text IS NOT NULL AND ingredients_text != '' THEN 1 ELSE 0 END) AS with_ingr,
       AVG(CASE WHEN nova_group IN (1,2,3,4) THEN nova_group END) AS avg_nova,
       SUM(CASE WHEN nova_group = 1 THEN 1 ELSE 0 END) AS nova1,
       SUM(CASE WHEN nova_group = 2 THEN 1 ELSE 0 END) AS nova2,
       SUM(CASE WHEN nova_group = 3 THEN 1 ELSE 0 END) AS nova3,
       SUM(CASE WHEN nova_group = 4 THEN 1 ELSE 0 END) AS nova4,
       SUM(CASE WHEN ABS(nova_group - 3.43) < 0.01 OR nova_group IS NULL THEN 1 ELSE 0 END) AS nova_unrated
     FROM products WHERE brand = ?`,
  ).get(brand) as {
    n: number; with_ingr: number; avg_nova: number | null;
    nova1: number; nova2: number; nova3: number; nova4: number; nova_unrated: number;
  };

  const topAllergens: { name: AllergenName; pct: number }[] = [];
  if (stats.n > 0) {
    for (const a of ALLERGEN_COLS) {
      const row = db.prepare(
        `SELECT SUM(allergen_${a}) AS k FROM products WHERE brand = ?`,
      ).get(brand) as { k: number | null };
      const pct = ((row.k ?? 0) / stats.n) * 100;
      topAllergens.push({ name: a, pct: Math.round(pct * 10) / 10 });
    }
    topAllergens.sort((a, b) => b.pct - a.pct);
  }

  const ingredientsCoverage = stats.n > 0 ? stats.with_ingr / stats.n : 0;
  let transparencyTier: 1 | 2 | 3 | 4;
  if (ingredientsCoverage >= 0.95) transparencyTier = 1;
  else if (ingredientsCoverage >= 0.80) transparencyTier = 2;
  else if (ingredientsCoverage >= 0.50) transparencyTier = 3;
  else transparencyTier = 4;

  return {
    brand,
    productCount: stats.n,
    avgNova: stats.avg_nova,
    novaDistribution: {
      rated: { 1: stats.nova1, 2: stats.nova2, 3: stats.nova3, 4: stats.nova4 },
      unrated: stats.nova_unrated,
    },
    topAllergens: topAllergens.slice(0, 3),
    ingredientsCoverage,
    transparencyTier,
    transparencyLabel: TRANSPARENCY_LABELS[transparencyTier],
  };
}

// ── Diet-subset allergen profile (drives /allergen/[type]/ inject) ──

export interface DietAllergenProfile {
  type: string;
  productCount: number;
  ingredientsCoverage: number;
  perAllergen: { name: AllergenName; pct: number; count: number }[];
  novaDistribution: { rated: Record<1 | 2 | 3 | 4, number>; unrated: number };
}

const DIET_FILTER: Record<string, string | null> = {
  'gluten-free': 'is_gluten_free = 1',
  'vegan': 'is_vegan = 1',
  'halal': 'is_halal = 1',
  'nut-free': 'is_nut_free = 1',
  'dairy-free': 'is_dairy_free = 1',
  'organic': 'is_organic = 1',
  'vegetarian': 'is_vegetarian = 1',
};

export function getDietAllergenProfile(type: string): DietAllergenProfile | null {
  const where = DIET_FILTER[type];
  if (!where) return null;
  const db = getDb();
  const stats = db.prepare(
    `SELECT
       COUNT(*) AS n,
       SUM(CASE WHEN ingredients_text IS NOT NULL AND ingredients_text != '' THEN 1 ELSE 0 END) AS with_ingr,
       SUM(CASE WHEN nova_group = 1 THEN 1 ELSE 0 END) AS nova1,
       SUM(CASE WHEN nova_group = 2 THEN 1 ELSE 0 END) AS nova2,
       SUM(CASE WHEN nova_group = 3 THEN 1 ELSE 0 END) AS nova3,
       SUM(CASE WHEN nova_group = 4 THEN 1 ELSE 0 END) AS nova4,
       SUM(CASE WHEN ABS(nova_group - 3.43) < 0.01 OR nova_group IS NULL THEN 1 ELSE 0 END) AS nova_unrated
     FROM products WHERE ${where}`,
  ).get() as {
    n: number; with_ingr: number;
    nova1: number; nova2: number; nova3: number; nova4: number; nova_unrated: number;
  };

  const perAllergen: { name: AllergenName; pct: number; count: number }[] = [];
  if (stats.n > 0) {
    for (const a of ALLERGEN_COLS) {
      const row = db.prepare(
        `SELECT SUM(allergen_${a}) AS k FROM products WHERE ${where}`,
      ).get() as { k: number | null };
      const count = row.k ?? 0;
      perAllergen.push({
        name: a,
        count,
        pct: Math.round((count / stats.n) * 1000) / 10,
      });
    }
    perAllergen.sort((a, b) => b.pct - a.pct);
  }

  return {
    type,
    productCount: stats.n,
    ingredientsCoverage: stats.n > 0 ? stats.with_ingr / stats.n : 0,
    perAllergen,
    novaDistribution: {
      rated: { 1: stats.nova1, 2: stats.nova2, 3: stats.nova3, 4: stats.nova4 },
      unrated: stats.nova_unrated,
    },
  };
}

// ── Format helpers ────────────────────────────────────────────────

export function formatNutrient(value: number | null, unit = 'g', digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)} ${unit}`;
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)}%`;
}
