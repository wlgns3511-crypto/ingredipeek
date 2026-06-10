/**
 * NutrientDensityBand — 5-tier composite lever atop the OpenFoodFacts
 * nutriment per-100g fields (calories / protein / fiber / saturated_fat /
 * salt / sugars) read against FDA Daily Value (DV) reference amounts
 * codified at 21 CFR 101.9(c) for a 2,000-kcal reference diet.
 *
 * Inputs (already established in lib/db.ts):
 *   - product.protein         g per 100 g
 *   - product.fiber           g per 100 g
 *   - product.saturated_fat   g per 100 g
 *   - product.salt            g per 100 g  (sodium = salt × 0.393)
 *   - product.sugars          g per 100 g  (total sugars; added is not isolated in OFF)
 *   - product.calories        kcal per 100 g (used for kcal-context caveats only)
 *
 * Reference Daily Values (21 CFR 101.9(c), 2,000 kcal reference):
 *   - Protein:        50 g/day
 *   - Dietary fiber:  28 g/day
 *   - Saturated fat:  20 g/day
 *   - Sodium:       2,300 mg/day  (0.0023 g × 1000)
 *   - Added sugars:   50 g/day  (we use TOTAL sugars; caveat surfaced)
 *
 * Output: one of five tiers — NutrientRich / NutrientDense / Acceptable /
 * NutrientSparse / LimitingDense — plus a "DataIncomplete" honest tier
 * when the OFF row lacks enough nutriment columns to score. Cutoffs are
 * our reading of the FDA "5/20 rule" (5% DV or less = low, 20% DV or
 * more = high for that nutrient) applied as a composite over the four
 * beneficial-vs-limiting DV ratios. They are stated explicitly on
 * /guide/nutrient-density-band/ and /methodology/.
 */
import type { Product } from '@/lib/db';

export type NutrientDensityTier =
  | 'NutrientRich'
  | 'NutrientDense'
  | 'Acceptable'
  | 'NutrientSparse'
  | 'LimitingDense'
  | 'DataIncomplete';

export interface NutrientDensityComponents {
  protein_g_per_100g: number | null;
  fiber_g_per_100g: number | null;
  saturated_fat_g_per_100g: number | null;
  sodium_mg_per_100g: number | null;
  sugars_g_per_100g: number | null;
  calories_kcal_per_100g: number | null;
  // DV percentages per 100 g
  proteinDvPct: number | null;
  fiberDvPct: number | null;
  saturatedFatDvPct: number | null;
  sodiumDvPct: number | null;
  sugarsDvPct: number | null;
  // composite beneficial vs limiting (sum of DV%)
  beneficialDvPct: number | null;
  limitingDvPct: number | null;
}

export interface NutrientDensityBandResult {
  tier: NutrientDensityTier;
  tierLabel: string;
  tierShortDesc: string;
  components: NutrientDensityComponents;
  evidence: string;
  caveats: string[];
  confidence: 'high' | 'med' | 'low' | 'insufficient-data';
}

const DV_PROTEIN_G = 50;
const DV_FIBER_G = 28;
const DV_SAT_FAT_G = 20;
const DV_SODIUM_MG = 2300;
const DV_ADDED_SUGAR_G = 50;
const SALT_TO_SODIUM = 0.393; // 1 g NaCl → 393 mg Na

function pct(numerator: number | null, denominator: number): number | null {
  if (numerator === null || numerator === undefined) return null;
  return Math.round((numerator / denominator) * 100);
}

export function classifyNutrientDensity(product: Product): NutrientDensityBandResult {
  const proteinG = product.protein;
  const fiberG = product.fiber;
  const satFatG = product.saturated_fat;
  const sugarsG = product.sugars;
  const saltG = product.salt;
  const calories = product.calories;
  const sodiumMg = saltG !== null && saltG !== undefined ? Math.round(saltG * SALT_TO_SODIUM * 1000) : null;

  const proteinDvPct = pct(proteinG, DV_PROTEIN_G);
  const fiberDvPct = pct(fiberG, DV_FIBER_G);
  const saturatedFatDvPct = pct(satFatG, DV_SAT_FAT_G);
  const sodiumDvPct = pct(sodiumMg, DV_SODIUM_MG);
  const sugarsDvPct = pct(sugarsG, DV_ADDED_SUGAR_G);

  const beneficialParts = [proteinDvPct, fiberDvPct].filter((v): v is number => v !== null);
  const limitingParts = [saturatedFatDvPct, sodiumDvPct, sugarsDvPct].filter((v): v is number => v !== null);

  const beneficialDvPct = beneficialParts.length > 0 ? beneficialParts.reduce((a, b) => a + b, 0) : null;
  const limitingDvPct = limitingParts.length > 0 ? limitingParts.reduce((a, b) => a + b, 0) : null;

  const components: NutrientDensityComponents = {
    protein_g_per_100g: proteinG,
    fiber_g_per_100g: fiberG,
    saturated_fat_g_per_100g: satFatG,
    sodium_mg_per_100g: sodiumMg,
    sugars_g_per_100g: sugarsG,
    calories_kcal_per_100g: calories,
    proteinDvPct,
    fiberDvPct,
    saturatedFatDvPct,
    sodiumDvPct,
    sugarsDvPct,
    beneficialDvPct,
    limitingDvPct,
  };

  const caveats: string[] = [];
  caveats.push('DV reference: 21 CFR 101.9(c), 2,000 kcal reference diet.');
  caveats.push('Total sugars used as a proxy because OpenFoodFacts does not isolate added sugar in the per-100 g row; whole fruit and milk sugars inflate the band for some products.');
  if (proteinG === null) caveats.push('Protein per 100 g missing.');
  if (fiberG === null) caveats.push('Fiber per 100 g missing.');
  if (satFatG === null) caveats.push('Saturated fat per 100 g missing.');
  if (saltG === null) caveats.push('Salt per 100 g missing (sodium not computed).');
  if (sugarsG === null) caveats.push('Sugars per 100 g missing.');

  // Honest "we don't know" tier when fewer than 2 beneficial AND fewer than 2 limiting nutriments populated.
  if (beneficialParts.length < 2 && limitingParts.length < 2) {
    return {
      tier: 'DataIncomplete',
      tierLabel: 'Data incomplete',
      tierShortDesc: 'Not enough nutriment fields populated to score against FDA Daily Value.',
      components,
      evidence: 'Fewer than four DV-eligible nutriments are present on this row; the per-100 g panel cannot be scored against 21 CFR 101.9(c).',
      caveats,
      confidence: 'insufficient-data',
    };
  }

  const safeBeneficial = beneficialDvPct ?? 0;
  const safeLimiting = limitingDvPct ?? 0;

  let tier: NutrientDensityTier;
  let tierLabel: string;
  let tierShortDesc: string;
  let evidence: string;

  if (safeLimiting >= 50) {
    tier = 'LimitingDense';
    tierLabel = 'Limiting-dense (high in nutrients to limit)';
    tierShortDesc = 'Saturated fat + sodium + sugars per 100 g sum to ≥ 50% of FDA Daily Value.';
    evidence = `Limiting-nutrient DV total ${safeLimiting}% per 100 g (≥50% threshold for limiting-dense).`;
  } else if (safeBeneficial >= 30 && safeLimiting <= 15) {
    tier = 'NutrientRich';
    tierLabel = 'Nutrient-rich';
    tierShortDesc = 'High in protein + fiber relative to FDA Daily Value, low in saturated fat / sodium / sugars.';
    evidence = `Beneficial-nutrient DV total ${safeBeneficial}% per 100 g (≥30%) with limiting-nutrient DV total ${safeLimiting}% (≤15%).`;
  } else if (safeBeneficial >= 20 && safeLimiting <= 25) {
    tier = 'NutrientDense';
    tierLabel = 'Nutrient-dense';
    tierShortDesc = 'Moderate-to-high beneficial nutrients per FDA Daily Value, limiting nutrients moderate.';
    evidence = `Beneficial-nutrient DV total ${safeBeneficial}% per 100 g (≥20%) with limiting-nutrient DV total ${safeLimiting}% (≤25%).`;
  } else if (safeBeneficial < 10 && safeLimiting < 25) {
    tier = 'NutrientSparse';
    tierLabel = 'Nutrient-sparse';
    tierShortDesc = 'Low in protein + fiber per FDA Daily Value; not high in limiting nutrients but contributes little beyond calories.';
    evidence = `Beneficial-nutrient DV total ${safeBeneficial}% per 100 g (<10%) with limiting-nutrient DV total ${safeLimiting}% (<25%).`;
  } else {
    tier = 'Acceptable';
    tierLabel = 'Acceptable';
    tierShortDesc = 'Beneficial and limiting DV totals sit in the middle bands.';
    evidence = `Beneficial-nutrient DV total ${safeBeneficial}% per 100 g, limiting-nutrient DV total ${safeLimiting}% per 100 g (middle bands).`;
  }

  const confidence: 'high' | 'med' | 'low' | 'insufficient-data' =
    beneficialParts.length >= 2 && limitingParts.length >= 3
      ? 'high'
      : beneficialParts.length >= 2 && limitingParts.length >= 2
      ? 'med'
      : 'low';

  return { tier, tierLabel, tierShortDesc, components, evidence, caveats, confidence };
}

export const NUTRIENT_DENSITY_TIER_META: Record<
  Exclude<NutrientDensityTier, 'DataIncomplete'>,
  { tone: 'emerald' | 'lime' | 'amber' | 'slate' | 'rose'; description: string }
> = {
  NutrientRich: {
    tone: 'emerald',
    description: 'Composition per 100 g lands high on the FDA Daily Value scale for protein + fiber while staying low on saturated fat, sodium, and sugars.',
  },
  NutrientDense: {
    tone: 'lime',
    description: 'Beneficial nutrients (protein + fiber) reach the 20% Daily Value floor; limiting nutrients (saturated fat + sodium + sugars) stay below 25% combined.',
  },
  Acceptable: {
    tone: 'slate',
    description: 'Beneficial and limiting Daily Value totals sit in the middle bands — neither emphatically rich nor emphatically empty.',
  },
  NutrientSparse: {
    tone: 'amber',
    description: 'Protein + fiber per 100 g register below the FDA "5%" low threshold; the food contributes little nutrient density beyond calories.',
  },
  LimitingDense: {
    tone: 'rose',
    description: 'Saturated fat + sodium + sugars sum to half or more of the FDA Daily Value per 100 g — the panel is dominated by nutrients dietary guidance asks readers to limit.',
  },
};
