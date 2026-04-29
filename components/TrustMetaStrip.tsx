// Trust meta strip — catalog-cardinality signal for hub/policy pages.
//
// Differs from upgrades/TrustBlock (which carries sources + freshness):
// this strip is a depth signal — concrete product/brand/state counts +
// coverage percentages. Goal is "this is a real catalog, not a thin
// programmatic site." Used on /, /about/, /checker/, /methodology/, /search/.

import { getTrustMeta, formatPercent } from "@/lib/product-facts";

export function TrustMetaStrip({ className = "mb-8" }: { className?: string }) {
  const m = getTrustMeta();
  return (
    <section
      aria-label="Catalog snapshot"
      className={`rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Catalog snapshot
        </p>
        <p className="text-xs text-slate-500">
          {m.buildMonth}
        </p>
      </div>
      <p className="text-sm text-slate-800 tabular-nums">
        <span className="font-semibold">{m.productCount.toLocaleString()}</span> products
        {" · "}
        <span className="font-semibold">{m.brandCount.toLocaleString()}</span> brands tracked
        {" · "}
        <span className="font-semibold">{m.stateCount}</span> U.S. states
        {" · "}
        <span className="font-semibold">{m.productPagesIndexed.toLocaleString()}</span> indexed product pages
      </p>
      <p className="text-xs text-slate-600 mt-1.5">
        Ingredient-list coverage{" "}
        <span className="font-semibold tabular-nums">{formatPercent(m.ingredientCoverage * 100, 1)}</span>
        {" · "}
        NOVA-rated{" "}
        <span className="font-semibold tabular-nums">{formatPercent(m.novaRatedShare * 100, 1)}</span>
        {" · "}
        Open Food Facts ODbL · cross-checked vs FDA / USDA
      </p>
      <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
        <a href="/methodology/" className="text-emerald-700 hover:underline">Methodology</a>
        {" · "}
        <a href="/about/" className="text-emerald-700 hover:underline">About</a>
        {" · "}
        <a href="/disclaimer/" className="text-emerald-700 hover:underline">Disclaimer</a>
      </p>
    </section>
  );
}
