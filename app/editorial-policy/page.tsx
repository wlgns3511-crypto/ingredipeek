import type { Metadata } from "next";
import { EDITORIAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Editorial Policy — IngrediPeek",
  description:
    "How IngrediPeek selects sources, decides ProcessingScore and AllergenSafetyMatrix tier cutoffs, separates ingest from interpretation, handles upstream OpenFoodFacts updates, and discloses conflicts of interest.",
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { url: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={EDITORIAL_REVIEWED}>{EDITORIAL_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial scope</h2>
      <p>
        IngrediPeek publishes US-focused reference content on food allergens, additives, NOVA
        classification, and dietary categories. The catalog is ingested from OpenFoodFacts and
        cross-referenced against the FDA Food Additive Status List, the FDA GRAS Notice Inventory,
        USDA FoodData Central, the European Food Safety Authority (EFSA), and the joint FAO/WHO
        Codex Alimentarius framework. We do not commission original laboratory testing; we compile
        and interpret what these authoritative sources have already documented.
      </p>
      <p>
        Editorial control of every page surface (product, brand, allergen, guide, methodology,
        about, disclaimer, legal) rests with the IngrediPeek editorial team, parent organization
        DataPeek Research Network. No advertiser, food brand, retailer, or certification body has
        influence over tier cutoffs, lever outputs, or source-authority attribution.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Source selection criteria</h2>
      <p>
        Sources used in IngrediPeek must meet at least two of the following criteria:
      </p>
      <ul>
        <li>
          <strong>Government regulatory standing.</strong> The source is published or recognized by
          a US federal agency (FDA, USDA, FTC) or an equivalent international body (EFSA, the joint
          FAO/WHO Codex Alimentarius Commission, the WHO).
        </li>
        <li>
          <strong>Peer-reviewed scientific consensus.</strong> The source is a peer-reviewed journal
          article, systematic review, or position statement from a recognized professional
          association (American Academy of Allergy, Asthma &amp; Immunology — AAAAI; American
          Medical Association — AMA; American Heart Association — AHA; Food Allergy Research and
          Education — FARE).
        </li>
        <li>
          <strong>Public, auditable methodology.</strong> The source publishes its methodology
          openly, allowing readers and us to verify how the data was collected and processed. The
          OpenFoodFacts product catalog meets this bar because all contributions are publicly
          logged and revertable.
        </li>
        <li>
          <strong>Currently maintained.</strong> Sources that have not been updated in the past
          three years are flagged on the methodology page rather than relied upon. The FDA Food
          Additive Status List, the FDA GRAS Notice Inventory, and USDA FoodData Central are
          actively maintained and reflect the current US regulatory landscape.
        </li>
      </ul>
      <p>
        The five regulatory bodies we cite as source authorities are:
      </p>
      <ul>
        {SOURCE_AUTHORITIES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          </li>
        ))}
      </ul>
      <p>
        Where a single product or ingredient warrants reference to a sixth or seventh source (a
        FARE position statement on cross-contamination, an AAAAI clinical practice parameter, a
        specific peer-reviewed study on a contested additive), we cite it inline on the page where
        it applies — separate from the standing source-authority list above.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Separation of ingest and interpretation</h2>
      <p>
        IngrediPeek maintains a deliberate separation between two layers:
      </p>
      <ol>
        <li>
          <strong>Ingest layer (verbatim).</strong> The 8 allergen columns, NOVA group, ingredient
          text, NutriScore, and dietary tags come directly from OpenFoodFacts. We do not edit,
          override, or supplement these values. When OpenFoodFacts updates a product entry, our
          next ingest cycle reflects the change.
        </li>
        <li>
          <strong>Interpretation layer (our heuristic).</strong> ProcessingScore (lib/processing-score.ts)
          and AllergenSafetyMatrix (lib/allergen-safety-matrix.ts) compose the ingested evidence
          into reader-help tiers. The cutoffs are fixed in source code and documented at{" "}
           and on the{" "}
          <a href="/methodology/">/methodology/</a> page. Both modules are open to inspection by
          any reader who wants to see exactly how a tier was assigned.
        </li>
      </ol>
      <p>
        This separation matters because the ingest layer represents authoritative upstream data,
        while the interpretation layer represents our editorial judgment about how to surface that
        data. Confusing the two would falsely imply that the FDA, USDA, EFSA, WHO-FAO Codex, or
        OpenFoodFacts have endorsed our tier labels. They have not. The tiers are ours; the
        underlying flags and NOVA assignments are theirs.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Tier-cutoff decisions</h2>
      <p>
        ProcessingScore cutoffs (Whole at NOVA 1 + 0 additives, Minimal at NOVA 1-2 + ≤2 additives,
        UltraProcessed at NOVA 4 or 5+ additives or 3+ tier-3 additives) reflect editorial
        judgment about what differentiates the tiers meaningfully for a reader scanning a label.
        These cutoffs are <strong>not</strong> derived from any FDA, EFSA, USDA, or Codex
        Alimentarius regulatory definition — there is no government processing-degree tier system
        we are matching. The closest analogue is NOVA itself (Monteiro et al. 2019), but NOVA is a
        four-group system; we extend it to five tiers to honestly surface the data-missing case
        (OpaqueAdditive).
      </p>
      <p>
        AllergenSafetyMatrix cutoffs (Contains-Multiple at ≥3 FDA Top 9 contained, Contains-Major
        at ≥1, PAL-Caution if only PAL flags present, otherwise Safe) follow the same editorial
        logic: surface the count of declared FDA Top 9 allergens and the presence of voluntary PAL
        statements, but do not assign a tier the FDA itself has not defined. The FDA does not
        publish an allergen-risk-tier scale; the matrix is our reader-help layer atop FDA-mandated
        labeling.
      </p>
      <p>
        We change tier cutoffs only when (1) the upstream source authority changes its framework
        (for example, the FASTER Act 2021 adding sesame as the 9th FDA major allergen), (2) a
        peer-reviewed publication updates NOVA group definitions or additive classification, or
        (3) we identify a reader-help failure case that warrants a small editorial adjustment. All
        cutoff changes are documented on the methodology page with a vintage date and a rationale.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Handling upstream updates</h2>
      <p>
        Because IngrediPeek depends on OpenFoodFacts as the upstream catalog, we follow these rules
        for upstream-driven changes:
      </p>
      <ul>
        <li>
          <strong>Routine ingredient or NOVA changes.</strong> Picked up automatically on the next
          ingest cycle. The product page displays the current OpenFoodFacts vintage on its
          authorship strip; readers can see when the underlying data was last refreshed.
        </li>
        <li>
          <strong>Major OpenFoodFacts schema changes</strong> (a new allergen column, a revised
          NOVA scoring rule). Reviewed by the editorial team within seven days and reflected in the
          interpretation layer with a corresponding methodology update.
        </li>
        <li>
          <strong>Upstream errors flagged by readers.</strong> Forwarded back to OpenFoodFacts via
          the upstream edit interface when we cannot verify the contributor&apos;s claim
          independently. We do not maintain a fork of the OpenFoodFacts data — the source remains
          the source.
        </li>
        <li>
          <strong>Regulatory framework changes.</strong> When FDA, USDA, EFSA, or the joint
          FAO/WHO Codex Alimentarius framework publishes a substantive update (a new GRAS
          determination, a banned additive, a revised allergen list), the methodology page is
          updated and the interpretation layer adjusted within thirty days.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial review process</h2>
      <p>
        Each new page surface (product template change, brand template change, allergen template
        change, new guide entry, new lever) passes through three checkpoints before being
        deployed:
      </p>
      <ol>
        <li>
          <strong>Source-authority verification.</strong> Every claim that names FDA, USDA, EFSA,
          WHO-FAO Codex, FALCPA, FASTER Act, GRAS, NOVA, or any specific regulation is checked
          against the cited primary source. Where the source has been superseded (an older FDA
          guidance withdrawn, a Codex Alimentarius standard updated), the page is corrected before
          deploy.
        </li>
        <li>
          <strong>Audit suite.</strong> A standing 7-check audit verifies trigger-phrase compliance,
          orphan schema absence, authorship layer integrity, sitemap consistency, and source
          mention counts on legal pages. Pages cannot ship while any audit check is red.
        </li>
        <li>
          <strong>Production verification.</strong> After deploy, cold-probe URLs verify that each
          new page is returning HTTP 200 with the expected lever markers and source attribution. If
          any probe fails, the deploy rolls back to the previous build.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-8 mb-3">Conflict of interest disclosure</h2>
      <p>
        Revenue is from Google AdSense advertising and (where disclosed) affiliate links to
        related meal-delivery and nutrition services. We have no commercial relationship with any
        food brand, retailer, or certification body whose products appear in our catalog. The
        ProcessingScore and AllergenSafetyMatrix tier cutoffs are fixed in source code
        (lib/processing-score.ts, lib/allergen-safety-matrix.ts) and do not vary by advertiser.
      </p>
      <p>
        Specific disclosures:
      </p>
      <ul>
        <li>
          We do not accept payment to elevate a product&apos;s tier or to suppress an allergen
          flag.
        </li>
        <li>
          We do not accept payment from brands to be included in the catalog. Inclusion is
          determined by the OpenFoodFacts upstream catalog and our state-balanced keep-set logic.
        </li>
        <li>
          We do not receive commissions on food products themselves. Affiliate disclosures (where
          present) apply to adjacent services like meal-delivery subscriptions; the existence of an
          affiliate link does not influence the editorial treatment of any food product in our
          catalog.
        </li>
        <li>
          We do not have a financial relationship with OpenFoodFacts, the FDA, the USDA, EFSA, the
          WHO, or the FAO. We are an independent operator that cites their published work.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Author identification and accountability</h2>
      <p>
        IngrediPeek is operated by a single editorial owner with centralized editorial review. Every
        page surfaces an AuthorBox that attributes review to the IngrediPeek Editorial Team with the
        parent organization DataPeek Research Network, and credits the relevant source authorities
        (FDA, USDA, EFSA, WHO-FAO Codex, OpenFoodFacts) as the data creators. This structure is
        documented in our schema.org markup on every page (Dataset.creator = source organization;
        reviewedBy = editorial team). The single-owner editorial structure is disclosed transparently
        rather than masked by manufactured byline diversity — readers know exactly which voice
        synthesizes the source authorities into our tier outputs.
      </p>
      <p>
        Readers who want to contact the editorial team for any reason — to report an error, to
        request a correction, to ask about methodology, or to inquire about a specific tier
        assignment — should use the{" "}
        <a href="/contact/" className="text-green-700 hover:underline">Contact</a> page. The{" "}
        <a href="/corrections-policy/" className="text-green-700 hover:underline">
          Corrections Policy
        </a>{" "}
        documents how we handle reported errors.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limits of editorial coverage</h2>
      <p>
        We do not cover:
      </p>
      <ul>
        <li>
          Restaurant menu items (FALCPA does not require restaurants to label allergens; we do not
          have a reliable upstream catalog).
        </li>
        <li>
          Pet food, supplements, or non-food consumables (different regulatory frameworks under
          FDA Center for Veterinary Medicine and FDA dietary supplement rules).
        </li>
        <li>
          Alcoholic beverages (regulated by the Alcohol and Tobacco Tax and Trade Bureau — TTB —
          with limited allergen disclosure compared to FDA-regulated foods).
        </li>
        <li>
          Custom or compounded foods (e.g., medical foods under FDA 21 CFR 101.9(j)(8)) that
          require clinical supervision.
        </li>
      </ul>
      <p>
        For these out-of-scope domains, readers should consult the relevant regulatory body
        directly: FDA Center for Veterinary Medicine for pet food, FDA dietary supplement labeling
        rules for supplements, TTB for alcohol, and a clinician for medical foods.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">NutrientDensityBand editorial standard (PSU 2차)</h2>
      <p>
        With the PSU 2차 cycle (2026-05-12) we added the NutrientDensityBand as a third formal
        lever atop ProcessingScore and AllergenSafetyMatrix. The editorial standard for the band:
      </p>
      <ul>
        <li>
          <strong>Reference framework:</strong> FDA Daily Value reference amounts codified at
          21 CFR 101.9(c) for a 2,000-kcal reference diet (protein 50 g/day, fiber 28 g/day,
          saturated fat 20 g/day, sodium 2,300 mg/day, added sugars 50 g/day). These are the same
          numbers an FDA-mandated Nutrition Facts panel uses to compute the % Daily Value column.
        </li>
        <li>
          <strong>Tier cutoff source:</strong> the FDA &quot;5/20 rule&quot; (5% DV is low,
          20% DV is high for that nutrient), applied as a composite over beneficial-vs-limiting DV
          ratios. The cutoffs are stated explicitly at 
          and on the <a href="/methodology/">/methodology/</a> page so a reader can audit every
          tier assignment back to the published reference.
        </li>
        <li>
          <strong>Total sugars vs added sugars:</strong> OpenFoodFacts does not isolate added sugar
          in the per-100 g row, so the band reads against total sugars with the caveat surfaced on
          the page. Whole-fruit and milk sugars inflate the reading for some products; that
          limitation is documented inline rather than back-filled with a category-average estimate.
        </li>
        <li>
          <strong>DataIncomplete tier:</strong> when the OpenFoodFacts row populates fewer than
          two beneficial AND fewer than two limiting nutriments, the product surfaces as
          DataIncomplete. The FDA-mandated on-pack Nutrition Facts panel remains authoritative.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Composite four-paragraph interpretation</h2>
      <p>
        The product page surfaces a 4-paragraph composite interpretation (lib/ingredient-interpretation.ts)
        that cross-reads the three formal levers (ProcessingScore × AllergenSafetyMatrix ×
        NutrientDensityBand). The same (processing tier, allergen tier, density tier) tuple always
        produces the same verdict; the synthesis is reproducible from the three published source
        columns. Six dominant-signal patterns are surfaced explicitly:
      </p>
      <ul>
        <li>
          <strong>whole-and-safe</strong>: Whole/Minimal × Safe × Rich/Dense.
        </li>
        <li>
          <strong>whole-but-allergenic</strong>: Whole/Minimal × Contains-Major or worse.
        </li>
        <li>
          <strong>ultra-but-empty</strong>: UltraProcessed × NutrientSparse / LimitingDense.
        </li>
        <li>
          <strong>ultra-and-allergenic</strong>: UltraProcessed × Contains-Multiple.
        </li>
        <li>
          <strong>mixed-tradeoff</strong>: Processed × Acceptable middle bands across all three.
        </li>
        <li>
          <strong>data-incomplete</strong>: any lever returns DataIncomplete / OpaqueAdditive.
        </li>
      </ul>
      <p>
        The composite is reader help — not a buy-or-avoid recommendation. For households managing
        FDA FALCPA-listed allergies, clinician guidance (registered dietitian, pediatric allergist
        via AAAAI or FARE referral) remains authoritative; for households watching saturated fat,
        sodium, and added sugars per the FDA 2020-2025 Dietary Guidelines, the on-pack Nutrition
        Facts panel against the FDA % DV column is authoritative.
      </p>

      <AuthorBox vintage={EDITORIAL_REVIEWED} source={`IngrediPeek editorial policy — ${SOURCE_AUTHORITIES.map((s) => s.name).join(' / ')}`} />
    </article>
  );
}
