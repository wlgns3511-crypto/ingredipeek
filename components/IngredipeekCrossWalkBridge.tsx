/**
 * Phase 7 P5 — DataPeek Network cross-walk bridge for ingredipeek.
 *
 * Links the composed ProcessingScore × additive × allergen verdict on
 * /product/[slug]/ to three portfolio siblings whose entity-cohort is
 * adjacent to the food-product reading order. The product slug (OpenFoodFacts
 * name + 6-digit barcode tail) is NOT a shared join key with the siblings
 * (caloriewize uses FDC IDs, medcostpeek uses procedure slugs, medcheckwize
 * uses USPS state slugs), so the bridge links to each sibling's directory
 * landing page with role-tied anchors that explain the join rationale.
 *
 * Why these three:
 *  - caloriewize    = calorie + macro detail for the same OpenFoodFacts /
 *                     USDA FDC food entity reading order (the shopper looking
 *                     at additives is the shopper also tracking macros)
 *  - medcostpeek    = diet-driven health cost (allergy / intolerance →
 *                     allergist visit + epinephrine + ED visit cost paths)
 *  - medcheckwize   = state Medicare beneficiary diet context (senior cohort
 *                     reading the ingredient label is the cohort with state-
 *                     keyed Medicare stack exposure)
 */
interface Props {
  /** Full product name (used for the contextual lead-in sentence). */
  productName: string;
  /** Brand if present — included in the lead-in for relevance signalling. */
  brand: string | null;
}

const SIBLING_SITES = [
  {
    domain: 'caloriewize.com',
    path: '/food/',
    label: 'CalorieWize',
    anchor: 'Calorie & macro detail',
    role: 'USDA FoodData Central calorie + macronutrient detail for the same food entity reading order',
  },
  {
    domain: 'medcostpeek.com',
    path: '/procedure/',
    label: 'MedCostPeek',
    anchor: 'Diet-driven health cost',
    role: 'Allergy / intolerance procedure cost — allergist visit, epinephrine refill, ED visit pathways',
  },
  {
    domain: 'medcheckwize.com',
    path: '/state/',
    label: 'MedCheckWize',
    anchor: 'State Medicare beneficiary context',
    role: 'State Medicare stack (Part B + D + Medigap) for the senior cohort reading ingredient labels on a fixed-income diet',
  },
] as const;

export function IngredipeekCrossWalkBridge({ productName, brand }: Props) {
  const subject = brand ? `${productName} by ${brand}` : productName;
  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-green-700 mb-2">
        DataPeek cross-walk · adjacent context
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Reading the ingredient panel on {subject} rarely sits in isolation —
        the same shopper is usually tracking macros, watching out-of-pocket
        cost when food allergies escalate, or reading on behalf of a senior
        beneficiary on Medicare. These sibling surfaces carry the adjacent
        cohort context:
      </p>
      <ul className="grid sm:grid-cols-3 gap-3">
        {SIBLING_SITES.map((site) => (
          <li key={site.domain}>
            <a
              href={`https://${site.domain}${site.path}`}
              rel="external noopener"
              className="block rounded-lg border border-slate-200 p-3 hover:border-green-400 transition-colors"
            >
              <div className="text-sm font-semibold text-slate-900">
                {site.anchor}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{site.label}</div>
              <div className="text-xs text-slate-600 mt-1">{site.role}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
