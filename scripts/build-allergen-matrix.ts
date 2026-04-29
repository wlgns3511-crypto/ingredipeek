// Allergen co-occurrence matrix builder for ingredipeek.
//
// First-party signal that Open Food Facts itself doesn't surface and that
// EWG / standard allergen sites don't quantify: given a product flagged
// for allergen X, what is the probability that the same product is also
// flagged for allergen Y? "Milk-allergic shoppers should also watch for
// soy" with a real percentage sitting next to it carries weight a generic
// allergen primer can't.
//
// SQL approach: for each pair (X,Y) of the 8 allergen flags, count the
// rows where both = 1. Diagonal cell = total flagged for X. Conditional
// probability P(Y|X) = count(X∩Y) / count(X). Co-occurrence list per
// allergen is the top 3 P(Y|X) for Y != X.
//
// Consumed by:
//   - lib/product-facts.ts    (getAllergenCoOccurrence)
//   - app/allergen/[type]/    (Layer 1++ inject — co-occurrence top-3 card)

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'foods.db');
const OUT_PATH = path.join(process.cwd(), 'lib', 'generated', 'allergen-matrix.json');

const ALLERGENS = ['milk', 'gluten', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'peanuts'] as const;
type Allergen = (typeof ALLERGENS)[number];

interface CoOccur {
  allergen: Allergen;
  pct: number;
}

interface PerAllergen {
  total: number;
  coOccur: CoOccur[];
}

interface Output {
  generatedAt: string;
  totalProducts: number;
  perAllergen: Record<Allergen, PerAllergen>;
}

function main() {
  const db = new Database(DB_PATH, { readonly: true });

  const totalProducts = (db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number }).n;

  const totals = new Map<Allergen, number>();
  for (const a of ALLERGENS) {
    const row = db.prepare(`SELECT SUM(allergen_${a}) AS n FROM products`).get() as { n: number | null };
    totals.set(a, row.n ?? 0);
  }

  const cells = new Map<string, number>();
  for (const x of ALLERGENS) {
    for (const y of ALLERGENS) {
      if (x === y) continue;
      const row = db.prepare(
        `SELECT COUNT(*) AS n FROM products WHERE allergen_${x} = 1 AND allergen_${y} = 1`,
      ).get() as { n: number };
      cells.set(`${x}|${y}`, row.n);
    }
  }

  const perAllergen = {} as Record<Allergen, PerAllergen>;
  for (const x of ALLERGENS) {
    const xTotal = totals.get(x) ?? 0;
    const coOccur: CoOccur[] = ALLERGENS.filter((y) => y !== x).map((y) => {
      const both = cells.get(`${x}|${y}`) ?? 0;
      const pct = xTotal === 0 ? 0 : (both / xTotal) * 100;
      return { allergen: y as Allergen, pct: Math.round(pct * 10) / 10 };
    });
    coOccur.sort((a, b) => b.pct - a.pct);
    perAllergen[x] = { total: xTotal, coOccur: coOccur.slice(0, 3) };
  }

  const out: Output = {
    generatedAt: new Date().toISOString().slice(0, 10),
    totalProducts,
    perAllergen,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log(`[allergen-matrix] ${totalProducts} products, 8 allergens`);
  for (const a of ALLERGENS) {
    const e = perAllergen[a];
    const top = e.coOccur.map((c) => `${c.allergen} ${c.pct}%`).join(', ');
    console.log(`  ${a.padEnd(10)} ${e.total.toString().padStart(5)} → ${top}`);
  }

  db.close();
}

main();
