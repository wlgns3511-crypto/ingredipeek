import { getNutriScoreRank, getNovaGroupDistribution, countAllergenFreeProducts, countAllProducts } from "@/lib/db";
import type { Product } from "@/lib/db";

interface Props {
  product: Product;
}

export function InsightCards({ product }: Props) {
  const totalProducts = countAllProducts();

  // NutriScore rank
  const nutriRank = product.nutriscore ? getNutriScoreRank(product.nutriscore) : null;
  const nutriLabel: Record<string, string> = { a: "Excellent", b: "Good", c: "Average", d: "Poor", e: "Bad" };
  const nutriColor: Record<string, string> = { a: "text-emerald-700", b: "text-green-600", c: "text-yellow-600", d: "text-orange-600", e: "text-red-600" };

  // NOVA distribution
  const novaDist = getNovaGroupDistribution();
  const novaLabels: Record<number, string> = { 1: "Unprocessed", 2: "Culinary", 3: "Processed", 4: "Ultra-processed" };
  const novaColors: Record<number, string> = { 1: "text-emerald-700", 2: "text-green-600", 3: "text-yellow-600", 4: "text-red-600" };

  // Allergen count
  const allergenKeys = ["allergen_milk", "allergen_gluten", "allergen_nuts", "allergen_soy", "allergen_eggs", "allergen_fish", "allergen_shellfish", "allergen_peanuts"] as const;
  const allergenCount = allergenKeys.filter((k) => product[k] === 1).length;
  const allergenFreeCount = countAllergenFreeProducts();
  const allergenFreePct = totalProducts > 0 ? Math.round((allergenFreeCount / totalProducts) * 100) : 0;

  // Clean label score (heuristic: higher = cleaner)
  const cleanScore = (() => {
    let score = 100;
    if (product.nova_group === 4) score -= 40;
    else if (product.nova_group === 3) score -= 20;
    else if (product.nova_group === 2) score -= 10;
    if (allergenCount > 0) score -= allergenCount * 5;
    const ns = product.nutriscore?.toLowerCase();
    if (ns === "d") score -= 15;
    else if (ns === "e") score -= 25;
    else if (ns === "a") score += 10;
    return Math.max(0, Math.min(100, score));
  })();
  const cleanLabel = cleanScore >= 80 ? "Very Clean" : cleanScore >= 60 ? "Clean" : cleanScore >= 40 ? "Moderate" : "Low";
  const cleanColor = cleanScore >= 80 ? "text-emerald-700" : cleanScore >= 60 ? "text-green-600" : cleanScore >= 40 ? "text-yellow-600" : "text-red-600";

  const cards: { label: string; value: string; sub: string; color: string }[] = [];

  if (product.nutriscore) {
    const grade = product.nutriscore.toUpperCase();
    cards.push({
      label: "Nutri-Score",
      value: grade,
      sub: nutriLabel[product.nutriscore.toLowerCase()] || "Unrated",
      color: nutriColor[product.nutriscore.toLowerCase()] || "text-slate-700",
    });
  }

  if (product.nova_group) {
    const total = Object.values(novaDist).reduce((a, b) => a + b, 0);
    const pct = total > 0 ? Math.round((novaDist[product.nova_group] / total) * 100) : 0;
    cards.push({
      label: "Processing Level",
      value: `NOVA ${product.nova_group}`,
      sub: `${novaLabels[product.nova_group]} (${pct}% of products)`,
      color: novaColors[product.nova_group] || "text-slate-700",
    });
  }

  cards.push({
    label: "Allergen Status",
    value: allergenCount === 0 ? "Free" : `${allergenCount} of 8`,
    sub: allergenCount === 0 ? `Top ${allergenFreePct}% cleanest` : `Contains ${allergenCount} major allergen${allergenCount > 1 ? "s" : ""}`,
    color: allergenCount === 0 ? "text-emerald-700" : allergenCount <= 2 ? "text-yellow-600" : "text-red-600",
  });

  cards.push({
    label: "Clean Label Score",
    value: `${cleanScore}`,
    sub: cleanLabel,
    color: cleanColor,
  });

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-emerald-900 mb-3">Quick Insights</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
