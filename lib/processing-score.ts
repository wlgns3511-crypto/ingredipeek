/**
 * ProcessingScore — 5-tier composite lever atop NOVA group, additive tier
 * distribution, and ingredient-list transparency.
 *
 * Inputs (all already established in lib/product-facts.ts and lib/data/additives.ts):
 *   - product.nova_group           NOVA 1..4 (Monteiro et al. 2019 framework)
 *   - product.ingredients_text     drives getAdditiveProfile() tier counts
 *   - product transparency proxy   ingredients_text presence + length
 *
 * Output: one of five labels — Whole / Minimal / Processed / UltraProcessed /
 * OpaqueAdditive — plus the component evidence and caveats. OpaqueAdditive
 * means we cannot place the product because the underlying ingredient list
 * is missing or too short; it is a "we don't know" tier, not a worse-than-
 * UltraProcessed tier.
 *
 * Cutoffs are OUR heuristic, not an FDA/EFSA/Codex official rating. They are
 * stated explicitly on /guide/processing-score/ and /methodology/.
 */
import type { Product } from '@/lib/db';
import { getAdditiveProfile, getNovaInfo } from '@/lib/product-facts';

export type ProcessingScoreTier =
  | 'Whole'
  | 'Minimal'
  | 'Processed'
  | 'UltraProcessed'
  | 'OpaqueAdditive';

export interface ProcessingScoreResult {
  tier: ProcessingScoreTier | null;
  tierLabel: string;
  tierShortDesc: string;
  components: {
    novaGroup: 1 | 2 | 3 | 4 | null;
    novaUnrated: boolean;
    additiveCount: number;
    additiveByTier: { 1: number; 2: number; 3: number };
    hasIngredientsText: boolean;
    ingredientsLength: number;
  };
  evidence: string;
  caveats: string[];
  confidence: 'high' | 'med' | 'low' | 'insufficient-data';
}

export interface ProcessingScoreTierMeta {
  tier: ProcessingScoreTier;
  label: string;
  shortDesc: string;
  longDesc: string;
}

export const PROCESSING_SCORE_TIER_META: ReadonlyArray<ProcessingScoreTierMeta> = [
  {
    tier: 'Whole',
    label: 'Whole',
    shortDesc: 'NOVA 1 + 0 additives',
    longDesc:
      'Single-ingredient or near-single-ingredient food matching NOVA group 1 (unprocessed / minimally processed) with no FDA-listed additives detected in the ingredient text.',
  },
  {
    tier: 'Minimal',
    label: 'Minimal',
    shortDesc: 'NOVA 1-2 + up to 2 additives',
    longDesc:
      'NOVA group 1 or 2 (processed culinary ingredients like oils, butters, sugars used to prepare whole foods) with at most two FDA-listed additives, predominantly in lower-concern tier 1.',
  },
  {
    tier: 'Processed',
    label: 'Processed',
    shortDesc: 'NOVA 3 + up to 5 additives',
    longDesc:
      'NOVA group 3 (canned, bottled, baked, fermented foods made by adding salt, oil, sugar, or other substances to whole foods) with up to five additives, mostly tier 1-2.',
  },
  {
    tier: 'UltraProcessed',
    label: 'UltraProcessed',
    shortDesc: 'NOVA 4 with 5+ additives or 3+ tier-3 additives',
    longDesc:
      'NOVA group 4 (industrial formulations of substances derived from food plus cosmetic additives) with five or more additives detected, or three or more in FDA tier 3 (synthetic / controversial). Many FDA tier 3 additives remain GRAS and FDA-approved; UltraProcessed is a processing-degree label, not a safety label.',
  },
  {
    tier: 'OpaqueAdditive',
    label: 'OpaqueAdditive',
    shortDesc: 'Cannot classify — ingredient list missing or too short',
    longDesc:
      'The product entry lacks a usable ingredient list (missing or under 20 characters), so we cannot compute additive count or tier distribution. We surface this honestly rather than guess at a tier.',
  },
];

const TIER_LABEL: Record<ProcessingScoreTier, string> = {
  Whole: 'Whole',
  Minimal: 'Minimal',
  Processed: 'Processed',
  UltraProcessed: 'UltraProcessed',
  OpaqueAdditive: 'OpaqueAdditive',
};

const TIER_SHORT: Record<ProcessingScoreTier, string> = {
  Whole: 'NOVA 1 + 0 additives',
  Minimal: 'NOVA 1-2 + ≤2 additives',
  Processed: 'NOVA 3 + ≤5 additives',
  UltraProcessed: 'NOVA 4 with 5+ additives (or 3+ tier-3)',
  OpaqueAdditive: 'Ingredient list missing or too short',
};

const INGREDIENTS_MIN_USABLE = 20;

export function classifyProcessingScore(product: Product): ProcessingScoreResult {
  const nova = getNovaInfo(product.nova_group);
  const additive = getAdditiveProfile(product.ingredients_text);

  const ingredientsLength = (product.ingredients_text ?? '').trim().length;
  const hasUsableIngredients = ingredientsLength >= INGREDIENTS_MIN_USABLE && additive.hasIngredientsText;

  const components = {
    novaGroup: nova.group,
    novaUnrated: nova.isUnrated,
    additiveCount: additive.matched.length,
    additiveByTier: { 1: additive.byTier[1], 2: additive.byTier[2], 3: additive.byTier[3] },
    hasIngredientsText: additive.hasIngredientsText,
    ingredientsLength,
  };

  const caveats: string[] = [];

  if (!hasUsableIngredients) {
    return {
      tier: 'OpaqueAdditive',
      tierLabel: TIER_LABEL.OpaqueAdditive,
      tierShortDesc: TIER_SHORT.OpaqueAdditive,
      components,
      evidence: `Ingredient text missing or under ${INGREDIENTS_MIN_USABLE} characters — cannot compute additive tier counts.`,
      caveats: [
        'OpaqueAdditive is a "data missing" label, not a worse-than-UltraProcessed label.',
        'Consult the brand or the FDA label directly for the full ingredient list.',
      ],
      confidence: 'insufficient-data',
    };
  }

  if (nova.isUnrated) {
    caveats.push(
      'NOVA group is unrated in the OpenFoodFacts source for this product — tier is computed from additive evidence alone and confidence is reduced.',
    );
  }

  const tier3 = additive.byTier[3];
  const totalAdditives = additive.matched.length;
  let tier: ProcessingScoreTier;

  if ((nova.group === 1 || nova.isUnrated) && totalAdditives === 0) {
    tier = 'Whole';
  } else if ((nova.group === 1 || nova.group === 2) && totalAdditives <= 2 && tier3 === 0) {
    tier = 'Minimal';
  } else if (nova.group === 4 || totalAdditives >= 5 || tier3 >= 3) {
    tier = 'UltraProcessed';
  } else if (nova.group === 3 || totalAdditives <= 5) {
    tier = 'Processed';
  } else {
    tier = 'Processed';
  }

  caveats.push(
    'NOVA classification (Monteiro et al. 2019) is a research consensus framework — not an FDA, EFSA, or Codex Alimentarius regulatory rating.',
  );
  if (tier === 'UltraProcessed') {
    caveats.push(
      'UltraProcessed describes processing degree, not safety. Many additives in FDA tier 3 remain GRAS-listed and lawful in food sold in the United States.',
    );
  }

  const novaLabel = nova.isUnrated ? 'NOVA unrated' : `NOVA ${nova.group}`;
  const evidence =
    `${novaLabel} + ${totalAdditives} additive${totalAdditives === 1 ? '' : 's'} (` +
    `${additive.byTier[1]} tier-1, ${additive.byTier[2]} tier-2, ${additive.byTier[3]} tier-3)`;

  const novaSignal = !nova.isUnrated;
  const additiveSignal = totalAdditives > 0 || ingredientsLength > 100;
  const confidence: ProcessingScoreResult['confidence'] =
    novaSignal && additiveSignal ? 'high' : novaSignal || additiveSignal ? 'med' : 'low';

  return {
    tier,
    tierLabel: TIER_LABEL[tier],
    tierShortDesc: TIER_SHORT[tier],
    components,
    evidence,
    caveats,
    confidence,
  };
}
