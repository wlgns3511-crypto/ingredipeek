/**
 * interpretProduct — composite reader-help layer that synthesises the three
 * formal levers (ProcessingScore × AllergenSafetyMatrix × NutrientDensityBand)
 * into a single verdict + four-paragraph branching narrative. The same
 * (processing tier, allergen tier, density tier) tuple always produces the
 * same verdict; the synthesis is reproducible from the three published
 * source columns on every product page.
 *
 * The dominant-signal taxonomy (six patterns) is the page's primary surface;
 * any single lever alone is intentionally never the only signal:
 *   - whole-and-safe         Whole/Minimal × Safe × Rich/Dense
 *   - whole-but-allergenic   Whole/Minimal × Contains-Major or worse
 *   - ultra-but-empty        UltraProcessed × NutrientSparse or LimitingDense
 *   - ultra-and-allergenic   UltraProcessed × Contains-Multiple
 *   - mixed-tradeoff         Processed × Acceptable
 *   - data-incomplete        any lever returns DataIncomplete / OpaqueAdditive
 *
 * Cross-references for the FDA / EU / Codex divergence that drives the
 * allergen tier surface on every page:
 *   - 21 CFR 101 (FALCPA 2004 + FASTER Act 2021 sesame addition)
 *   - EU Regulation 1169/2011 (Annex II 14 substances)
 *   - Codex Alimentarius STAN 1-1985 (8 universal allergens)
 */
import type { Product } from '@/lib/db';
import { classifyProcessingScore } from '@/lib/processing-score';
import { decodeAllergenSafetyMatrix } from '@/lib/allergen-safety-matrix';
import { classifyNutrientDensity } from '@/lib/nutrient-density-band';

export type DominantSignal =
  | 'whole-and-safe'
  | 'whole-but-allergenic'
  | 'ultra-but-empty'
  | 'ultra-and-allergenic'
  | 'mixed-tradeoff'
  | 'data-incomplete';

export interface ProductInterpretation {
  verdict: string;
  dominantSignal: DominantSignal;
  decisionFraming: 'label-literate' | 'allergen-vigilant' | 'clinician-route' | 'data-incomplete';
  paragraphs: {
    processing: string;
    allergen: string;
    density: string;
    synthesis: string;
  };
  authorityCitations: string[];
}

export function interpretProduct(product: Product): ProductInterpretation {
  const processing = classifyProcessingScore(product);
  const allergen = decodeAllergenSafetyMatrix(product);
  const density = classifyNutrientDensity(product);

  const hasIncompleteSignal =
    processing.tier === 'OpaqueAdditive' || density.tier === 'DataIncomplete';

  const isWhole = processing.tier === 'Whole' || processing.tier === 'Minimal';
  const isUltra = processing.tier === 'UltraProcessed';
  const isAllergenic = allergen.riskTier === 'Contains-Major' || allergen.riskTier === 'Contains-Multiple';
  const isMultiAllergen = allergen.riskTier === 'Contains-Multiple';
  const isSparseOrLimiting = density.tier === 'NutrientSparse' || density.tier === 'LimitingDense';
  const isRichOrDense = density.tier === 'NutrientRich' || density.tier === 'NutrientDense';

  let dominantSignal: DominantSignal;
  if (hasIncompleteSignal) dominantSignal = 'data-incomplete';
  else if (isWhole && allergen.riskTier === 'Safe' && isRichOrDense) dominantSignal = 'whole-and-safe';
  else if (isWhole && isAllergenic) dominantSignal = 'whole-but-allergenic';
  else if (isUltra && isMultiAllergen) dominantSignal = 'ultra-and-allergenic';
  else if (isUltra && isSparseOrLimiting) dominantSignal = 'ultra-but-empty';
  else dominantSignal = 'mixed-tradeoff';

  const productName = product.name;
  const brandFragment = product.brand ? ` by ${product.brand}` : '';

  let verdict: string;
  let decisionFraming: ProductInterpretation['decisionFraming'];
  let synthesis: string;

  switch (dominantSignal) {
    case 'whole-and-safe':
      verdict = `Verdict: whole-food composition${brandFragment ? ` (${product.brand})` : ''}, no FDA Top 9 allergens detected, nutrient-dense per 100 g. Authorities: USDA FoodData Central · FDA 21 CFR 101 · Codex STAN 1-1985.`;
      decisionFraming = 'label-literate';
      synthesis = `${productName}${brandFragment} reads as a whole or minimally processed item with the FDA Top 9 allergen panel clear and a nutrient-density band on the beneficial side of the FDA 5/20 rule. The cross-reading is internally consistent: the ingredient list, the allergen panel, and the per-100 g nutrient panel all point the same direction. Practical next step is ordinary label literacy — verify the on-pack ingredient list against the per-100 g panel because OpenFoodFacts mirrors but does not replace the live FDA-mandated label.`;
      break;
    case 'whole-but-allergenic':
      verdict = `Verdict: whole-food composition${brandFragment ? ` (${product.brand})` : ''} but ${allergen.fda9.contained.length} of the FDA Top 9 allergens declared. Authorities: FDA 21 CFR 101 (FALCPA + FASTER Act) · EU 1169/2011 · Codex STAN 1-1985.`;
      decisionFraming = 'allergen-vigilant';
      synthesis = `${productName}${brandFragment} is whole-food or minimally processed in composition, but the allergen panel surfaces ${allergen.fda9.contained.join(', ')} from the FDA Top 9 list. For an at-risk household this is the dominant signal: the processing tier is benign but the allergen tier is not. Cross-check the on-pack "Contains" statement under FALCPA 21 CFR 101 — voluntary precautionary allergen labelling ("may contain") is governed by FDA guidance, not statute, so PAL phrasing varies by manufacturer.`;
      break;
    case 'ultra-but-empty':
      verdict = `Verdict: ultra-processed (NOVA 4) with ${density.tier === 'LimitingDense' ? 'saturated fat + sodium + sugars dominating the per-100 g panel' : 'protein + fiber registering below the FDA 5% Daily Value low threshold'}. Authorities: USDA FoodData Central · FDA 21 CFR 101.9 · Monteiro et al. 2019 (academic NOVA).`;
      decisionFraming = 'label-literate';
      synthesis = `${productName}${brandFragment} pairs ultra-processed composition with a nutrient-density panel that runs against the FDA 2020-2025 Dietary Guidelines headline directions ("limit saturated fat, sodium, added sugars" / "shift toward nutrient-dense foods"). Two independent surfaces converge on the same reading, which lowers the chance that either lever is an artefact of incomplete data. Decision use is straightforward: read the on-pack Nutrition Facts panel against the FDA % DV column, which is the same reference our NutrientDensityBand uses under 21 CFR 101.9(c).`;
      break;
    case 'ultra-and-allergenic':
      verdict = `Verdict: ultra-processed AND ${allergen.fda9.contained.length} of the FDA Top 9 allergens declared. Authorities: FDA 21 CFR 101 · USDA FoodData Central · CDC.`;
      decisionFraming = 'allergen-vigilant';
      synthesis = `${productName}${brandFragment} stacks two independent risk surfaces: an ultra-processed ingredient list (NOVA 4, multiple FDA-listed additive tiers) AND a multi-allergen FDA Top 9 panel (${allergen.fda9.contained.join(', ')}). For households managing FALCPA-listed allergies the allergen reading dominates; for households watching saturated fat, sodium, and added sugars the processing reading dominates. The cross-reading does NOT prescribe an avoid-or-buy decision — it surfaces both surfaces explicitly so clinician guidance (registered dietitian, pediatric allergist) can be sought with the right framing.`;
      break;
    case 'mixed-tradeoff':
      verdict = `Verdict: mixed signal — ${processing.tierLabel.toLowerCase()} composition, ${allergen.riskTier === 'PAL-Caution' ? 'PAL cross-contamination flag' : 'no FDA Top 9 allergens detected'}, ${density.tierLabel.toLowerCase()} per FDA Daily Value. Authorities: USDA FDC · FDA 21 CFR 101.`;
      decisionFraming = 'label-literate';
      synthesis = `${productName}${brandFragment} sits in the middle bands of all three levers — processing is neither whole nor ultra, allergen is neither clear nor multi-major, and the nutrient panel is neither rich nor dominated by limiting nutrients. The honest read is that no single lever is doing strong work and decision-relevant information will come from the on-pack Nutrition Facts panel and the FDA "Contains" statement rather than from any tier label we surface.`;
      break;
    case 'data-incomplete':
    default:
      verdict = `Verdict: cannot be placed — ${processing.tier === 'OpaqueAdditive' ? 'ingredient list missing or under 20 characters' : 'fewer than four nutriment fields populated'}. Authorities: see /methodology/ for the OpenFoodFacts ingest gap.`;
      decisionFraming = 'data-incomplete';
      synthesis = `${productName}${brandFragment} cannot be scored against either NOVA processing or FDA Daily Value bands because the OpenFoodFacts row our database ingests is incomplete. The page surfaces this honestly rather than back-filling from category averages: the FDA-mandated on-pack label is the authoritative source for this product, and the catalog row will refresh when OpenFoodFacts contributors update it.`;
      break;
  }

  const processingParagraph = `On the ProcessingScore lever, this product sits at the ${processing.tierLabel} tier. ${processing.tierShortDesc} ${processing.evidence} The NOVA classification framework comes from Monteiro et al. 2019 (UN FAO recognition); the FDA additive tier counts are read directly from the on-pack ingredient list under 21 CFR 101.4 ingredient-declaration rules.`;

  const allergenParagraph = `On the AllergenSafetyMatrix, this product reads as ${allergen.riskTier}. ${allergen.fda9.contained.length === 0 ? 'No FDA Top 9 allergens declared.' : `Contains ${allergen.fda9.contained.join(', ')} from the FDA Top 9 (FALCPA 2004 + FASTER Act 2021 sesame addition under 21 CFR 101.91).`} EU 1169/2011 Annex II extends the FDA list to 14 substances; the EU-only additions (celery, mustard, lupin, molluscs, sulphites) are not flagged in OpenFoodFacts and are surfaced as "not tracked" on the page.`;

  const densityComponents = density.components;
  const densityFragment = density.tier === 'DataIncomplete'
    ? 'Insufficient nutriment columns were populated on this row to compute the band.'
    : `Beneficial-nutrient DV total ${densityComponents.beneficialDvPct ?? 0}% per 100 g (protein ${densityComponents.proteinDvPct ?? '—'}%, fiber ${densityComponents.fiberDvPct ?? '—'}%); limiting-nutrient DV total ${densityComponents.limitingDvPct ?? 0}% per 100 g (saturated fat ${densityComponents.saturatedFatDvPct ?? '—'}%, sodium ${densityComponents.sodiumDvPct ?? '—'}%, sugars ${densityComponents.sugarsDvPct ?? '—'}%).`;

  const densityParagraph = `On the NutrientDensityBand, this product reads as ${density.tierLabel}. ${densityFragment} Daily Value references are codified at 21 CFR 101.9(c) for a 2,000-kcal reference diet; the "5/20 rule" (5% DV is low, 20% DV is high) underlies the band cutoffs. Cross-reference: USDA FoodData Central for FDC IDs that ship the same per-100 g panel under USDA jurisdiction rather than FDA jurisdiction.`;

  const authorityCitations = [
    'FDA 21 CFR 101 — Food labeling rules (FALCPA + FASTER Act allergen disclosures)',
    'FDA 21 CFR 101.9(c) — Nutrition Facts Daily Value reference amounts',
    'USDA FoodData Central — Per-100 g nutriment panel, FDC IDs',
    'EU Regulation 1169/2011 Annex II — 14-substance allergen list',
    'Codex Alimentarius STAN 1-1985 — 8 universally recognised allergens',
    'Monteiro et al. 2019 — NOVA processing classification framework',
    'CDC — Food allergy surveillance and prevalence data',
    'NIH ODS — Dietary supplement and nutrient reference fact sheets',
  ];

  return {
    verdict,
    dominantSignal,
    decisionFraming,
    paragraphs: {
      processing: processingParagraph,
      allergen: allergenParagraph,
      density: densityParagraph,
      synthesis,
    },
    authorityCitations,
  };
}
