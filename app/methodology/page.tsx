import type { Metadata } from "next";
import { TrustMetaStrip } from "@/components/TrustMetaStrip";

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
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
