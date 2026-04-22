#!/usr/bin/env tsx
/**
 * build-sitemap.ts — Static sitemap XML generator for ingredipeek.
 *
 * PRUNING HISTORY (post-HCU March 2026):
 *   Pre-prune: ~44,000 URLs. Dominated by /es/product/[slug] × 21,469 —
 *              thin Spanish translation over identical ingredient data.
 *   2026-04-22: Option B+ prune (conservative). GSC shows real signal on EN
 *              /product/[slug] — products have genuine ingredient-lookup intent.
 *              Drop /es/product/ only. Keep all 21,469 EN products.
 *              Route stays live via dynamicParams=true.
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAllProductSlugsForSitemap, getAllBrands, getBrandSlug, getAllComparisonSlugs, getRotatingComparisonSlugs } from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllStates } from '../lib/states-data';
import { getAllGuides } from '../lib/guides';

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

// Product pages — full valid EN set, long-tail served via ISR fallback.
// 2026-04-22 HCU-defense: /es/product/ × 21,469 DROPPED — thin Spanish
// translation over identical ingredient data, zero GSC signal, competes
// with real Spanish ingredient databases. Route stays live via
// dynamicParams=true; existing /es/product/[slug] URLs remain 200.
// Conservative prune — keep all 21,469 EN products (real clicks on these).
for (const p of getAllProductSlugsForSitemap(50000)) {
  add({ url: `${SITE_URL}/product/${p.slug}/`, priority: '0.8', changefreq: 'monthly' });
}

// Comparison pages — CAPPED at 100 to match page.tsx (2026-04-22 HCU-defense).
// Previously emitted 5000 stable + rotating (far exceeded page prerender limit of 100).
const stableComps = getAllComparisonSlugs(100);
for (const c of stableComps) {
  add({ url: `${SITE_URL}/compare/${c.slug}/`, priority: '0.6', changefreq: 'monthly' });
}

// ─── Cardinality guard ────────────────────────────────────────────────────
if (entries.length > 30000 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `ingredipeek sitemap has ${entries.length.toLocaleString()} URLs — Option B+ budget is ~23K.\n` +
      `Did /es/product/ (21K) get re-added?\n` +
      `That's exactly the loop that caused the original cardinality collapse.\n` +
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
