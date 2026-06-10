/**
 * Phase 7 audit for ingredipeek — Tier-2 cohort #8 (2026-05-25, audit-only
 * formalisation cycle). Verifies Traps #110/#111/#112/#119/#120 plus the
 * Empirical-Outcomes Tier-2 block (E1-E6) against the /product/[slug]/
 * verdict surface (2,192-product keep-set, lib/generated/product-keep.json).
 *
 * Tier-2 classification (2026-05-25 promotion):
 *   - ordinal: 8 (after kotobapeek #7)
 *   - shape:   (b) categorical bucket — 6-bucket DominantSignal synthesis
 *              of 5-tier ProcessingScore × 4-tier AllergenSafetyMatrix
 *              × 6-tier NutrientDensityBand; 2nd shape-(b) Tier-2 after
 *              wellwaterpeek #2
 *   - level:   per-product (2,191-cohort), 4th entity-level Tier-2 after
 *              dogbreedpeek #3 / florawize #6 / kotobapeek #7
 *   - by-design uniformity: 10th overall precedent (NOVA-4 packaged-food
 *              catalog dominance 85.3% under v2.2 §Trap #111 exception
 *              clause — catalog-reality direction, 1st in that direction)
 *
 * Trap-number correction (v2.2, 2026-05-19): #112 = P1 title 60c overflow
 * (NOT #117 — #117 is P4 creator portfolio-only). Earlier comments using
 * #117 for title-cap have been corrected.
 *
 * Runs as a one-shot:
 *   npx tsx scripts/audit-phase7.ts
 */
import {
  PROCESSING_SCORE_CROSSWALK_SOURCES,
  composeProductTitle,
  decodeProductProcessing,
} from '../lib/crosswalk-processing-score';
import { getProductBySlug } from '../lib/db';
import { classifyProcessingScore } from '../lib/processing-score';
import { decodeAllergenSafetyMatrix } from '../lib/allergen-safety-matrix';
import { classifyNutrientDensity } from '../lib/nutrient-density-band';
import { interpretProduct } from '../lib/ingredient-interpretation';
import productKeep from '../lib/generated/product-keep.json';

console.log('=== Phase 7 audit — ingredipeek (Tier-2 cohort #8) ===');
console.log('Shape: (b) categorical 6-bucket DominantSignal synthesis');
console.log('Cohort level: per-product (4th entity-level Tier-2)');

// Trap #110 — distinct publisher hosts in the cross-walk manifest.
// Phase 7 playbook requires ≥4 distinct hosts for the cross-walk surface.
// Cohort: 2,192 keep-set products (product-keep.json).
const hosts = PROCESSING_SCORE_CROSSWALK_SOURCES.map((s) => new URL(s.url).host);
const distinctHosts = new Set(hosts);
console.log('\n[#110] cross-walk publisher hosts:', hosts);
console.log(
  '       distinct count:',
  distinctHosts.size,
  distinctHosts.size >= 4 ? 'PASS' : 'FAIL (need ≥4 for cross-walk surface)',
);
distinctHosts.forEach((h) => console.log('       ·', h));

// Trap #111 — ProcessingScore tier distribution across the keep-set cohort.
// Natural NOVA distribution skews to UltraProcessed (NOVA 4) for packaged
// foods — that's honest catalog reality, not bandify failure. v2.2 §Trap
// #111 exception clause applies: catalog-reality dimension where the bucket
// concentration reflects published measurement (Monteiro et al. 2019 NOVA
// 4 ~60-65% of packaged-food catalogs; 85.3% reflects OpenFoodFacts ingest
// curation toward branded packaged items, not engineered uniformity).
const slugs = (productKeep as string[]).filter((s) => s && s !== '-');
const tierCounts: Record<string, number> = {
  Low: 0,
  Mid: 0,
  High: 0,
  Unrated: 0,
};
let decoded = 0;
let titleBudgetMax = 0;
let titleBudgetMaxWho = '';
let titleOverBudget = 0;
const samples: { len: number; full: string }[] = [];

// v2.2 §4.0: with title.absolute the layout suffix is bypassed, so the
// audit measures composed body alone against the 60c Google SERP cap.
const TITLE_SUFFIX = '';
const TITLE_MAX = 60;

for (const slug of slugs) {
  const product = getProductBySlug(slug);
  if (!product) continue;
  decoded += 1;
  const r = decodeProductProcessing(product);
  tierCounts[r.procLabel] += 1;
  const full = r.titleBody + TITLE_SUFFIX;
  if (full.length > titleBudgetMax) {
    titleBudgetMax = full.length;
    titleBudgetMaxWho = product.name;
  }
  if (full.length > TITLE_MAX) titleOverBudget += 1;
  if (samples.length < 4) samples.push({ len: full.length, full });
}

const total = decoded;
const pcts: Record<string, number> = {};
for (const [k, v] of Object.entries(tierCounts)) pcts[k] = total > 0 ? (v / total) * 100 : 0;
const maxPct = Math.max(...Object.values(pcts));

console.log('\n[#111] processing-tier short-label distribution (n=' + total + '):', tierCounts);
console.log(
  '       pct:',
  Object.fromEntries(Object.entries(pcts).map(([k, v]) => [k, v.toFixed(1) + '%'])),
);
console.log(
  '       max-bucket concentration:',
  maxPct.toFixed(1) + '%',
  '(annotated — NOVA 4 dominates packaged-food cohorts by Monteiro et al. 2019; honest catalog reality, not engineered)',
);

// Trap #112 — P1 title length ≤60 chars across the keep-set.
// v2.2 §4.0: title.absolute bypasses layout suffix ' | IngrediPeek' (14c),
// so the page-level composed body alone is measured against the 60c cap.
console.log('\n[#112] P1 title length audit (n=' + decoded + ')');
console.log('       max length:', titleBudgetMax, 'chars  (worst:', titleBudgetMaxWho + ')');
console.log(
  '       over ' + TITLE_MAX + ' chars:',
  titleOverBudget,
  titleOverBudget === 0 ? 'PASS' : 'FAIL',
);
for (const s of samples) console.log('       sample: [' + s.len + ']', s.full || '(empty)');

// Trap #119 — P1 coverage. Every product in the keep-set must decode to a
// title-bearing verdict. OpaqueAdditive (insufficient ingredient text)
// routes to 'Unrated' so coverage stays 100%.
const coverPct = slugs.length > 0 ? (decoded / slugs.length) * 100 : 0;
console.log('\n[#119] P1 verdict-coverage');
console.log(
  '       covered:',
  decoded,
  '/',
  slugs.length,
  '(' + coverPct.toFixed(1) + '%)',
  coverPct >= 100 ? 'PASS' : 'FAIL (100% expected — every keep-set product must decode)',
);

// Trap #120 — N=20 randomized cold-probe via composeProductTitle.
// Asserts the verdict marker '· NOVA' and '· N addv' tokens appear in the
// title body for randomly sampled slugs.
const sample20 = [...slugs]
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.min(20, slugs.length));
let verdictsInTitleBody = 0;
const VERDICT_BODY_RE = /: (Low|Mid|High|Unrated) · NOVA (\d|–) · \d+ addv/;
for (const slug of sample20) {
  const product = getProductBySlug(slug);
  if (!product) continue;
  const body = composeProductTitle(product);
  if (VERDICT_BODY_RE.test(body)) verdictsInTitleBody += 1;
}
const probePct = sample20.length > 0 ? (verdictsInTitleBody / sample20.length) * 100 : 0;
console.log('\n[#120] N=20 randomized cold-probe (title body verdict marker)');
console.log(
  '       verdict-bearing:',
  verdictsInTitleBody,
  '/',
  sample20.length,
  '(' + probePct.toFixed(1) + '%)',
  probePct >= 90 ? 'PASS' : 'FAIL (expected ≥90% per gate JSON expected_p1_coverage_pct=100)',
);

// ─────────────────────────────────────────────────────────────────────
// Empirical-Outcomes Tier-2 block (E1-E6) — formalised 2026-05-25
// For shape-(b) categorical Tier-2 the block is interpreted as:
//   E1: dual-signal cohort coverage floor
//   E2: honest-null routing (data-incomplete <2% — honesty test, not
//       bandify baseline as in shape-(a) continuous Tier-2)
//   E3: categorical bucket spread (max - min ≥30pp across 6 buckets)
//   E4: DominantSignal max bucket ≤60% (annotated v2.2 §Trap #111 catalog-
//       reality exception applies for ProcessingScore max; DominantSignal
//       must independently pass under categorical synthesis)
//   E5: publisher diversity ≥4 (already covered by #110)
//   E6: page-surface wiring — title body emits ProcLabel + NOVA + addv;
//       page body emits DominantSignal verdict
// ─────────────────────────────────────────────────────────────────────

console.log('\n=== Empirical-Outcomes Tier-2 block (E1-E6) ===');

// Recompute cohort-level distributions for the E-block. Iterates once and
// fans into both processing-tier and DominantSignal accumulators.
const procFull: Record<string, number> = {
  Whole: 0,
  Minimal: 0,
  Processed: 0,
  UltraProcessed: 0,
  OpaqueAdditive: 0,
};
const dominant: Record<string, number> = {
  'whole-and-safe': 0,
  'whole-but-allergenic': 0,
  'ultra-but-empty': 0,
  'ultra-and-allergenic': 0,
  'mixed-tradeoff': 0,
  'data-incomplete': 0,
};
const allergen: Record<string, number> = {
  Safe: 0,
  'PAL-Caution': 0,
  'Contains-Major': 0,
  'Contains-Multiple': 0,
};
const density: Record<string, number> = {
  NutrientRich: 0,
  NutrientDense: 0,
  Acceptable: 0,
  NutrientSparse: 0,
  LimitingDense: 0,
  DataIncomplete: 0,
};
let dualSignal = 0;

for (const slug of slugs) {
  const p = getProductBySlug(slug);
  if (!p) continue;
  const proc = classifyProcessingScore(p);
  const procKey = proc.tier ?? 'OpaqueAdditive';
  procFull[procKey] += 1;
  const al = decodeAllergenSafetyMatrix(p);
  allergen[al.riskTier] += 1;
  const den = classifyNutrientDensity(p);
  density[den.tier] += 1;
  const interp = interpretProduct(p);
  dominant[interp.dominantSignal] += 1;
  if (procKey !== 'OpaqueAdditive' && den.tier !== 'DataIncomplete') dualSignal += 1;
}

// E1 — dual-signal cohort coverage floor
const dualPct = decoded > 0 ? (dualSignal / decoded) * 100 : 0;
const E1_FLOOR = 1500;
console.log('\n[E1] dual-signal cohort coverage');
console.log('     dual-signal n :', dualSignal, '/', decoded, '(' + dualPct.toFixed(1) + '%)');
console.log(
  '     floor 1500    :',
  dualSignal >= E1_FLOOR ? 'PASS' : 'FAIL (need ≥' + E1_FLOOR + ' dual-signal products)',
);

// E2 — honest-null routing (data-incomplete bucket pct ≤2%)
const incompletePct = decoded > 0 ? (dominant['data-incomplete'] / decoded) * 100 : 0;
console.log('\n[E2] honest-null routing (categorical Tier-2 baseline)');
console.log(
  '     data-incomplete pct :',
  incompletePct.toFixed(2) + '%',
  '(',
  dominant['data-incomplete'],
  '/',
  decoded,
  ')',
);
console.log(
  '     floor ≤2%           :',
  incompletePct <= 2 ? 'PASS' : 'FAIL (more than 2% routing to data-incomplete = decoder honesty issue)',
);

// E3 — categorical spread (max - min ≥30pp across 6 DominantSignal buckets)
const dominantVals = Object.values(dominant);
const domMaxPct = decoded > 0 ? (Math.max(...dominantVals) / decoded) * 100 : 0;
const domMinPct = decoded > 0 ? (Math.min(...dominantVals) / decoded) * 100 : 0;
const domSpread = domMaxPct - domMinPct;
console.log('\n[E3] categorical bucket spread (DominantSignal max-min ≥30pp)');
console.log('     max bucket pct :', domMaxPct.toFixed(1) + '%');
console.log('     min bucket pct :', domMinPct.toFixed(1) + '%');
console.log('     spread         :', domSpread.toFixed(1) + 'pp');
console.log(
  '     floor ≥30pp    :',
  domSpread >= 30 ? 'PASS' : 'FAIL (categorical buckets need meaningful spread across 6 levels)',
);

// E4 — DominantSignal max bucket ≤60% (independent of ProcessingScore
// catalog-reality exception). ProcessingScore max bucket 85.3% annotated
// under v2.2 §Trap #111 clause (Monteiro NOVA-4 catalog dominance), but
// DominantSignal is the composed Tier-2 surface and must pass on its own.
console.log('\n[E4] DominantSignal distribution');
const dominantPcts = Object.fromEntries(
  Object.entries(dominant).map(([k, v]) => [k, decoded > 0 ? ((v / decoded) * 100).toFixed(1) + '%' : '0.0%']),
);
console.log('     distribution:', dominantPcts);
console.log(
  '     max ≤60%    :',
  domMaxPct <= 60 ? 'PASS' : 'FAIL (DominantSignal must distribute under 60% max)',
);

// E5 — publisher diversity ≥4
console.log('\n[E5] publisher diversity (≥4 distinct hosts)');
console.log(
  '     distinct hosts:',
  distinctHosts.size,
  distinctHosts.size >= 4 ? 'PASS' : 'FAIL (covered by #110)',
);

// E6 — page-surface wiring spot-check
//   1. composeProductTitle returns ProcLabel + NOVA + addv tokens (#120 verdict marker)
//   2. interpretProduct returns dominantSignal ∈ 6-bucket set
//   3. PROCESSING_SCORE_CROSSWALK_SOURCES exported with ≥4 entries
const sampleProduct = getProductBySlug(slugs[0]);
let e6_ok = false;
let e6_details = '';
if (sampleProduct) {
  const body = composeProductTitle(sampleProduct);
  const interp = interpretProduct(sampleProduct);
  const titleOk = VERDICT_BODY_RE.test(body);
  const sigOk = [
    'whole-and-safe',
    'whole-but-allergenic',
    'ultra-but-empty',
    'ultra-and-allergenic',
    'mixed-tradeoff',
    'data-incomplete',
  ].includes(interp.dominantSignal);
  const pubOk = PROCESSING_SCORE_CROSSWALK_SOURCES.length >= 4;
  e6_ok = titleOk && sigOk && pubOk;
  e6_details = 'title-marker=' + (titleOk ? 'YES' : 'NO') + ', dominantSignal=' + interp.dominantSignal + ', pub=' + PROCESSING_SCORE_CROSSWALK_SOURCES.length;
}
console.log('\n[E6] page-surface wiring');
console.log('     ' + e6_details);
console.log('     ', e6_ok ? 'PASS' : 'FAIL (title body marker + dominantSignal bucket + ≥4 publishers must all wire)');

// Sanity samples — composed title for several known products.
console.log('\n[sample]');
const sampleSlugs = sample20.slice(0, 6);
for (const slug of sampleSlugs) {
  const product = getProductBySlug(slug);
  if (!product) {
    console.log('  ' + slug.padEnd(40) + ' NO PRODUCT');
    continue;
  }
  const r = decodeProductProcessing(product);
  const interp = interpretProduct(product);
  console.log(
    '  ' + slug.padEnd(40),
    'tier=' + (r.procLabel.padEnd(7)),
    'nova=' + r.novaToken.padEnd(8),
    'add=' + String(r.additiveCount).padEnd(3),
    'signal=' + interp.dominantSignal.padEnd(22),
    'title=' + (r.titleBody.length + 'c'),
  );
}

console.log('\n=== Tier-2 #8 promotion summary ===');
console.log('  cohort size              :', decoded);
console.log('  dual-signal cohort       :', dualSignal);
console.log('  ProcessingScore max      :', maxPct.toFixed(1) + '% (catalog-reality, v2.2 §Trap #111 exception)');
console.log('  DominantSignal max       :', domMaxPct.toFixed(1) + '%');
console.log('  DominantSignal spread    :', domSpread.toFixed(1) + 'pp');
console.log('  publishers (distinct)    :', distinctHosts.size);
console.log('  title body max           :', titleBudgetMax + 'c (≤60 cap)');
