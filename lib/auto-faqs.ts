import type { Product } from './db';

export interface FaqItem {
  question: string;
  answer: string;
}

const ALLERGEN_KEYS = [
  { key: 'allergen_milk', label: 'milk/dairy' },
  { key: 'allergen_gluten', label: 'gluten' },
  { key: 'allergen_nuts', label: 'tree nuts' },
  { key: 'allergen_soy', label: 'soy' },
  { key: 'allergen_eggs', label: 'eggs' },
  { key: 'allergen_fish', label: 'fish' },
  { key: 'allergen_shellfish', label: 'shellfish' },
  { key: 'allergen_peanuts', label: 'peanuts' },
] as const;

export function generateAutoFaqs(product: Product): FaqItem[] {
  return [];
}
