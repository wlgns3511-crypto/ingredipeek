/**
 * AllergenSafetyMatrix — reader-help decoder atop the eight allergen flags
 * we ingest from OpenFoodFacts into data/foods.db (allergen_milk through
 * allergen_peanuts).
 *
 * The decoder does three things:
 *   1. Maps our eight binary flags onto the FDA's Top 9 major allergens
 *      (FALCPA 2004 + FASTER Act 2021 sesame addition, 2023). We honestly
 *      surface that the catalog does not yet carry a sesame flag column.
 *   2. Surfaces which EU 14 additions (celery, mustard, lupin, molluscs,
 *      sulphites) are not tracked, so EU readers know to consult the
 *      product's EU 1169/2011 label directly.
 *   3. Reads the free-text product.allergens string for PAL ("may contain")
 *      hits — voluntary precautionary allergen labelling that the FDA does
 *      not mandate but most US manufacturers use.
 *
 * Output: contained / free arrays for FDA Top 9 and the EU 14 extension,
 * a riskTier (Safe / PAL-Caution / Contains-Major / Contains-Multiple), and
 * a regulatoryNote naming the governing statute or directive.
 */
import type { Product } from '@/lib/db';

export type AllergenRiskTier =
  | 'Safe'
  | 'PAL-Caution'
  | 'Contains-Major'
  | 'Contains-Multiple';

export interface AllergenSafetyMatrixResult {
  fda9: {
    contained: string[];
    free: string[];
    notTracked: string[];
  };
  eu14Extension: {
    contained: string[];
    free: string[];
    notTracked: string[];
  };
  crossContaminationFlags: string[];
  regulatoryNote: string;
  riskTier: AllergenRiskTier;
  caveats: string[];
}

const FDA_TOP9_TO_COLUMN: ReadonlyArray<{ fda: string; column: keyof Product | null; note?: string }> = [
  { fda: 'milk', column: 'allergen_milk' },
  { fda: 'egg', column: 'allergen_eggs' },
  { fda: 'fish', column: 'allergen_fish' },
  { fda: 'shellfish (crustacean)', column: 'allergen_shellfish' },
  { fda: 'tree nut', column: 'allergen_nuts' },
  { fda: 'peanut', column: 'allergen_peanuts' },
  { fda: 'wheat', column: 'allergen_gluten', note: 'wheat tracked under gluten in catalog' },
  { fda: 'soy', column: 'allergen_soy' },
  {
    fda: 'sesame',
    column: null,
    note: 'sesame not yet tracked as a separate column — FASTER Act 2021 added sesame to FDA Top 9 effective 2023',
  },
];

const EU14_EXTENSION: ReadonlyArray<{ name: string; tracked: boolean }> = [
  { name: 'celery', tracked: false },
  { name: 'mustard', tracked: false },
  { name: 'lupin', tracked: false },
  { name: 'molluscs', tracked: false },
  { name: 'sulphites (sulfur dioxide)', tracked: false },
];

const PAL_PATTERNS: ReadonlyArray<{ phrase: RegExp; allergen: string }> = [
  { phrase: /may contain (?:traces of )?(?:milk|dairy|lactose)/i, allergen: 'milk' },
  { phrase: /may contain (?:traces of )?eggs?/i, allergen: 'egg' },
  { phrase: /may contain (?:traces of )?(?:peanuts?|groundnuts?)/i, allergen: 'peanut' },
  { phrase: /may contain (?:traces of )?(?:tree nuts?|nuts?|almonds?|walnuts?|cashews?|pecans?|pistachios?|hazelnuts?)/i, allergen: 'tree nut' },
  { phrase: /may contain (?:traces of )?(?:wheat|gluten)/i, allergen: 'wheat' },
  { phrase: /may contain (?:traces of )?soy/i, allergen: 'soy' },
  { phrase: /may contain (?:traces of )?fish/i, allergen: 'fish' },
  { phrase: /may contain (?:traces of )?(?:shellfish|crustacean|shrimp|lobster|crab)/i, allergen: 'shellfish' },
  { phrase: /may contain (?:traces of )?sesame/i, allergen: 'sesame' },
];

const REGULATORY_NOTE =
  'US allergen declaration is governed by FALCPA 2004 (8 major allergens) with sesame added under the FASTER Act 2021 effective January 2023. EU declaration follows Regulation 1169/2011 (14 allergens, including sesame, celery, mustard, lupin, molluscs, and sulphites). PAL ("may contain") statements are voluntary in the US — absence of a PAL flag does not guarantee absence of cross-contamination.';

function readFlag(product: Product, column: keyof Product | null): boolean {
  if (column == null) return false;
  const v = product[column];
  return typeof v === 'number' && v > 0;
}

export function decodeAllergenSafetyMatrix(product: Product): AllergenSafetyMatrixResult {
  const fda9Contained: string[] = [];
  const fda9Free: string[] = [];
  const fda9NotTracked: string[] = [];

  for (const entry of FDA_TOP9_TO_COLUMN) {
    if (entry.column == null) {
      fda9NotTracked.push(entry.fda);
      continue;
    }
    const present = readFlag(product, entry.column);
    if (present) fda9Contained.push(entry.fda);
    else fda9Free.push(entry.fda);
  }

  const eu14Contained: string[] = [];
  const eu14Free: string[] = [];
  const eu14NotTracked: string[] = [];
  for (const e of EU14_EXTENSION) {
    if (!e.tracked) eu14NotTracked.push(e.name);
    else eu14Free.push(e.name);
  }

  const crossContaminationFlags: string[] = [];
  const allergenText = (product.allergens ?? '').toString();
  for (const p of PAL_PATTERNS) {
    if (p.phrase.test(allergenText)) {
      const label = `may contain ${p.allergen}`;
      if (!crossContaminationFlags.includes(label)) crossContaminationFlags.push(label);
    }
  }

  let riskTier: AllergenRiskTier;
  if (fda9Contained.length >= 3) riskTier = 'Contains-Multiple';
  else if (fda9Contained.length >= 1) riskTier = 'Contains-Major';
  else if (crossContaminationFlags.length >= 1) riskTier = 'PAL-Caution';
  else riskTier = 'Safe';

  const caveats: string[] = [
    'AllergenSafetyMatrix is reader help — it does not replace reading the on-pack label for users with diagnosed allergies.',
    'Sesame and the EU-only allergens (celery, mustard, lupin, molluscs, sulphites) are not yet tracked as separate columns in our catalog; consult the product label directly for those.',
  ];
  if (crossContaminationFlags.length === 0 && riskTier === 'Safe') {
    caveats.push(
      'PAL statements ("may contain") are voluntary under US law. Absence of a PAL flag in this product entry does not guarantee absence of cross-contamination.',
    );
  }

  return {
    fda9: { contained: fda9Contained, free: fda9Free, notTracked: fda9NotTracked },
    eu14Extension: { contained: eu14Contained, free: eu14Free, notTracked: eu14NotTracked },
    crossContaminationFlags,
    regulatoryNote: REGULATORY_NOTE,
    riskTier,
    caveats,
  };
}
