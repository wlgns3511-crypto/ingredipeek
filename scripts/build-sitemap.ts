#!/usr/bin/env tsx
/**
 * build-sitemap.ts — Static sitemap XML generator for ingredipeek.
 *
 * PRUNING HISTORY (post-HCU March 2026):
 *   Pre-prune: ~44,000 URLs. Dominated by /es/product/[slug] × 21,469 —
 *              thin Spanish translation over identical ingredient data.
 *   2026-04-22: Option B+ prune (conservative). Drop /es/product/ only.
 *              Kept all 21,469 EN products on dynamicParams=true.
 *   2026-04-24: HCU cardinality collapse. 1-month-old site, 41k
 *              discovered-not-indexed, 8.3k soft-404-ish. Programmatic
 *              21k EN products was too wide a moat for a new site to
 *              defend. Collapsed to the 2,000-slug keep-set built by
 *              scripts/build-keep-sets.ts (top-brand, real-ingredients
 *              filter). Middleware 410s the ~19k drop. Compare stays at
 *              100 (already capped). Run build-keep-sets.ts BEFORE this.
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAllBrands, getBrandSlug } from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllStates } from '../lib/states-data';
import { getAllGuides } from '../lib/guides';

// HCU 2026-04-24: sitemap now mirrors the render keep-set exactly. If these
// diverge we reintroduce the soft-404 gap between sitemap claims and live
// HTTP responses that Google flagged as the primary index-bloat signal.
const productKeep: string[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'generated', 'product-keep.json'), 'utf8'),
);
const compareKeep: string[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'generated', 'compare-keep.json'), 'utf8'),
);

const SITE_URL = 'https://ingredipeek.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

const ALLERGEN_TYPES = ['gluten-free', 'vegan', 'halal', 'nut-free', 'dairy-free', 'organic', 'vegetarian'];

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }
function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}
function writeShard(id: number, entries: Entry[]) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Static pages
add({ url: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' });
add({ url: `${SITE_URL}/about/`, priority: '0.5', changefreq: 'monthly' });
add({ url: `${SITE_URL}/privacy/`, priority: '0.3', changefreq: 'monthly' });
add({ url: `${SITE_URL}/terms/`, priority: '0.3', changefreq: 'monthly' });
add({ url: `${SITE_URL}/contact/`, priority: '0.4', changefreq: 'monthly' });

// Allergen pages
for (const type of ALLERGEN_TYPES) {
  add({ url: `${SITE_URL}/allergen/${type}/`, priority: '0.9', changefreq: 'weekly' });
}

// Brand pages — Set-based dedup to catch slug collisions (audit: 402 duplicates eliminated)
const brandSlugSeen = new Set<string>();
for (const b of getAllBrands(1000)) {
  const slug = getBrandSlug(b.brand);
  if (brandSlugSeen.has(slug)) continue;
  brandSlugSeen.add(slug);
  add({ url: `${SITE_URL}/brand/${slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// Guide pages
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of getAllGuides()) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt || NOW, priority: '0.7', changefreq: 'monthly' });
}

// Blog pages
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of getAllPosts()) {
  add({ url: `${SITE_URL}/blog/${p.slug}/`, lastmod: p.updatedAt ?? p.publishedAt, priority: '0.7', changefreq: 'monthly' });
}

// State pages
add({ url: `${SITE_URL}/state/`, priority: '0.8', changefreq: 'weekly' });
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// Product pages — 2,000 keep-set only (HCU 2026-04-24).
// See scripts/build-keep-sets.ts for selection rules. Middleware 410s any
// /product/<slug>/ not in this set, so the sitemap and the live surface are
// guaranteed 1:1.
for (const slug of productKeep) {
  add({ url: `${SITE_URL}/product/${slug}/`, priority: '0.8', changefreq: 'monthly' });
}

// ─── /compare/ pairs DROPPED 2026-04-26 (HCU/AdSense scaled-content remediation) ──
// Precedent: 14-site Stage 1 sweep 4/26 (safecitypeek, homepricepeek, etc.)
// page.tsx now sets robots: {index:false, follow:true}. Announcing noindex'd
// derivative pages in sitemap is a contradiction + crawl-budget waste.
// Pages still render (dynamicParams=false, 404-safe) for direct visitors.
// /compare/ index hub kept (real product page); ~100 pair URLs dropped.
add({ url: `${SITE_URL}/compare/`, priority: '0.8', changefreq: 'monthly' });
// for (const slug of compareKeep) {
//   const m = slug.match(/^(.+)-vs-(.+)$/);
//   if (!m) continue;
//   // Emit only the canonical ordering (a < b).
//   if (m[1] < m[2]) {
//     add({ url: `${SITE_URL}/compare/${slug}/`, priority: '0.6', changefreq: 'monthly' });
//   }
// }

// ─── Cardinality guard ────────────────────────────────────────────────────
// HCU 2026-04-24: budget is ~2,300 (2,000 products + ~100 canonical compares
// + ~200 static/brand/guide/blog/state). If this ever exceeds 5K unintended,
// something expanded — fail loud so we don't silently regress into the
// 44K bloat that caused the HCU hit in the first place.
if (entries.length > 5000 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `ingredipeek sitemap has ${entries.length.toLocaleString()} URLs — HCU 2026-04-24 budget is ~2,300.\n` +
      `Either the product keep-set grew past 2K, /es/product/ came back, or /compare/ uncapped.\n` +
      `Check scripts/build-keep-sets.ts and app/*/generateStaticParams before expanding.\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// Clean old sitemap files
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  const idx = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) => `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), idx);
}
console.log(`✓ ${entries.length} URLs, ${shardCount || 1} shard(s)`);
