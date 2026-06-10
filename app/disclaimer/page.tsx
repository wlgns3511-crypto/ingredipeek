import type { Metadata } from "next";
import { DISCLAIMER_REVIEWED } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Disclaimer — IngrediPeek",
  description:
    "Limitations of liability, data lineage from OpenFoodFacts + FDA + USDA + EFSA + WHO-FAO Codex Alimentarius, allergen-specific safety statement (FALCPA 2004 + FASTER Act 2021), and what IngrediPeek does not claim.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed: <time dateTime={DISCLAIMER_REVIEWED}>{DISCLAIMER_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">General information</h2>
      <p>
        The information provided on IngrediPeek is for general informational and educational
        purposes only. We compile and decode publicly available data from OpenFoodFacts (the
        upstream community-maintained product catalog), the FDA Food Additive Status List, the FDA
        GRAS Notice Inventory, USDA FoodData Central, the European Food Safety Authority (EFSA),
        and the joint FAO/WHO Codex Alimentarius framework. While we make reasonable efforts to
        keep the information accurate, complete, and current, we make no representations or
        warranties of any kind, express or implied, about the completeness, accuracy, reliability,
        or suitability of the information for any specific purpose.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Not professional advice</h2>
      <p>
        The content on IngrediPeek does not constitute medical, allergological, dietetic, or
        nutritional advice. The site is reader help for interpreting food labels — not a substitute
        for the on-pack label or for guidance from a qualified clinician. If you have a diagnosed
        food allergy, celiac disease, lactose intolerance, an eating disorder, chronic kidney
        disease, diabetes, gestational diabetes, phenylketonuria (PKU), hereditary fructose
        intolerance, or any other condition where food choice has clinical consequences, consult a
        registered dietitian (RD) and your healthcare provider before relying on any information
        presented here. Any reliance you place on the information is strictly at your own risk.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Allergen-specific safety statement (YMYL)</h2>
      <p>
        Food allergen information on IngrediPeek is sourced from the OpenFoodFacts catalog and
        mapped onto the FDA Top 9 major allergens declared under the Food Allergen Labeling and
        Consumer Protection Act of 2004 (FALCPA, Public Law 108-282), as amended by the Food
        Allergy Safety, Treatment, Education, and Research Act of 2021 (FASTER Act, Public Law
        117-11) which added sesame as the 9th major allergen effective January 1, 2023. Important
        limitations:
      </p>
      <ul>
        <li>
          <strong>Sesame is not yet tracked as a separate column in our catalog.</strong> The FDA
          Top 9 includes sesame; our 8 allergen columns (milk, eggs, fish, crustacean shellfish,
          tree nuts, peanuts, soy, wheat/gluten) do not. We surface this gap honestly on the
          AllergenSafetyMatrix output rather than imply sesame coverage.
        </li>
        <li>
          <strong>EU-only allergens are not tracked.</strong> EU Regulation 1169/2011 requires
          declaration of 14 allergens — the FDA Top 9 plus celery, mustard, lupin, molluscs, and
          sulphites/sulfur dioxide. We do not have separate columns for those five. EU readers
          should consult the on-pack EU 1169/2011 label directly.
        </li>
        <li>
          <strong>PAL (&quot;may contain&quot;) statements are voluntary.</strong> Precautionary
          Allergen Labelling is voluntary under US FALCPA 2004. We parse PAL phrases from the
          OpenFoodFacts allergen text when present, but absence of a PAL flag in our system does
          NOT guarantee absence of cross-contamination in shared facilities or on shared equipment.
        </li>
        <li>
          <strong>Formulations change.</strong> Manufacturers can change ingredients without
          notice. The OpenFoodFacts entry we ingest is a snapshot; the current on-pack label is
          authoritative for any product you actually consume.
        </li>
        <li>
          <strong>Never use IngrediPeek for life-threatening allergy decisions in isolation.</strong>{" "}
          For severe allergies, anaphylaxis history, or other diagnosed conditions, follow the
          guidance of FARE (Food Allergy Research &amp; Education), the AAAAI (American Academy of
          Allergy, Asthma &amp; Immunology), and your allergist. Carry epinephrine if prescribed.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data accuracy and provenance</h2>
      <p>
        The product catalog is ingested from{" "}
        <a href="https://world.openfoodfacts.org" rel="noopener noreferrer">Open Food Facts</a>,
        a community-maintained open database operated by the French non-profit association of the
        same name. OpenFoodFacts data is contributed by volunteers and verified by the community;
        it is not subject to the kind of formal audit applied to FDA-mandated nutrition facts. While
        OpenFoodFacts is widely regarded as one of the world&apos;s best public food databases, it
        contains errors, gaps, and out-of-date entries that propagate into our derived outputs.
      </p>
      <p>
        Additive recognition matches the ingredient text against substances tracked by the FDA Food
        Additive Status List and the FDA GRAS Notice Inventory. NOVA classification follows
        Monteiro et al. (2019, <em>Public Health Nutrition</em>), a research consensus framework —
        not an FDA, EFSA, USDA, or Codex Alimentarius regulatory rating. Where the upstream NOVA
        value is unrated or assigned a placeholder, we mark the score as reduced confidence rather
        than guess. Nutrient reference values where shown derive from USDA FoodData Central
        standard reference data.
      </p>
      <p>
        Users with diagnosed conditions, severe allergies, or any safety-critical use case should
        independently verify the on-pack ingredient list, contact the manufacturer to ask about
        shared equipment and cross-contamination controls, and consult their healthcare provider
        before making consumption decisions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">ProcessingScore is our heuristic — not an FDA rating</h2>
      <p>
        Our ProcessingScore (Whole / Minimal / Processed / UltraProcessed / OpaqueAdditive) is a
        reader-help composite of NOVA group and FDA-tracked additive tier counts. It is{" "}
        <strong>not</strong> an FDA, EFSA, USDA, WHO-FAO Codex Alimentarius, or any other
        government regulatory rating. The cutoffs are documented at{" "}
         and on our{" "}
        <a href="/methodology/">/methodology/</a> page. UltraProcessed describes processing degree,
        not safety — every additive in our tier 1-3 columns remains GRAS-listed and lawful in food
        sold in the United States under FDA 21 CFR 182, 184, and the GRAS notification pathway.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Six dominant-signal patterns are reader help, not buy-or-avoid</h2>
      <p>
        The product page surfaces one of six dominant-signal patterns derived from the cross-reading
        of ProcessingScore × AllergenSafetyMatrix × NutrientDensityBand: <em>whole-and-safe</em>,
        <em>whole-but-allergenic</em>, <em>ultra-but-empty</em>, <em>ultra-and-allergenic</em>,
        <em>mixed-tradeoff</em>, or <em>data-incomplete</em>. The pattern label is a reader-help
        summary — it does not constitute medical advice and does not replace the on-pack FDA-mandated
        Nutrition Facts panel under 21 CFR 101.9, the FDA-mandated &quot;Contains&quot; allergen
        statement under FALCPA 2004 (21 CFR 101.91), or qualified clinician guidance via the AAAAI,
        FARE, or a registered dietitian. A reader who sees an &quot;ultra-and-allergenic&quot; verdict
        on a product they have been consuming should not stop consumption abruptly without first
        consulting an allergist or RD; the verdict is a transparency surface, not a clinical directive.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">External links</h2>
      <p>
        This website may contain links to external websites — including FDA.gov, USDA.gov, the
        EFSA portal, the OpenFoodFacts product database, and others — that are not under our
        control. We have no responsibility for the content, privacy policies, or practices of any
        third-party websites. Linking does not imply endorsement.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Advertising disclosure</h2>
      <p>
        IngrediPeek displays third-party advertisements through Google AdSense and other ad
        networks, and may include affiliate links to related services (meal delivery, nutrition
        coaching). Advertisements are provided by third parties and do not imply endorsement by
        IngrediPeek of any specific product or service. We are not responsible for the content or
        accuracy of any advertisements displayed on this website. Advertising does not influence
        ProcessingScore or AllergenSafetyMatrix tier outputs — the cutoffs are fixed in source code
        (lib/processing-score.ts, lib/allergen-safety-matrix.ts) and do not vary by advertiser. We
        have no commercial relationship with any food brand, retailer, or certification body that
        would bias product-level interpretation.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Operator location and jurisdiction</h2>
      <p>
        IngrediPeek is operated from outside the United States by a single editorial owner based in
        the Republic of Korea. The operator does not maintain a US business registration, US
        Employer Identification Number (EIN), or US physical address. References to US regulatory
        frameworks (FDA, USDA, FTC, FALCPA, FASTER Act) reflect the editorial focus of the
        content, not a claim that the operator is a US-registered entity. US users who require a
        US-domiciled, US-registered source for safety-critical allergen guidance should consult
        FDA.gov, the American Academy of Allergy, Asthma &amp; Immunology (AAAAI), or FARE
        directly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of liability</h2>
      <p>
        In no event shall IngrediPeek, its operator, contributors, or affiliates be liable for any
        direct, indirect, incidental, consequential, or punitive damages — including but not
        limited to bodily injury, allergic reaction, medical expense, lost wages, or property damage
        — arising from the use of this website or the information contained herein. Users assume
        all risk associated with food consumption decisions and acknowledge that the on-pack label
        and qualified clinical guidance remain authoritative.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Reporting errors</h2>
      <p>
        We document our error-handling and correction process on the{" "}
        <a href="/corrections-policy/" className="text-green-700 hover:underline">corrections-policy</a>{" "}
        page. If you spot a factual error in a tier label, additive classification, allergen flag,
        or source attribution, please contact us via the{" "}
        <a href="/contact/" className="text-green-700 hover:underline">Contact page</a>. For
        OpenFoodFacts-level data corrections (an incorrect ingredient list or NOVA assignment for a
        specific product), the most effective fix is at the upstream source — file an edit directly
        at world.openfoodfacts.org, and our next ingest cycle will pick up the correction.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">NutrientDensityBand is a heuristic over FDA Daily Value</h2>
      <p>
        Our NutrientDensityBand lever (Nutrient-rich / Nutrient-dense / Acceptable / Nutrient-sparse /
        Limiting-dense / Data-incomplete) is a composite reader-help summary derived from the per-100 g
        nutriment panel against FDA Daily Value reference amounts codified at 21 CFR 101.9(c) for a
        2,000-kcal reference diet (protein 50 g/day, fiber 28 g/day, saturated fat 20 g/day, sodium
        2,300 mg/day, added sugars 50 g/day). Cutoffs draw on the FDA &quot;5/20 rule&quot; (5% DV is
        low, 20% DV is high) applied as a composite over beneficial-vs-limiting DV ratios. It is{" "}
        <strong>not</strong> an FDA, USDA FoodData Central, EFSA, WHO-FAO Codex Alimentarius, NIH ODS,
        CDC, or other regulatory rating. The on-pack Nutrition Facts panel codified under FDA
        21 CFR 101.9 is authoritative. Total sugars are used as a proxy where OpenFoodFacts does not
        isolate added sugars in its per-100 g row; whole-fruit and milk sugars inflate the band
        reading for some products and the caveat is surfaced explicitly on the page. The FDA 2020-2025
        Dietary Guidelines headline directions (&quot;limit saturated fat, sodium, added sugars&quot; /
        &quot;shift toward nutrient-dense foods&quot;) anchor the directional language we use on every
        page; the band itself derives strictly from the FDA Daily Value reference numbers.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Daily Value reference and the 2,000 kcal anchor</h2>
      <p>
        The FDA Daily Value (DV) reference amounts at 21 CFR 101.9(c) are computed for a generic
        2,000-kcal reference diet. Individuals with substantially different calorie needs (athletes,
        children, pregnant or lactating women, older adults, individuals with chronic kidney disease,
        diabetes or gestational diabetes, or other conditions requiring an individualized dietary
        prescription) should not apply DV-based reader help mechanically. A registered dietitian (RD)
        working from the FDA / USDA Dietary Reference Intakes (DRI) and the most recent FDA / USDA
        2020-2025 Dietary Guidelines for Americans can translate the per-100 g panel into an
        individualized recommendation. The IngrediPeek band is a starting point for label literacy,
        not an individualized prescription.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Composite four-paragraph interpretation</h2>
      <p>
        The per-product page also surfaces a 4-paragraph composite interpretation that cross-reads
        the three formal levers (ProcessingScore × AllergenSafetyMatrix × NutrientDensityBand). The
        same (processing tier, allergen tier, density tier) tuple always produces the same verdict; the
        synthesis is reproducible from the three published source columns. The composite is reader help
        — not a buy-or-avoid recommendation. For households managing FDA FALCPA-listed allergies,
        clinician guidance (registered dietitian, pediatric allergist via AAAAI or FARE referral)
        remains authoritative; for households watching saturated fat, sodium, and added sugars per the
        FDA 2020-2025 Dietary Guidelines, the on-pack Nutrition Facts panel against the FDA % DV column
        is authoritative.
      </p>

      <AuthorBox vintage={DISCLAIMER_REVIEWED} source="IngrediPeek legal disclaimer — FDA / FALCPA / FASTER Act / USDA FoodData Central / EFSA / WHO-FAO Codex Alimentarius / FDA 21 CFR 101.9(c)" />
    </article>
  );
}
