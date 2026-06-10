import type { Metadata } from "next";
import { TrustMetaStrip } from "@/components/TrustMetaStrip";
import { REGULATORY_REFS } from "@/lib/content-helpers";
import { AuthorBox } from "@/components/AuthorBox";
import { METHODOLOGY_VINTAGE } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Our Methodology — How IngredIPeek Builds Its Food Data",
  description:
    "Exactly how IngredIPeek sources, cleans, and presents food ingredient, allergen, and nutrition data — anchored in Open Food Facts and cross-referenced with FDA and USDA standards.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <div className="not-prose">
        <TrustMetaStrip />
      </div>
      <p className="lead text-lg text-slate-600">
        Food allergies and diet decisions are real health matters, so we
        want to be fully transparent about where our product data comes
        from, how we process it, and what it can and cannot tell you.
        IngredIPeek is an information tool, not a medical reference —
        but the information should still be trustworthy.
      </p>

      <h2>Primary source: Open Food Facts</h2>
      <p>
        Our product catalog is built on top of{" "}
        <a
          href="https://world.openfoodfacts.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Food Facts
        </a>
        , the world&apos;s largest open, collaborative food products
        database. Open Food Facts is structured like Wikipedia: volunteers
        worldwide scan barcodes, photograph labels, and transcribe
        ingredient lists, allergens, and nutrition facts directly from
        packaging. The database is released under an Open Database
        License (ODbL).
      </p>
      <p>For each product on IngredIPeek we pull:</p>
      <ul>
        <li>name, brand, and barcode,</li>
        <li>full ingredients text as it appears on the label,</li>
        <li>
          the declared allergens (milk, gluten, peanuts, tree nuts, soy,
          eggs, fish, shellfish, sesame),
        </li>
        <li>
          dietary suitability flags (vegan, vegetarian, halal, organic,
          gluten-free, dairy-free, lactose-free, nut-free),
        </li>
        <li>
          nutrition facts per 100 g (calories, fat, saturated fat, carbs,
          sugars, protein, salt, fiber),
        </li>
        <li>Nutri-Score and NOVA group classifications.</li>
      </ul>

      <h2>Nutri-Score (what the letter actually means)</h2>
      <p>
        Nutri-Score is a nutritional rating system developed by{" "}
        <a
          href="https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sant&eacute; publique France
        </a>{" "}
        and widely used across Europe. It assigns a letter A through E
        based on a formula that weighs less-desirable elements (calories,
        saturated fat, sugar, sodium) against more-desirable elements
        (fiber, protein, fruits/vegetables/legumes). It is a rough
        comparative scale, not a verdict on any one food — context
        matters (portion size, frequency, overall diet).
      </p>

      <h2>NOVA food-processing classification</h2>
      <p>
        The NOVA classification is an academic framework developed at the
        University of S&atilde;o Paulo that groups foods by the extent of
        industrial processing:
      </p>
      <ul>
        <li>
          <strong>NOVA 1</strong> &mdash; unprocessed or minimally processed
          (fresh fruit, milk, plain rice).
        </li>
        <li>
          <strong>NOVA 2</strong> &mdash; processed culinary ingredients
          (sugar, oil, salt).
        </li>
        <li>
          <strong>NOVA 3</strong> &mdash; processed foods (canned vegetables,
          cheese, fresh bread).
        </li>
        <li>
          <strong>NOVA 4</strong> &mdash; ultra-processed foods
          (industrial formulations with additives, flavorings, and
          multiple processing steps).
        </li>
      </ul>
      <p>
        US research including work at the NIH Metabolic Clinical Research
        Unit has linked higher ultra-processed (NOVA 4) intake with higher
        calorie consumption. We surface the NOVA group so you can factor
        it into your decision, not as a judgment.
      </p>

      <h2>ProcessingScore: composing NOVA + additive tier into one reader-help label</h2>
      <p>
        Raw NOVA group alone does not differentiate a single-additive NOVA 3 product
        (canned beans with citric acid) from a five-additive NOVA 3 product (bottled
        sauce with emulsifiers, preservatives, and color). To surface that distinction
        on every product page without forcing the reader to count additives manually,
        we compose NOVA group, FDA-tracked additive counts, and ingredient-list
        transparency into a single five-tier label we call <strong>ProcessingScore</strong>.
        The five tiers:
      </p>
      <ul>
        <li>
          <strong>Whole</strong> &mdash; NOVA group 1 with zero FDA-listed additives
          detected in the ingredient text. Single-ingredient or near-single-ingredient
          foods.
        </li>
        <li>
          <strong>Minimal</strong> &mdash; NOVA group 1 or 2 with at most two
          additives, all in the lower-concern FDA tier 1.
        </li>
        <li>
          <strong>Processed</strong> &mdash; NOVA group 3 with up to five additives,
          mostly tier 1-2. The bucket where most US packaged foods land.
        </li>
        <li>
          <strong>UltraProcessed</strong> &mdash; NOVA group 4, or five-plus additives
          regardless of NOVA group, or three-plus additives in FDA tier 3 (synthetic /
          controversial). Industrial formulations.
        </li>
        <li>
          <strong>OpaqueAdditive</strong> &mdash; the ingredient list in our source
          catalog is missing or under twenty characters. We cannot compute additive
          count honestly, so we file the product as OpaqueAdditive rather than guess
          at a tier. This is a &ldquo;data missing&rdquo; label, not a
          &ldquo;worse-than-UltraProcessed&rdquo; label.
        </li>
      </ul>
      <p>
        ProcessingScore is <strong>our heuristic</strong>, not an FDA, EFSA, USDA, or
        WHO-FAO Codex Alimentarius regulatory rating. The closest analogue is NOVA
        itself (Monteiro et al. 2019), but NOVA is a research framework rather than a
        regulatory rating. The cutoff numbers (zero, two, five, three) reflect editorial
        judgment about what differentiates the tiers meaningfully for a reader scanning
        a label. UltraProcessed describes processing degree, not safety &mdash; every
        additive in our tier 1-3 columns remains GRAS-listed and lawful in food sold in
        the United States under FDA 21 CFR 182, 184, and the GRAS notification pathway.
        Full explainer at .
      </p>

      <h2>AllergenSafetyMatrix: mapping our 8 columns onto FDA Top 9 + EU 14 + PAL</h2>
      <p>
        Our catalog ingests eight allergen flag columns from Open Food Facts (milk,
        eggs, fish, crustacean shellfish, tree nuts, peanuts, soy, and wheat/gluten).
        The FDA Top 9 &mdash; the major allergens required to be declared under the
        Food Allergen Labeling and Consumer Protection Act (FALCPA 2004) as amended by
        the FASTER Act of 2021 (which added sesame, effective January 2023) &mdash; has
        nine entries. The EU&apos;s parallel framework under Regulation 1169/2011
        requires declaration of fourteen allergens (the FDA Top 9 plus celery, mustard,
        lupin, molluscs, and sulphites). The <strong>AllergenSafetyMatrix</strong>
        decoder maps our eight columns onto these regulatory frames, surfaces the
        gaps honestly, parses voluntary precautionary-allergen-labeling (PAL) phrases
        from the Open Food Facts allergen text, and produces a four-tier risk label.
      </p>
      <ul>
        <li>
          <strong>Mapped to FDA Top 9.</strong> Eight of the nine FDA major allergens
          are tracked directly. The ninth &mdash; sesame &mdash; is{" "}
          <strong>not yet tracked as a separate column</strong> in our catalog. The
          decoder surfaces this gap explicitly under the &ldquo;not tracked&rdquo; key
          of the FDA-9 output rather than imply sesame coverage.
        </li>
        <li>
          <strong>EU 14 extension.</strong> The five EU-only allergens (celery,
          mustard, lupin, molluscs, sulphites) are also surfaced under &ldquo;not
          tracked.&rdquo; EU readers should consult the on-pack EU 1169/2011 label
          directly &mdash; we do not claim EU-equivalent coverage.
        </li>
        <li>
          <strong>PAL parsing.</strong> Voluntary &ldquo;may contain&rdquo; phrases are
          regex-matched in the Open Food Facts allergen text for nine allergens. A
          match raises the riskTier to PAL-Caution at minimum. PAL is voluntary under
          US FALCPA 2004 &mdash; absence of a PAL flag does <em>not</em> guarantee
          absence of cross-contamination in shared facilities.
        </li>
        <li>
          <strong>Four risk tiers.</strong> <em>Safe</em> (no FDA-9 contained, no PAL),
          <em>PAL-Caution</em> (PAL present but no FDA-9 contained),
          <em>Contains-Major</em> (one or two FDA-9 declared), and
          <em>Contains-Multiple</em> (three or more FDA-9 declared &mdash; the
          high-allergen-density bucket).
        </li>
      </ul>
      <p>
        The AllergenSafetyMatrix is reader help for scanning catalogs and brand pages.
        It is <strong>not</strong> a substitute for the on-pack label, and severely
        allergic users with diagnosed anaphylaxis history should always read the
        current packaging and follow guidance from FARE (Food Allergy Research &amp;
        Education) and the AAAAI (American Academy of Allergy, Asthma &amp;
        Immunology). The regulatory note attached to every decoder output cites
        FALCPA 2004, the FASTER Act 2021, and EU Regulation 1169/2011 so the
        governing statute is visible alongside the tier.
      </p>

      <h2>Allergen labeling and the US regulatory standard</h2>
      <p>
        US food packaging is governed by the{" "}
        <a
          href="https://www.fda.gov/food/food-labeling-nutrition/food-allergies"
          target="_blank"
          rel="noopener noreferrer"
        >
          FDA Food Allergen Labeling and Consumer Protection Act (FALCPA)
        </a>
        . FALCPA mandated clear declaration of 8 major allergens, and the
        FASTER Act of 2021 (effective January 2023) added sesame as the
        9th. Our allergen badges reflect the presence or absence of these
        9 allergens as declared in Open Food Facts from packaging.
      </p>
      <div className="not-prose border-l-4 border-amber-400 bg-amber-50 p-4 my-4 rounded-r">
        <p className="text-sm text-amber-900">
          <strong>Important safety note.</strong> An absence of a major
          allergen in our badges means the product&apos;s Open Food Facts
          entry does not declare that allergen. It does{" "}
          <em>not</em> guarantee the product is safe for someone with a
          diagnosed allergy. &ldquo;May contain&rdquo; cross-contamination
          warnings, production line changes, and formulation updates can
          change the allergen profile of a product without changing its
          barcode or name. Always read the actual current packaging and
          consult your allergist for clinical decisions.
        </p>
      </div>

      <h2>Cross-reference and verification</h2>
      <p>
        Each product page links out to authoritative references so you can
        verify anything that matters for a health decision:
      </p>
      <ul>
        <li>
          <a
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Food Facts
          </a>{" "}
          — the primary community database (every product links to
          its OFF page).
        </li>
        <li>
          <a
            href="https://fdc.nal.usda.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            USDA FoodData Central
          </a>{" "}
          — the US government&apos;s authoritative nutrition database
          for generic foods and branded products.
        </li>
        <li>
          <a
            href="https://www.fda.gov/food/food-labeling-nutrition/food-allergies"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA Food Allergies page
          </a>{" "}
          — the official US consumer-facing guidance on the 9 major
          allergens.
        </li>
        <li>
          The actual product packaging — the only fully authoritative
          source for a specific batch.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        Open Food Facts is updated continuously by contributors worldwide.
        We refresh our cached snapshot regularly and immediately when we
        receive a correction that identifies a material labeling change
        for a specific product.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>Crowdsourced data.</strong> Open Food Facts entries are
          added by volunteers. Most entries are accurate, but
          transcription errors happen. Always verify critical allergen
          information against the physical packaging.
        </li>
        <li>
          <strong>Snapshot in time.</strong> We refresh periodically, so a
          product may have changed its ingredients since we last synced.
          The packaging is the source of truth.
        </li>
        <li>
          <strong>No &ldquo;may contain&rdquo; modeling.</strong> Our
          allergen badges reflect declared allergens in the ingredient
          list. Cross-contamination risk from shared facilities is not in
          the structured data.
        </li>
        <li>
          <strong>Coverage varies by region.</strong> Open Food Facts has
          deeper coverage for European products than for some US
          regional brands. If a product isn&apos;t in our database, it
          likely isn&apos;t in Open Food Facts yet.
        </li>
        <li>
          <strong>Not medical advice.</strong> Nothing on IngredIPeek
          should be used as a substitute for advice from a licensed
          allergist, dietitian, or physician. For clinical decisions,
          consult a qualified professional.
        </li>
      </ul>

      <h2>Authority sources we cross-check against</h2>
      <p>
        Open Food Facts is our primary catalog, but for additive risk,
        allergen labeling, and processing classifications we anchor each
        claim to the original regulator. The links below are the actual
        canonical pages — if any of these change, the change ripples to
        every product page on the next deploy.
      </p>
      <ul className="not-prose mt-3 mb-6 grid gap-2 sm:grid-cols-2 text-sm">
        {Object.values(REGULATORY_REFS).map((r) => (
          <li key={r.url} className="flex items-start gap-2 leading-snug">
            <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              {r.label}
            </a>
          </li>
        ))}
      </ul>

      <h2>NutrientDensityBand — PSU 2차 (2026-05-12)</h2>
      <p>
        The third formal lever is the NutrientDensityBand, added in PSU 2차 atop the two existing
        levers. It reads the OpenFoodFacts per-100 g nutriment row (protein, fiber, saturated fat,
        salt → sodium, total sugars, calories) against the FDA Daily Value reference amounts
        codified at 21 CFR 101.9(c) for a 2,000-kcal reference diet — the same numbers an FDA-mandated
        Nutrition Facts panel uses to compute the % Daily Value column.
      </p>
      <p>
        The Daily Value constants used by the classifier in lib/nutrient-density-band.ts:
      </p>
      <ul>
        <li>Protein: 50 g/day (FDA 21 CFR 101.9(c)(7)(iii))</li>
        <li>Dietary fiber: 28 g/day (FDA 21 CFR 101.9(c)(6)(ii))</li>
        <li>Saturated fat: 20 g/day (FDA 21 CFR 101.9(c)(2)(i))</li>
        <li>Sodium: 2,300 mg/day (FDA 21 CFR 101.9(c)(4))</li>
        <li>Added sugars: 50 g/day (FDA 21 CFR 101.9(c)(6)(i)(B), surfaced 2020)</li>
        <li>Salt-to-sodium conversion: 0.393 (1 g NaCl → 393 mg Na)</li>
      </ul>
      <p>
        Tier cutoffs are our reading of the FDA &quot;5/20 rule&quot; (5% DV or less is low, 20% DV
        or more is high) applied as a composite over the four beneficial-vs-limiting DV ratios per
        100 g. Beneficial DV = protein + fiber. Limiting DV = saturated fat + sodium + sugars. The
        boundary rules are:
      </p>
      <ul>
        <li>
          <strong>LimitingDense</strong>: limiting DV ≥ 50% per 100 g — saturated fat + sodium +
          sugars sum to half or more of the FDA Daily Value, regardless of beneficial DV.
        </li>
        <li>
          <strong>NutrientRich</strong>: beneficial DV ≥ 30% AND limiting DV ≤ 15% per 100 g —
          high in protein + fiber, low in saturated fat / sodium / sugars.
        </li>
        <li>
          <strong>NutrientDense</strong>: beneficial DV ≥ 20% AND limiting DV ≤ 25% per 100 g —
          moderate-to-high beneficial, moderate limiting.
        </li>
        <li>
          <strong>NutrientSparse</strong>: beneficial DV &lt; 10% AND limiting DV &lt; 25% per 100 g
          — contributes little nutrient density beyond calories.
        </li>
        <li>
          <strong>Acceptable</strong>: middle bands across both dimensions.
        </li>
        <li>
          <strong>DataIncomplete</strong>: fewer than two beneficial AND fewer than two limiting
          nutriments populated on the OpenFoodFacts row — we surface this honestly rather than
          back-fill from category averages.
        </li>
      </ul>
      <p>
        Total sugars is used as a proxy because OpenFoodFacts does not isolate added sugars in the
        per-100 g row; whole-fruit and milk sugars inflate the band for some products and the caveat
        surfaces on every product page. USDA FoodData Central is the cross-reference for FDC IDs
        that ship the same per-100 g panel under USDA jurisdiction rather than FDA jurisdiction. CDC
        food-allergy surveillance and NIH ODS nutrient fact sheets provide ancillary context. The
        on-pack FDA-mandated Nutrition Facts panel remains authoritative for any product an
        individual actually consumes.
      </p>

      <h2>Composite four-paragraph interpretation</h2>
      <p>
        The product page also surfaces a 4-paragraph composite interpretation
        (lib/ingredient-interpretation.ts) that cross-reads all three formal levers
        (ProcessingScore × AllergenSafetyMatrix × NutrientDensityBand). The composite returns:
      </p>
      <ul>
        <li>A verdict sentence anchored to FDA / FALCPA / USDA / WHO-FAO Codex authorities;</li>
        <li>One of six dominant-signal patterns (whole-and-safe, whole-but-allergenic, ultra-but-empty, ultra-and-allergenic, mixed-tradeoff, data-incomplete);</li>
        <li>One of four decision-framings (label-literate, allergen-vigilant, clinician-route, data-incomplete);</li>
        <li>Four paragraphs (processing / allergen / density / synthesis);</li>
        <li>Eight authority citations including FDA 21 CFR 101 (FALCPA 2004 + FASTER Act 2021), USDA FoodData Central, EU Regulation 1169/2011 Annex II, Codex Alimentarius STAN 1-1985, Monteiro et al. 2019 NOVA, CDC food-allergy surveillance, and NIH ODS reference sheets.</li>
      </ul>
      <p>
        The same (processing tier, allergen tier, density tier) tuple always produces the same
        verdict, so a reader can reproduce the synthesis from the three published source columns on
        every product page.
      </p>

      <h2>Corrections and feedback</h2>
      <p>
        If you find a product with incorrect allergen, ingredient, or
        nutrition information, please contribute the fix directly to{" "}
        <a
          href="https://world.openfoodfacts.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Food Facts
        </a>{" "}
        — that&apos;s the fastest path to correcting it at the
        source, which then flows through to us on the next refresh. You
        can also <a href="/contact">contact us</a> directly and we will
        escalate.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed{" "}
        <time dateTime={METHODOLOGY_VINTAGE}>{METHODOLOGY_VINTAGE}</time>.
        Material changes to how we source or compute the data will be
        reflected here before they reach production pages.
      </p>
      <div className="not-prose">
        <AuthorBox vintage={METHODOLOGY_VINTAGE} source="IngrediPeek Methodology" />
      </div>
    </article>
  );
}
