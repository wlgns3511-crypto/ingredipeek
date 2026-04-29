// HCU 2026-04-24 keep-set builder for ingredipeek.
//
// Problem context: a 1-month-old site with 21,469 product pages + 1,185
// compare pages. GSC shows 41k "discovered-not-indexed", 8.3k soft-404-ish
// long-tail, 4.5k "duplicate no canonical" on /compare/. This is classic
// programmatic bloat — Google is rejecting 80%+ of what we publish because
// the thin/duplicate ratio is too high. The tariffpeek HCU playbook applies:
// collapse cardinality to a curated keep-set, 410-Gone the rest so soft-404s
// deindex fast, let the survivors earn rankings.
//
// Emits two JSONs consumed by:
//   - middleware.ts              (keep-check at request time)
//   - app/product/[slug]/page.tsx (generateStaticParams)
//   - app/compare/[slug]/page.tsx (generateStaticParams)
//   - scripts/build-sitemap.ts   (sitemap surface)
//
// Keep-set selection:
//   Products (~2,000):
//     - require ingredients_text length >= 50 (real data, not stub)
//     - require non-null brand
//     - per-brand cap of 15 (prevents Kroger's 1,395 from hogging)
//     - within a brand, rank by ingredient length DESC (richer = better)
//     - across brands, sort by brand_size DESC (popular brands first)
//     - cap total at 2,000
//
//   Comparisons (~100 base + reverses):
//     - first 100 from comparisons table (matches existing page cap)
//     - include reverse slug (a-vs-b AND b-vs-a) for middleware keep-check
//
// Why these thresholds:
//   - 15/brand: with ~400 top brands × 5 avg = 2k reasonable ceiling
//   - 50-char ingredients: OFF stub entries are typically "milk, sugar"
//     (<30 chars); real label data runs 80-400 chars
//   - 2k total: ~10% of catalog — matches Google's crawl acceptance rate
//     on this kind of programmatic site (crawl stats: 56% 200 today)

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'foods.db');
const OUT_DIR = path.join(process.cwd(), 'lib', 'generated');

const PRODUCT_CAP = 2000;
const PER_BRAND_CAP = 15;
const MIN_INGREDIENT_LEN = 50;
const COMPARE_CAP = 100;

// GSC evidence override: URLs earning >= 1 click in the 28d window
// (2026-03-24 ~ 2026-04-21) per get_gsc_report MCP. Unconditionally kept
// regardless of brand/ingredient rules — rule #1 is "don't kill pages
// Google is sending traffic to." First pass of the keep-set (brand-cap
// filter) missed 10 of these — the GSC winners are often generic products
// (ice-cream, soda) whose brand entry was blank/generic and lost the cap
// lottery. Refresh each re-cut via get_gsc_report.
const GSC_EVIDENCE_PRODUCTS = [
  'ice-cream-neapolitan-neapolitan-225045',
  'big-k-soda-lemon-lime-490483',
  'biscuits-with-almond-butter-468634',
  'mild-cheddar-cheese-586254',
  'bacon-jerky-879097',
  'barbecue-sauce-barbecue-009614',
  'beef-jerky-teriyaki-913319',
  'circus-peanuts-sweet-000116',
  'foco-coconut-water-with-lychee-916435',
  'ice-cream-583282',
  'italian-style-bread-crumbs-308569',
  'proscuito-707100',
];

const GSC_EVIDENCE_COMPARES = [
  'butter-herb-mashed-potatoes-872577-vs-tomato-ketchup-121241',
  'cookies-308767-vs-western-family-duos-chocolate-sandwich-cookies-173926',
  'ground-beef-burgers-beef-013256-vs-sliced-carrots-054780',
  'ice-cream-522137-vs-jelly-belly-candy-cane-jelly-beans-081122',
  'old-fashioned-cherry-pie-filling-133357-vs-vanilla-light-ice-cream-107276',
];

function main() {
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

  // --- Product keep-set ---
  type ProductRow = { slug: string; brand: string; ingr_len: number; rn_in_brand: number; brand_size: number };
  const productRows = db.prepare(`
    WITH brand_counts AS (
      SELECT brand, COUNT(*) AS brand_size
      FROM products
      WHERE slug IS NOT NULL
        AND brand IS NOT NULL AND brand != ''
        AND ingredients_text IS NOT NULL
        AND length(ingredients_text) >= ?
      GROUP BY brand
    ),
    ranked AS (
      SELECT p.slug,
             p.brand,
             length(p.ingredients_text) AS ingr_len,
             ROW_NUMBER() OVER (
               PARTITION BY p.brand
               ORDER BY length(p.ingredients_text) DESC, p.name
             ) AS rn_in_brand,
             bc.brand_size
      FROM products p
      JOIN brand_counts bc ON p.brand = bc.brand
      WHERE p.slug IS NOT NULL
        AND p.ingredients_text IS NOT NULL
        AND length(p.ingredients_text) >= ?
    )
    SELECT slug, brand, ingr_len, rn_in_brand, brand_size
    FROM ranked
    WHERE rn_in_brand <= ?
    ORDER BY brand_size DESC, rn_in_brand ASC, slug ASC
    LIMIT ?
  `).all(MIN_INGREDIENT_LEN, MIN_INGREDIENT_LEN, PER_BRAND_CAP, PRODUCT_CAP) as ProductRow[];

  const baseProductSlugs = productRows.map((r) => r.slug);
  // Union algorithmic selection + GSC evidence. Dedup via Set.
  const productSet = new Set<string>(baseProductSlugs);
  let productGscAdded = 0;
  for (const slug of GSC_EVIDENCE_PRODUCTS) {
    if (!productSet.has(slug)) { productSet.add(slug); productGscAdded++; }
  }
  const productSlugs = Array.from(productSet).sort();

  // Sanity floor: if something goes wrong (empty DB, bad query, schema change)
  // we'd rather fail the build than silently ship a tiny keep-set that 410s
  // everything. 1,000 is safely below expected 2,000.
  if (productSlugs.length < 1000) {
    throw new Error(
      `Product keep-set only has ${productSlugs.length} slugs (expected >= 1000). ` +
      `Aborting to avoid accidental mass-410.`
    );
  }

  // Brand coverage stats for the audit log
  const brandHist = new Map<string, number>();
  for (const r of productRows) brandHist.set(r.brand, (brandHist.get(r.brand) ?? 0) + 1);

  // --- Compare keep-set ---
  type CmpRow = { slug: string; product_a: string; product_b: string };
  const compareRows = db.prepare(
    `SELECT slug, product_a, product_b FROM comparisons ORDER BY slug LIMIT ?`
  ).all(COMPARE_CAP) as CmpRow[];

  // For each forward slug, also add the reverse. Matches page.tsx behavior
  // (generateStaticParams emits both). Dedup via Set.
  const compareSet = new Set<string>();
  for (const row of compareRows) {
    compareSet.add(row.slug);
    const reverse = `${row.product_b}-vs-${row.product_a}`;
    if (reverse !== row.slug) compareSet.add(reverse);
  }
  // Union in GSC-evidence compares (+ reverses).
  let compareGscAdded = 0;
  for (const slug of GSC_EVIDENCE_COMPARES) {
    if (!compareSet.has(slug)) { compareSet.add(slug); compareGscAdded++; }
    const m = slug.match(/^(.+)-vs-(.+)$/);
    if (m) {
      const reverse = `${m[2]}-vs-${m[1]}`;
      if (!compareSet.has(reverse)) { compareSet.add(reverse); compareGscAdded++; }
    }
  }
  const compareSlugs = Array.from(compareSet).sort();

  // --- Write outputs ---
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const productOut = path.join(OUT_DIR, 'product-keep.json');
  fs.writeFileSync(productOut, JSON.stringify(productSlugs, null, 0) + '\n');

  const compareOut = path.join(OUT_DIR, 'compare-keep.json');
  fs.writeFileSync(compareOut, JSON.stringify(compareSlugs, null, 0) + '\n');

  // --- Audit log ---
  console.log(`[keep-sets] product-keep.json: ${productSlugs.length} slugs (${baseProductSlugs.length} algorithmic + ${productGscAdded} GSC-evidence)`);
  console.log(`[keep-sets] compare-keep.json: ${compareSlugs.length} slugs (${compareRows.length} forward + reverses + ${compareGscAdded} GSC-evidence)`);
  console.log(`[keep-sets] brand coverage: ${brandHist.size} brands`);

  // Top 10 brands in keep-set
  const topBrands = Array.from(brandHist.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  console.log(`[keep-sets] top brands in keep-set:`);
  for (const [brand, count] of topBrands) {
    console.log(`  ${count.toString().padStart(3)} ${brand}`);
  }

  db.close();
}

main();
