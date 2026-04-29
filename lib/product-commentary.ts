// Layer 2 — derived narrative commentary that synthesizes structured data
// (Layer 1 SQL helpers + Layer 0 reference data) into per-product sentences.
//
// Goal: every page should read uniquely, not like a templated stat dump.
// HCU's primary thin-content signal is shallow boilerplate replicated
// across thousands of pages — the way out is sentences derived from that
// product's actual numbers.
//
// Each commentary builder returns a single sentence (or null if there's
// nothing meaningful to say). Pages render whichever subset applies.

import type { Product } from '@/lib/db';
import type { AdditiveProfile, NovaInfo, CategoryFingerprint } from '@/lib/product-facts';

export interface ProductCommentary {
  additiveSentence: string | null;
  comparisonSentence: string | null;
  novaSentence: string | null;
}

export function buildProductCommentary(
  product: Product,
  additive: AdditiveProfile,
  nova: NovaInfo,
  category: CategoryFingerprint | null,
): ProductCommentary {
  return {
    additiveSentence: buildAdditiveSentence(additive),
    comparisonSentence: buildComparisonSentence(product, category),
    novaSentence: buildNovaSentence(nova, category),
  };
}

function buildAdditiveSentence(p: AdditiveProfile): string | null {
  if (!p.hasIngredientsText) return null;
  if (p.matched.length === 0) {
    return 'No flagged additives detected against our 50-additive watchlist (IARC + EFSA + EWG composite).';
  }
  const t1 = p.byTier[1];
  const t2 = p.byTier[2];
  const top = p.matched[0];
  const topName = top.ename ? `${top.name} (${top.ename})` : top.name;
  if (t1 > 0) {
    return `Carries ${t1} tier-1 ${pluralize(t1, 'additive')} (highest attention) — including ${topName}. Tier 1 covers IARC 1/2A or items banned or restricted in the EU/UK.`;
  }
  if (t2 > 0) {
    return `Carries ${t2} tier-2 ${pluralize(t2, 'additive')} (mid attention) — including ${topName}. Tier 2 covers IARC 2B or items requiring an EU warning label.`;
  }
  return `Carries ${p.matched.length} routine ${pluralize(p.matched.length, 'additive')} on the watchlist — including ${topName}. None at higher attention tiers.`;
}

function buildComparisonSentence(p: Product, c: CategoryFingerprint | null): string | null {
  if (!c || c.productCount < 5) return null;
  if (p.calories == null || c.avgCalories == null) return null;
  const delta = p.calories - c.avgCalories;
  const pct = Math.round((delta / c.avgCalories) * 100);
  if (Math.abs(pct) < 10) return null; // within 10% — not interesting
  const direction = pct > 0 ? 'higher' : 'lower';
  return `${Math.abs(pct)}% ${direction} calories than the ${c.productCount.toLocaleString()}-product ${formatLabel(c.category)} average (${Math.round(c.avgCalories)} kcal vs ${p.calories} kcal per 100g).`;
}

function buildNovaSentence(n: NovaInfo, c: CategoryFingerprint | null): string | null {
  if (n.isUnrated) {
    return 'NOVA processing classification is not available for this product — Open Food Facts could not derive it from the ingredient and processing metadata captured.';
  }
  if (n.group == null) return null;
  if (n.group === 4 && c) {
    const total = c.novaDistribution.rated[1] + c.novaDistribution.rated[2] + c.novaDistribution.rated[3] + c.novaDistribution.rated[4];
    if (total === 0) return null;
    const ultraShare = Math.round((c.novaDistribution.rated[4] / total) * 100);
    return `NOVA group 4 (ultra-processed). ${ultraShare}% of rated ${formatLabel(c.category)} products in this catalog also fall in NOVA 4.`;
  }
  if (n.group === 1) {
    return 'NOVA group 1 (unprocessed or minimally processed) — typically whole foods or single-ingredient items.';
  }
  return null;
}

function pluralize(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

function formatLabel(category: string): string {
  return category.replace(/-/g, ' ').replace(/\bplant based\b/gi, 'plant-based');
}
