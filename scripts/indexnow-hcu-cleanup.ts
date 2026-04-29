// HCU 2026-04-24 IndexNow cleanup submission for ingredipeek.
// Mirrors the tariffpeek pattern: reassert the keep-set + nudge Google on
// a sample of killed URLs so the 410 signal propagates faster than organic
// recrawl would achieve.
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'foods.db');
const HOST = 'ingredipeek.com';
// IndexNow key exposed at https://ingredipeek.com/7f34f78e26294cdbb74d05b254a16312.txt
const KEY = '7f34f78e26294cdbb74d05b254a16312';

const productKeep: string[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'lib', 'generated', 'product-keep.json'), 'utf8'),
);
const compareKeep: string[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'lib', 'generated', 'compare-keep.json'), 'utf8'),
);

const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
const productKeepSet = new Set(productKeep);
const compareKeepSet = new Set(compareKeep);

// Sample of killed product slugs: pull 800 random slugs that are NOT in the
// keep-set (exactly the ones middleware 410s). Plus a sample of killed
// compare slugs (there are only 985 outside the 200-keep anyway).
const killedProducts = db.prepare(
  `SELECT slug FROM products WHERE slug IS NOT NULL AND slug NOT IN (SELECT value FROM json_each(?)) ORDER BY RANDOM() LIMIT 600`
).all(JSON.stringify(productKeep)) as { slug: string }[];

const killedCompares = db.prepare(
  `SELECT slug FROM comparisons WHERE slug NOT IN (SELECT value FROM json_each(?)) LIMIT 200`
).all(JSON.stringify(compareKeep)) as { slug: string }[];

// Also nudge the /es/product/ sample. Google has 474 of these indexed or
// crawled-not-indexed; pick 200 random slugs to signal 410.
const killedEs = db.prepare(
  `SELECT slug FROM products WHERE slug IS NOT NULL ORDER BY RANDOM() LIMIT 200`
).all() as { slug: string }[];

const keptUrls = [
  `https://${HOST}/`,
  `https://${HOST}/es/`,
  `https://${HOST}/sitemap.xml`,
  ...productKeep.map((s) => `https://${HOST}/product/${s}/`),
  // Only canonical compare direction for sitemap parity
  ...compareKeep
    .filter((s) => {
      const m = s.match(/^(.+)-vs-(.+)$/);
      return m && m[1] < m[2];
    })
    .map((s) => `https://${HOST}/compare/${s}/`),
];

const killedUrls = [
  ...killedProducts.map((p) => `https://${HOST}/product/${p.slug}/`),
  ...killedCompares.map((c) => `https://${HOST}/compare/${c.slug}/`),
  ...killedEs.map((p) => `https://${HOST}/es/product/${p.slug}/`),
];

async function submit(label: string, urls: string[]) {
  console.log(`[${label}] submitting ${urls.length} URLs...`);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls.slice(0, 10000),
    }),
  });
  const body = await res.text();
  console.log(`[${label}] status ${res.status} ${body ? `body="${body.slice(0, 200)}"` : ''}`);
}

(async () => {
  console.log(`kept=${keptUrls.length} killed=${killedUrls.length}`);
  await submit('KEPT', keptUrls);
  await submit('KILLED', killedUrls);
  db.close();
})();
