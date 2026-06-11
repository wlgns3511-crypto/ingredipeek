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

// HCU 2026-05-04 — Bing impressions auto-union (separate index from Google).
const BING_JSON_DIR = path.resolve(process.cwd(), '..', '_shared', 'data', 'bing_analyze');
const BING_DOMAIN = 'ingredipeek.com';
const BING_MIN_IMP = 1;

function loadBingSlugs(routeRe: RegExp): string[] {
  if (!fs.existsSync(BING_JSON_DIR)) return [];
  const files = fs.readdirSync(BING_JSON_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (!files.length) return [];
  try {
    // 2026-06-11 partial-run shadow fix (kalimawize 2026-05-15 pattern): the
    // absolute-latest snapshot may be a partial run without this domain —
    // scan newest-first and use the first file that actually contains us.
    // Source-side carry-forward also added to analyze_bing_pages.py same day;
    // this is defense-in-depth for historical partial files.
    let site: any;
    for (let i = files.length - 1; i >= 0; i--) {
      const json = JSON.parse(fs.readFileSync(path.join(BING_JSON_DIR, files[i]), 'utf8'));
      if (json[BING_DOMAIN] && Array.isArray(json[BING_DOMAIN].pages)) { site = json[BING_DOMAIN]; break; }
    }
    if (!site || !Array.isArray(site.pages)) return [];
    const out = new Map<string, number>();
    for (const pg of site.pages) {
      const url = String(pg.url || '');
      const pathOnly = url.replace(/^https?:\/\/[^/]+/, '');
      const m = routeRe.exec(pathOnly);
      if (!m) continue;
      const slug = decodeURIComponent(m[1]);
      const imp = Number(pg.impressions) || 0;
      out.set(slug, (out.get(slug) || 0) + imp);
    }
    return [...out.entries()].filter(([, i]) => i >= BING_MIN_IMP).map(([s]) => s);
  } catch {
    return [];
  }
}

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
  // Bing impressions union — only slugs that exist in DB.
  const bingProducts = loadBingSlugs(/^\/product\/([^/]+)\/?$/);
  let productBingAdded = 0;
  for (const slug of bingProducts) {
    const exists = db.prepare(`SELECT 1 FROM products WHERE slug = ?`).get(slug);
    if (exists && !productSet.has(slug)) { productSet.add(slug); productBingAdded++; }
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
  // Bing impressions union — comparisons table existence check + reverse.
  const bingCompares = loadBingSlugs(/^\/compare\/([^/]+)\/?$/);
  let compareBingAdded = 0;
  for (const slug of bingCompares) {
    const exists = db.prepare(`SELECT 1 FROM comparisons WHERE slug = ?`).get(slug);
    if (!exists) continue;
    if (!compareSet.has(slug)) { compareSet.add(slug); compareBingAdded++; }
    const m = slug.match(/^(.+)-vs-(.+)$/);
    if (m) {
      const reverse = `${m[2]}-vs-${m[1]}`;
      if (!compareSet.has(reverse)) { compareSet.add(reverse); compareBingAdded++; }
    }
  }
  const compareSlugs = Array.from(compareSet).sort();

  // --- Brand keep-set (brands with >= 5 products) ---
  // The /brand/[slug]/ route was generating 935 pages by getAllBrands(1000),
  // and ~43% of those (rank 600-1000) had only 2-4 products, which is too
  // thin for the transparency-tier and allergen-fingerprint inject we're
  // adding. Cut to brands with >= 5 products in the catalog. Sites that
  // need fewer / more can adjust this threshold.
  type BrandRow = { brand: string; n: number };
  const brandRows = db.prepare(
    `SELECT brand, COUNT(*) AS n FROM products
       WHERE brand IS NOT NULL AND brand != ''
       GROUP BY brand HAVING n >= 5
       ORDER BY n DESC`,
  ).all() as BrandRow[];
  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const brandKeep: { brand: string; slug: string; productCount: number }[] = brandRows.map((r) => ({
    brand: r.brand,
    slug: slugify(r.brand),
    productCount: r.n,
  }));

  // Bing impressions union — re-include any brand Bing is impressing even if
  // it falls under the ≥5-product cap. Match by computed slug across full
  // brand list (no HAVING filter).
  const bingBrandSlugs = new Set(loadBingSlugs(/^\/brand\/([^/]+)\/?$/));
  let brandBingAdded = 0;
  if (bingBrandSlugs.size > 0) {
    const allBrandsRows = db.prepare(
      `SELECT brand, COUNT(*) AS n FROM products
         WHERE brand IS NOT NULL AND brand != ''
         GROUP BY brand`,
    ).all() as BrandRow[];
    const existingSlugs = new Set(brandKeep.map((b) => b.slug));
    for (const r of allBrandsRows) {
      const slug = slugify(r.brand);
      if (bingBrandSlugs.has(slug) && !existingSlugs.has(slug)) {
        brandKeep.push({ brand: r.brand, slug, productCount: r.n });
        existingSlugs.add(slug);
        brandBingAdded++;
      }
    }
  }

  // --- Write outputs ---
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const productOut = path.join(OUT_DIR, 'product-keep.json');
  fs.writeFileSync(productOut, JSON.stringify(productSlugs, null, 0) + '\n');

  const compareOut = path.join(OUT_DIR, 'compare-keep.json');
  fs.writeFileSync(compareOut, JSON.stringify(compareSlugs, null, 0) + '\n');

  const brandOut = path.join(OUT_DIR, 'brand-keep.json');
  fs.writeFileSync(brandOut, JSON.stringify(brandKeep, null, 0) + '\n');

  // --- Audit log ---
  console.log(`[keep-sets] product-keep.json: ${productSlugs.length} slugs (${baseProductSlugs.length} algo + ${productGscAdded} GSC + ${productBingAdded} Bing)`);
  console.log(`[keep-sets] compare-keep.json: ${compareSlugs.length} slugs (${compareRows.length} forward + reverses + ${compareGscAdded} GSC + ${compareBingAdded} Bing)`);
  console.log(`[keep-sets] brand-keep.json: ${brandKeep.length} brands (≥5 products + ${brandBingAdded} Bing)`);
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
