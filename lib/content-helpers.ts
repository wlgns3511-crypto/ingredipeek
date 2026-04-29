// Layer 3 — editorial helpers. Static reference URLs, regulatory framing
// labels, and plain-text expansions that anchor the structured data in
// real authority sources (FDA, EFSA, IARC, USDA, FALCPA).
//
// These are deliberately constant — keeping them in code (not the DB)
// makes them auditable in PR review and enforces consistency across
// every page that cites them. When a regulator's URL changes, edit here.

export const REGULATORY_REFS = {
  FDA_FOOD_ADDITIVES: {
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list',
    label: 'FDA Food Additive Status List',
  },
  FDA_GRAS: {
    url: 'https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras',
    label: 'FDA GRAS list',
  },
  EFSA_ADDITIVES: {
    url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives',
    label: 'EFSA food additive evaluations',
  },
  IARC_MONOGRAPHS: {
    url: 'https://monographs.iarc.who.int/list-of-classifications',
    label: 'IARC Monographs (WHO)',
  },
  USDA_FOODDATA: {
    url: 'https://fdc.nal.usda.gov/',
    label: 'USDA FoodData Central',
  },
  FALCPA: {
    url: 'https://www.fda.gov/food/food-allergensgluten-free-guidance-documents-regulatory-information/food-allergen-labeling-and-consumer-protection-act-2004-falcpa',
    label: 'FALCPA (food allergen labeling, U.S.)',
  },
  FASTER_ACT: {
    url: 'https://www.fda.gov/food/food-labeling-nutrition/food-allergen-labeling-and-consumer-protection-act-2004-questions-and-answers',
    label: 'FASTER Act (sesame addition, 2023)',
  },
  NUTRI_SCORE: {
    url: 'https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score',
    label: 'Santé publique France — Nutri-Score',
  },
} as const;

export type RegulatoryRefKey = keyof typeof REGULATORY_REFS;

export function additiveTierLabel(tier: 1 | 2 | 3): string {
  switch (tier) {
    case 1: return 'Higher attention — IARC group 1/2A, banned or restricted in EU/UK';
    case 2: return 'Mid attention — IARC 2B, EU warning label, or mixed evidence';
    case 3: return 'Routine — GRAS in U.S., debated in some subgroups';
  }
}

export function transparencyTierLabel(tier: 1 | 2 | 3 | 4): string {
  switch (tier) {
    case 1: return 'Full label coverage — ingredient lists captured for ≥95% of products';
    case 2: return 'Most products labeled — ingredient lists captured for 80–95%';
    case 3: return 'Mixed coverage — ingredient lists captured for 50–80%';
    case 4: return 'Sparse coverage — ingredient lists captured for fewer than 50%';
  }
}

export function novaGroupLabel(group: 1 | 2 | 3 | 4 | null): string {
  switch (group) {
    case 1: return 'Unprocessed or minimally processed (NOVA 1)';
    case 2: return 'Processed culinary ingredient (NOVA 2)';
    case 3: return 'Processed food (NOVA 3)';
    case 4: return 'Ultra-processed food (NOVA 4)';
    case null: return 'Unrated — NOVA group not derived';
  }
}

/** Per-allergen reference URL on FDA's site for the allergen's labeling rule. */
export function allergenRegulatoryNote(allergen: string): string {
  switch (allergen) {
    case 'milk':
    case 'eggs':
    case 'fish':
    case 'shellfish':
    case 'nuts':
    case 'peanuts':
    case 'soy':
    case 'gluten':
      return 'Required to be declared in plain language under FALCPA (U.S., 2004).';
    default:
      return '';
  }
}
