/**
 * Open Food Facts image_url backfill for ingredipeek.
 *
 * Of 21,469 products, only 1,466 (7%) currently have an image_url. The
 * page.tsx render layer already handles product.image_url present-or-not
 * (line 311: `{product.image_url && <img …>}`). So the visual-identity
 * win here is purely a data-layer backfill: ask OFF per barcode for
 * `image_front_url`, stash it.
 *
 * Endpoint: https://world.openfoodfacts.org/api/v2/product/{barcode}
 *   - free, no auth
 *   - recommend "be polite" (~200-400ms between requests)
 *   - returns null when product is unknown to OFF
 *
 * Resume-aware: products with image_url already set are skipped. The
 * script can be killed and resumed at any time without losing progress
 * because every successful lookup commits a single UPDATE.
 *
 * Polite delay 250ms; descriptive UA per OFF policy.
 */
import Database from 'better-sqlite3';
import path from 'path';

const UA = 'ingredipeek/1.0 (https://ingredipeek.com; wlgns3511@gmail.com) backfill script';
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data/foods.db');

interface ProductRow { barcode: string; slug: string; image_url: string | null }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface OffProductResponse {
  status?: number;
  product?: {
    image_front_url?: string;
    image_url?: string;
    image_small_url?: string;
  };
}

async function fetchOff(barcode: string, attempt = 1): Promise<string | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=image_front_url,image_url,image_small_url`;
  let r: Response;
  try {
    r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  } catch (e) {
    if (attempt > 3) throw e;
    await sleep(2 ** attempt * 1000);
    return fetchOff(barcode, attempt + 1);
  }
  if (r.status === 429 || r.status === 503) {
    if (attempt > 4) throw new Error(`HTTP ${r.status} after 4 retries`);
    const retryAfter = Number(r.headers.get('retry-after')) || (2 ** attempt);
    await sleep(retryAfter * 1000);
    return fetchOff(barcode, attempt + 1);
  }
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = (await r.json()) as OffProductResponse;
  if (data.status === 0 || !data.product) return null;
  const u = data.product.image_front_url ?? data.product.image_url ?? null;
  if (!u || !u.startsWith('http')) return null;
  return u;
}

/**
 * Worker-pool runner: 12-way (250ms intra-worker = ~40 req/s) experiment
 * triggered hard OFF rate-limit punishment — 53% HTTP 429 cascade, effective
 * 0.5 req/s, ~11hr ETA. OFF v2 read limit is documented at 100 req/min per IP
 * (~1.67 req/s); once you cross it the IP enters extended cooldown and
 * 4-retry exponential backoff doesn't recover. Conservative settings now:
 * CONCURRENCY=1 + 1000ms intra-worker = ~0.7-0.8 req/s effective (accounting
 * for OFF response time), safely under the threshold. ETA ~5-7hr but zero
 * 429s expected.
 */
const CONCURRENCY = 1;

async function main() {
  const db = new Database(DB_PATH);
  const todo = db.prepare(
    `SELECT barcode, slug, image_url FROM products
     WHERE image_url IS NULL OR image_url = ''
     ORDER BY barcode`
  ).all() as ProductRow[];

  const totalRows = (db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }).c;
  const alreadyHave = totalRows - todo.length;
  console.log(`Backfilling ${todo.length} products (${alreadyHave}/${totalRows} already have image_url) at ${CONCURRENCY}-way concurrency…`);

  const updateStmt = db.prepare('UPDATE products SET image_url = ? WHERE barcode = ?');

  let resolved = 0;
  let missing = 0;
  let errors = 0;
  let done = 0;
  const startTs = Date.now();
  let lastLogTs = startTs;
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= todo.length) return;
      const p = todo[i];
      try {
        const url = await fetchOff(p.barcode);
        if (url) {
          updateStmt.run(url, p.barcode);
          resolved++;
        } else {
          updateStmt.run('-', p.barcode);
          missing++;
        }
      } catch (e) {
        errors++;
        if (errors <= 5) console.error(`  ${p.barcode}  ERR ${(e as Error).message}`);
      }
      done++;
      const now = Date.now();
      if (now - lastLogTs > 30_000) {
        lastLogTs = now;
        const pct = ((done / todo.length) * 100).toFixed(1);
        const rate = done / ((now - startTs) / 1000);
        const eta = Math.round((todo.length - done) / rate / 60);
        console.log(`  [${done}/${todo.length}  ${pct}%]  ok=${resolved} miss=${missing} err=${errors}  ${rate.toFixed(1)} req/s  ETA ${eta}min`);
      }
      // Per-worker delay keeps each worker well under OFF's 100 req/min limit.
      await sleep(1000);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  db.close();
  const elapsed = ((Date.now() - startTs) / 1000 / 60).toFixed(1);
  console.log(`\nDone in ${elapsed}min · resolved=${resolved} · OFF-unknown=${missing} · errors=${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });
