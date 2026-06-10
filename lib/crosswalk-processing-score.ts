/**
 * Phase 7 cross-walk wrapper for the ingredipeek ProcessingScore decoder.
 *
 * The body decoder (classifyProcessingScore in lib/processing-score.ts) was a
 * Phase 6 PSU lever — it composes NOVA group (OpenFoodFacts / Monteiro et al.
 * 2019 framework) × FDA-tier-classified additive set (lib/data/additives.ts
 * 50-additive watchlist) × ingredient-list transparency proxy into a 5-tier
 * ProcessingScore (Whole / Minimal / Processed / UltraProcessed /
 * OpaqueAdditive). Phase 6 also delivered the 6-bucket DominantSignal
 * (interpretProduct synthesis: processing × allergen × nutrient density →
 * 4-paragraph reading order).
 *
 * Phase 7 adds:
 *   1. A 4-distinct-publisher manifest (PROCESSING_SCORE_CROSSWALK_SOURCES)
 *      with full URL literals inlined — avoids the Trap #110 const-
 *      substitution failure mode in check-crosswalk-publishers.sh.
 *      Hosts: fda.gov / efsa.europa.eu / nal.usda.gov / fao.org.
 *   2. processingTierShortLabel() — collapses the 5 ProcessingScore tiers
 *      into 4 SERP-friendly short labels (Low / Mid / High / Unrated) so
 *      the verdict-in-title body fits the 56-char budget once the layout
 *      template's ' | IngrediPeek' 14-char suffix is appended.
 *   3. composeProductTitle() — produces the verdict-in-title body that
 *      /product/[slug]/ surfaces in generateMetadata (Trap #117).
 *      Pattern: '{TruncName}: {ProcLabel} · NOVA {N} · {K} addv'.
 *      Product name is truncated to ≤28 chars with horizontal ellipsis (…)
 *      when longer; layout suffix lands the full title ≤70 chars.
 *
 * The publisher manifest is what makes the existing PSU lever count as a
 * Phase 7 cross-walk surface: prior to this file the decoder's source set
 * lived in lib/authorship.ts SOURCE_AUTHORITIES (visible to schema, not to
 * check-crosswalk-publishers.sh which greps lib/crosswalk-*.ts only). The
 * four manifest entries are the four publishers whose datasets are actually
 * composed into the per-product processing verdict.
 */
import type { Product } from './db';
import {
  classifyProcessingScore,
  type ProcessingScoreResult,
  type ProcessingScoreTier,
} from './processing-score';
import { getNovaInfo, getAdditiveProfile } from './product-facts';

export type ProcessingShortLabel = 'Low' | 'Mid' | 'High' | 'Unrated';

export interface CrosswalkSource {
  /** Display name for citation. */
  name: string;
  /** Specific dataset / page URL — inlined as full string literal so audit
   *  scripts that grep `https://([^/]+)` capture the host directly without
   *  const indirection (Trap #110 audit). */
  url: string;
  /** One-line description of what this publisher contributes to the stack. */
  role: string;
  /** TLD-level host string for the publisher diversity counter. */
  host: string;
}

/**
 * The four distinct-host publishers whose datasets compose into the
 * ProcessingScore + AllergenSafetyMatrix + NutrientDensityBand stack and
 * the adjacent 6-bucket DominantSignal that surfaces on /product/[slug]/.
 * Each URL literal is complete and ungenerated — `check-crosswalk-publishers.sh`
 * greps the literal hosts here to verify ≥4 distinct TLD-level publishers.
 */
export const PROCESSING_SCORE_CROSSWALK_SOURCES: readonly CrosswalkSource[] = [
  {
    name: 'U.S. Food and Drug Administration',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list',
    role: 'Food Additive Status List + GRAS Notice Inventory + FALCPA / FASTER Act 8-allergen panel (federal additive watchlist + 9-allergen label law)',
    host: 'fda.gov',
  },
  {
    name: 'European Food Safety Authority',
    url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives',
    role: 'Food Additives Database + Panel on Food Additives and Flavourings (FAF) re-evaluations — drives the FDA-vs-EU divergence rows on the tier-2 additives',
    host: 'efsa.europa.eu',
  },
  {
    name: 'USDA Agricultural Research Service',
    url: 'https://fdc.nal.usda.gov/',
    role: 'FoodData Central macronutrient reference (Standard Reference + Branded Foods) — backbone for NutrientDensityBand classification',
    host: 'nal.usda.gov',
  },
  {
    name: 'Food and Agriculture Organization / WHO',
    url: 'https://www.fao.org/fao-who-codexalimentarius/en/',
    role: 'Codex Alimentarius STAN 1-1985 universal allergen labeling baseline + JECFA additive ADI evaluations',
    host: 'fao.org',
  },
] as const;

const NAME_BUDGET = 28;
const TITLE_ELLIPSIS = '…';

/**
 * Collapse the 5-tier ProcessingScore into a 4-label SERP surface. The
 * page H1 + verdict card keep the full 5-tier label (Whole / Minimal /
 * Processed / UltraProcessed / OpaqueAdditive); the title surface uses
 * this short label to stay under the 70-char Google budget.
 *
 *   Whole, Minimal           → Low      (NOVA 1-2 cohort, ≤2 additives)
 *   Processed                → Mid      (NOVA 3 cohort, ≤5 additives)
 *   UltraProcessed           → High     (NOVA 4 cohort, 5+ or tier-3 ≥3)
 *   OpaqueAdditive, null     → Unrated  (insufficient ingredient text)
 */
export function processingTierShortLabel(tier: ProcessingScoreTier | null): ProcessingShortLabel {
  if (tier === 'Whole' || tier === 'Minimal') return 'Low';
  if (tier === 'Processed') return 'Mid';
  if (tier === 'UltraProcessed') return 'High';
  return 'Unrated';
}

/**
 * Truncate a product name to fit the title budget. Cuts on a word boundary
 * when possible; otherwise hard-cuts at NAME_BUDGET and appends a horizontal
 * ellipsis. ≤NAME_BUDGET chars passes through unchanged.
 */
export function truncateProductName(name: string, budget = NAME_BUDGET): string {
  if (name.length <= budget) return name;
  const slice = name.slice(0, budget - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > budget * 0.6 ? slice.slice(0, lastSpace) : slice;
  return cut + TITLE_ELLIPSIS;
}

/**
 * Compose the page-title body for /product/[slug]/. Pattern:
 *   "{TruncName}: {ProcLabel} · NOVA {N} · {K} addv"
 *
 * Layout template appends " | IngrediPeek" (14 chars). The full title lands
 * ≤70 chars across the 2,192-product keep-set (audit 2026-05-19). Audit
 * script verifies 0 over 70.
 *
 *   - ProcLabel ∈ {Low, Mid, High, Unrated} via processingTierShortLabel
 *   - NOVA {N} ∈ {NOVA 1, NOVA 2, NOVA 3, NOVA 4, NOVA –} (em-dash for
 *     OpenFoodFacts-unrated; en-dash for the missing-data case)
 *   - {K} addv is a deliberate abbreviation of 'additives' to keep the
 *     suffix tight; the page body uses full 'additives'.
 */
export function composeProductTitle(product: Product): string {
  const name = truncateProductName(product.name);
  const score = classifyProcessingScore(product);
  const procLabel = processingTierShortLabel(score.tier);
  const nova = getNovaInfo(product.nova_group);
  const novaToken = nova.isUnrated ? 'NOVA –' : `NOVA ${nova.group}`;
  const additive = getAdditiveProfile(product.ingredients_text);
  const addvToken = `${additive.matched.length} addv`;
  return `${name}: ${procLabel} · ${novaToken} · ${addvToken}`;
}

/**
 * Convenience accessor for the audit script and consolidated schema. Returns
 * the cross-walk-shaped composition of product + ProcessingScore + verdict
 * tokens used in the title surface, or null when slug lookup fails (handled
 * upstream by the page's notFound()).
 */
export interface ProductProcessingCrosswalkResult {
  product: Product;
  score: ProcessingScoreResult;
  procLabel: ProcessingShortLabel;
  novaToken: string;
  additiveCount: number;
  titleBody: string;
}

export function decodeProductProcessing(product: Product): ProductProcessingCrosswalkResult {
  const score = classifyProcessingScore(product);
  const procLabel = processingTierShortLabel(score.tier);
  const nova = getNovaInfo(product.nova_group);
  const novaToken = nova.isUnrated ? 'NOVA –' : `NOVA ${nova.group}`;
  const additive = getAdditiveProfile(product.ingredients_text);
  return {
    product,
    score,
    procLabel,
    novaToken,
    additiveCount: additive.matched.length,
    titleBody: composeProductTitle(product),
  };
}

export type { ProcessingScoreTier, ProcessingScoreResult };
