import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TrustMetaStrip } from "@/components/TrustMetaStrip";
import { AuthorBox } from "@/components/AuthorBox";
import { ABOUT_VINTAGE, SITE_PUBLISHED } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "About IngrediPeek — Food Allergen & Ingredient Reference",
  description:
    "How IngrediPeek sources data from OpenFoodFacts, maps the FDA Top 9 allergens (FALCPA 2004 + FASTER Act 2021), surfaces additive tiers, and presents our ProcessingScore + AllergenSafetyMatrix reader-help levers. Editorial scope, operator transparency, and what we do not claim.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">About IngrediPeek</h1>

        <TrustMetaStrip />

        <section className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
            <p className="text-slate-700 text-lg font-medium">
              IngrediPeek is a US-focused food allergen and ingredient reference tool. We surface
              additive evidence and FDA Top 9 allergen flags drawn from OpenFoodFacts and the FDA
              Food Additive Status List, then interpret them through two reader-help levers:
              ProcessingScore and AllergenSafetyMatrix.
            </p>
          </div>

          <p className="text-slate-600 mb-4">
            People with diagnosed food allergies, celiac disease, lactose intolerance, or specific
            dietary requirements have a survival-grade interest in reading food labels carefully.
            IngrediPeek does not replace that label. We compile and decode what the FDA, USDA, EFSA,
            WHO-FAO Codex Alimentarius framework, and OpenFoodFacts contributors have already
            documented — and present it in a form that is easier to scan than the raw ingredient
            text. The on-pack label remains authoritative for any product you actually consume.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Where our data comes from</h2>
          <p className="text-slate-600 mb-3">
            Product entries (name, brand, barcode, ingredients text, NOVA group, allergen flags,
            NutriScore) are ingested from{" "}
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              Open Food Facts
            </a>
            , a community-maintained open food product database operated by the French non-profit
            association of the same name. OpenFoodFacts is one of the world&apos;s largest public
            food databases and is the canonical upstream source for our catalog.
          </p>
          <p className="text-slate-600 mb-3">
            Additive recognition is matched against categories tracked by the{" "}
            <a
              href="https://www.fda.gov/food/food-additives-petitions/food-additive-status-list"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              FDA Food Additive Status List
            </a>{" "}
            and the{" "}
            <a
              href="https://www.fda.gov/food/generally-recognized-safe-gras"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              FDA GRAS Notice Inventory
            </a>
            . Nutrient and macronutrient references draw on the{" "}
            <a
              href="https://fdc.nal.usda.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              USDA FoodData Central
            </a>{" "}
            (FDC) standard references. Cross-border allergen frame references the{" "}
            <a
              href="https://www.efsa.europa.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              European Food Safety Authority
            </a>{" "}
            (EFSA) and the joint FAO/WHO Codex Alimentarius Commission. NOVA group classification
            follows the research framework of Monteiro et al. (2019, <em>Public Health Nutrition</em>).
          </p>
          <p className="text-slate-600">
            OpenFoodFacts is community-maintained and improves over time. When the upstream catalog
            updates an ingredient list or NOVA assignment, our derived ProcessingScore tier and
            AllergenSafetyMatrix output change with it. We re-compute at each catalog refresh;{" "}
            <a href="/methodology/" className="text-green-700 hover:underline font-medium">
              the methodology page
            </a>{" "}
            documents the cadence and the decisions behind our tier cutoffs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Our two reader-help levers</h2>
          <p className="text-slate-600 mb-3">
            We surface two interpretation levers on product, brand, and allergen pages:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">ProcessingScore</h3>
              <p className="text-sm text-slate-600 mb-2">
                Five tiers — <strong>Whole / Minimal / Processed / UltraProcessed /
                OpaqueAdditive</strong> — composed from NOVA group, FDA additive tier counts, and
                ingredient-list transparency. Documented in full at{" "}
                
                .
              </p>
              <p className="text-xs text-slate-500">
                OpaqueAdditive means the ingredient list is missing or under 20 characters — a data
                gap, not a worse-than-UltraProcessed verdict. UltraProcessed describes processing
                degree, not safety; FDA tier-3 additives remain GRAS-listed.
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">AllergenSafetyMatrix</h3>
              <p className="text-sm text-slate-600 mb-2">
                Maps our 8 ingested allergen columns onto the FDA Top 9 (FALCPA 2004 + FASTER Act
                2021 sesame addition, effective January 2023). Parses voluntary PAL (&quot;may
                contain&quot;) statements from OpenFoodFacts allergen text. Tiers:{" "}
                <strong>Safe / PAL-Caution / Contains-Major / Contains-Multiple</strong>.
              </p>
              <p className="text-xs text-slate-500">
                Sesame and the EU-only allergens (celery, mustard, lupin, molluscs, sulphites under
                EU Regulation 1169/2011) are not yet tracked as separate columns. Severely allergic
                users must read the on-pack label.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Both levers are <strong>our heuristics</strong>, not FDA, EFSA, USDA, or Codex
            Alimentarius regulatory ratings. They compose publicly available evidence into a
            format that is easier to scan; they do not endorse, certify, or substitute for any
            government safety review.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">What we track in the catalog</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">8 allergen columns we ingest</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Milk / Dairy (FDA major allergen)</li>
                <li>• Eggs (FDA major allergen)</li>
                <li>• Fish (FDA major allergen)</li>
                <li>• Crustacean shellfish (FDA major allergen)</li>
                <li>• Tree nuts (FDA major allergen)</li>
                <li>• Peanuts (FDA major allergen)</li>
                <li>• Soy (FDA major allergen)</li>
                <li>• Wheat / Gluten (FDA major allergen)</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                Sesame (added by FASTER Act 2021, effective January 2023) is the 9th FDA major
                allergen and is <strong>not yet tracked as a separate column</strong> — we surface
                this gap honestly on the AllergenSafetyMatrix output rather than guess.
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Dietary categories</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Vegan</li>
                <li>• Vegetarian</li>
                <li>• Gluten-Free (FDA &lt;20 ppm rule)</li>
                <li>• Halal</li>
                <li>• Organic (USDA NOP)</li>
                <li>• Dairy-Free</li>
                <li>• Nut-Free</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                Dietary claims reflect OpenFoodFacts contributor tagging; for severe diagnosis-driven
                restrictions, verify directly with the brand. &quot;Dairy-free&quot; and
                &quot;nut-free&quot; are not federally regulated terms under FDA labeling rules.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Editorial scope and what we do not claim</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-900 font-medium mb-2">⚠ Reader-help, not medical
              advice.</p>
            <p className="text-sm text-amber-800">
              IngrediPeek is reader help for people interpreting food labels and ingredient lists.
              It does not provide medical, allergological, dietetic, or nutritional advice for
              individuals. If you have a diagnosed food allergy, celiac disease, an eating disorder,
              chronic kidney disease, diabetes, or any other condition where food choice has
              clinical consequences, the on-pack label and a qualified registered dietitian (RD) or
              your healthcare provider remain authoritative. Severely allergic users should also
              consult resources such as FARE (Food Allergy Research &amp; Education) and the AAAAI
              (American Academy of Allergy, Asthma &amp; Immunology).
            </p>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            We explicitly do not claim:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5 mb-3">
            <li>That ProcessingScore is an FDA, EFSA, USDA, or Codex Alimentarius rating.</li>
            <li>That UltraProcessed-tier products are unsafe — all additives we surface in our
              tier 1-3 columns remain GRAS-listed and lawful under FDA 21 CFR 182, 184, and the
              GRAS notification pathway.</li>
            <li>That absence of a PAL (&quot;may contain&quot;) flag guarantees absence of
              cross-contamination — PAL is voluntary under US FALCPA 2004.</li>
            <li>That our catalog covers every US food product. We retain a state-balanced keep-set
              for HCU/index-quality reasons; products outside the keep-set may exist in our raw
              data but are not surfaced publicly.</li>
            <li>That dietary claims (&quot;vegan,&quot; &quot;halal,&quot; &quot;organic&quot;)
              are independently audited — these are sourced from OpenFoodFacts contributor tagging,
              which is community-maintained.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Who runs IngrediPeek</h2>
          <p className="text-slate-600 mb-3">
            IngrediPeek is operated by a single editorial owner based in the Republic of Korea, as
            part of a network of US-focused reference tools (the DataPeek family below). The
            operator is not located in the United States; this matters for the disclosures around
            EIN, US business registration, and physical address — IngrediPeek does not have any of
            these and we do not claim to. We are publishing US-focused reference content from
            outside the United States, in compliance with the platforms (Google AdSense, Cloudflare
            DNS, and our hosting provider) that allow international operators.
          </p>
          <p className="text-slate-600 mb-3">
            Site launched <time dateTime={SITE_PUBLISHED}>{SITE_PUBLISHED}</time>. Editorial
            management (page-level review, source-authority verification, tier-cutoff decisions, and
            methodology updates) is carried out by the operator with the assistance of the editorial
            team documented on individual page surfaces (see the &quot;Reviewed by&quot; line on any
            product page). Source organizations (FDA, USDA, EFSA, WHO-FAO Codex, OpenFoodFacts) are
            credited as data creators in our schema.org Dataset markup, separate from the editorial
            review attribution.
          </p>
          <p className="text-slate-600">
            Revenue is from Google AdSense advertising and (where disclosed) affiliate links to
            related meal-delivery and nutrition services. We have no commercial relationship with
            any food brand, retailer, or certification body that would bias product-level
            interpretation. The ProcessingScore and AllergenSafetyMatrix tier cutoffs are fixed in
            code (lib/processing-score.ts, lib/allergen-safety-matrix.ts) and do not vary by
            advertiser. Disclosure of advertising is also covered on the{" "}
            <a href="/disclaimer/" className="text-green-700 hover:underline font-medium">
              Disclaimer
            </a>{" "}
            page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Important safety statement</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm font-medium mb-2">
              ⚠ Always verify allergen information on product packaging.
            </p>
            <p className="text-red-700 text-sm">
              IngrediPeek provides allergen information for reference purposes only. Product
              formulations change frequently. The voluntary PAL (&quot;may contain&quot;) statements
              parsed from the OpenFoodFacts allergen text reflect the upstream catalog at ingest
              time and may differ from the current on-pack label. Never rely solely on IngrediPeek
              for life-threatening food allergy decisions. Read the current product label, ask the
              manufacturer about shared equipment and cross-contamination controls, and consult your
              healthcare provider. For diagnosed celiac disease, the FDA &lt;20 ppm gluten-free rule
              (21 CFR 101.91) is the operative standard — third-party verification (Gluten-Free
              Certification Organization, GFCO) provides additional assurance beyond label claims.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">PSU 2차 — NutrientDensityBand atop the two existing levers</h2>
          <p className="text-slate-600 mb-3">
            With the PSU 2차 cycle (2026-05-12) the per-product page surfaces a third formal lever
            alongside ProcessingScore and AllergenSafetyMatrix: the NutrientDensityBand. The band
            classifies a product into one of six tiers (Nutrient-rich, Nutrient-dense, Acceptable,
            Nutrient-sparse, Limiting-dense, Data-incomplete) by reading the OpenFoodFacts per-100 g
            nutriment columns against FDA Daily Value reference amounts codified at 21 CFR 101.9(c)
            for a 2,000-kcal reference diet (protein 50 g/day, fiber 28 g/day, saturated fat 20
            g/day, sodium 2,300 mg/day, added sugars 50 g/day).
          </p>
          <p className="text-slate-600 mb-3">
            The cutoffs apply the FDA &quot;5/20 rule&quot; (5% DV is low, 20% DV is high for that
            nutrient) as a composite over beneficial-vs-limiting DV ratios. The band is reader help
            — it sits next to the on-pack Nutrition Facts panel (codified under FDA 21 CFR 101.9),
            which remains authoritative. Total sugars are used as a proxy where OpenFoodFacts does
            not isolate added sugars in its per-100 g row; whole-fruit and milk sugars inflate the
            reading for some products, and the caveat is surfaced on every product page.
          </p>
          <p className="text-slate-600 mb-4">
            Cross-reading the three levers produces a 4-paragraph composite interpretation
            (lib/ingredient-interpretation.ts). The same (processing tier, allergen tier, density
            tier) tuple always produces the same verdict, drawn from six dominant-signal patterns:
            whole-and-safe, whole-but-allergenic, ultra-but-empty, ultra-and-allergenic,
            mixed-tradeoff, and data-incomplete. Authority citations include FDA 21 CFR 101 (FALCPA
            2004 + FASTER Act 2021), USDA FoodData Central, EU Regulation 1169/2011, Codex
            Alimentarius STAN 1-1985, Monteiro et al. 2019 (NOVA), CDC food-allergy surveillance,
            and NIH ODS nutrient fact sheets.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Part of the DataPeek Network</h2>
          <p className="text-slate-600 mb-4">
            IngrediPeek is part of the DataPeek Insights Network — a collection of data-driven
            reference tools operated by the same editorial owner. Each site uses public-data sources
            (FDA, USDA, BLS, BEA, Census, EIA, IRS, SSA, depending on the topic) and an explicit
            methodology page disclosing the data lineage. Sister sites:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "SalaryByCity", url: "https://salarybycity.com" },
              { name: "CaloriéWize", url: "https://caloriewize.com" },
              { name: "ZIPpeek", url: "https://zippeek.com" },
              { name: "TariffPeek", url: "https://tariffpeek.com" },
              { name: "CalcPeek", url: "https://calcpeek.com" },
            ].map((site) => (
              <a
                key={site.url}
                href={site.url}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                {site.name}
              </a>
            ))}
          </div>
        </section>

        <AuthorBox vintage={ABOUT_VINTAGE} source="IngrediPeek editorial mission + FDA / USDA / EFSA / WHO-FAO Codex Alimentarius / OpenFoodFacts" />
      </div>
    </>
  );
}
