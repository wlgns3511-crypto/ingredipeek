import type { Metadata } from "next";
import { CORRECTIONS_REVIEWED } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Corrections Policy — IngrediPeek",
  description:
    "How IngrediPeek triages, fixes, and discloses errors — data errors at the OpenFoodFacts upstream, interpretation errors in our ProcessingScore / AllergenSafetyMatrix levers, and editorial errors in legal or methodology pages. Reporting channel, response time targets, and FDA / FALCPA reference points.",
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { url: "/corrections-policy/" },
};

export default function CorrectionsPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={CORRECTIONS_REVIEWED}>{CORRECTIONS_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Why we publish a corrections policy</h2>
      <p>
        IngrediPeek covers food allergens, additive evidence, and processing tiers — domains where
        an error can lead a reader with celiac disease, a severe nut allergy, or another diagnosed
        condition toward a product that does not match their safety needs. Errors at IngrediPeek
        are not abstractly bad; they have potential clinical consequences. We treat correction
        intake, triage, and remediation as a core editorial function and document it publicly so
        readers can verify how we handle reported errors.
      </p>
      <p>
        This policy applies to errors at IngrediPeek itself. Errors in the underlying source
        authorities (FDA, USDA, EFSA, WHO-FAO Codex Alimentarius, OpenFoodFacts) are governed by
        the correction processes of those organizations; we forward upstream-level errors to the
        appropriate source rather than maintaining a fork.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Three error categories we recognize</h2>
      <p>
        We triage every reported error into one of three buckets:
      </p>
      <ol>
        <li>
          <strong>Data error at the OpenFoodFacts upstream.</strong> Example: a specific product
          entry says &quot;contains milk&quot; but the on-pack label says no milk; an ingredient
          list is missing or wrong; a NOVA group is incorrectly assigned. Because we ingest
          OpenFoodFacts verbatim and do not maintain a fork, the most effective fix is at the
          upstream source. We forward these reports to the appropriate OpenFoodFacts edit interface
          and refresh on our next ingest cycle.
        </li>
        <li>
          <strong>Interpretation error in our lever output.</strong> Example: ProcessingScore
          incorrectly tiers a product because the cutoff logic misreads the additive count;
          AllergenSafetyMatrix fails to flag a PAL statement because the regex pattern is too
          narrow; a brand-level summary aggregates incorrectly. These are bugs in our code
          (lib/processing-score.ts, lib/allergen-safety-matrix.ts) and we fix them in source.
        </li>
        <li>
          <strong>Editorial error in static content.</strong> Example: a methodology page misstates
          when the FASTER Act 2021 went into effect; a guide entry confuses FALCPA with the FASTER
          Act; an authority citation links to a withdrawn FDA guidance. These are fixed by editing
          the static content and re-deploying.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-8 mb-3">How we triage</h2>
      <p>
        On receiving a reported error, we apply the following triage:
      </p>
      <ul>
        <li>
          <strong>Severity assessment.</strong> A high-severity error is one that could direct a
          reader with a diagnosed allergy or condition toward an unsafe product — for example, a
          product incorrectly flagged as &quot;safe&quot; on the AllergenSafetyMatrix when the
          underlying ingredient text declares a Top 9 allergen. High-severity errors take priority
          over other editorial work and are addressed within five business days.
        </li>
        <li>
          <strong>Reproducibility check.</strong> We verify the reported error by reading the
          relevant source: the on-pack label for a product (where possible), the OpenFoodFacts
          entry for an ingredient-level claim, the FDA / FALCPA / FASTER Act text for a regulatory
          claim, the Monteiro et al. (2019) paper for a NOVA-related claim. We do not fix
          unreproducible reports without first confirming the underlying issue.
        </li>
        <li>
          <strong>Root-cause classification.</strong> We classify the error into one of the three
          buckets above (upstream data, interpretation, editorial). The fix path differs by
          bucket; correctly classifying upfront avoids fixing the wrong layer.
        </li>
        <li>
          <strong>Disclosure decision.</strong> For corrections that materially change a tier
          label, an allergen flag, or a citation, we note the change inline on the affected page
          and update the vintage date. Minor typographical fixes do not warrant a separate
          disclosure; substantive factual corrections always do.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Response time targets</h2>
      <p>
        We commit to the following response timelines from receipt of a clear, reproducible error
        report:
      </p>
      <ul>
        <li>
          <strong>High-severity allergen or safety errors:</strong> initial response within two
          business days, fix or upstream forward within five business days. This covers cases like
          a missing FDA Top 9 declaration that could lead an allergic reader to consume an unsafe
          product.
        </li>
        <li>
          <strong>Interpretation-layer bugs (ProcessingScore, AllergenSafetyMatrix):</strong> fix
          deployed within fourteen days. The fix typically requires a code change, audit re-run,
          and production verification.
        </li>
        <li>
          <strong>Editorial errors in static content (methodology, guide, about, disclaimer,
          legal):</strong> fix deployed within seven days, faster if the error involves a
          regulatory framework citation (FDA, FALCPA, FASTER Act, GRAS, NOVA, USDA, EFSA, Codex
          Alimentarius).
        </li>
        <li>
          <strong>Upstream OpenFoodFacts data errors:</strong> forwarded to the OpenFoodFacts edit
          interface within seven days of report. The actual correction timing depends on the
          OpenFoodFacts community review process and is outside our direct control. The next
          IngrediPeek ingest cycle picks up the corrected upstream data automatically.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">How to report an error</h2>
      <p>
        The fastest way to reach us is via the{" "}
        <a href="/contact/" className="text-green-700 hover:underline">Contact page</a>. When
        reporting, please include:
      </p>
      <ul>
        <li>The URL of the affected page (e.g., /product/something/, /allergen/gluten-free/).</li>
        <li>The specific claim or output you believe is wrong, with a quote or screenshot.</li>
        <li>
          The basis for the correction — a link to an FDA / USDA / EFSA / FAO-WHO Codex / FARE /
          AAAAI document, a peer-reviewed reference, or the relevant on-pack label image where
          possible.
        </li>
        <li>
          Whether the error is at the OpenFoodFacts upstream (we forward), in our interpretation
          (we fix in code), or in editorial content (we edit and re-deploy).
        </li>
      </ul>
      <p>
        For OpenFoodFacts-level data corrections, the most effective fix is filed directly at{" "}
        <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">
          world.openfoodfacts.org
        </a>{" "}
        — the OpenFoodFacts edit interface is open to any account holder, contributions are
        publicly logged, and our next ingest cycle picks up upstream changes automatically. If you
        report an upstream-level issue to us, we forward it to the appropriate OpenFoodFacts
        contributor channel.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we do not correct on request</h2>
      <p>
        Some reported &quot;errors&quot; are not factual errors and we do not change them on
        request:
      </p>
      <ul>
        <li>
          <strong>Tier-cutoff disagreements.</strong> If a brand or manufacturer disagrees with our
          ProcessingScore cutoff (e.g., believes their UltraProcessed product should be tiered
          Processed), we will not move individual products outside the published cutoff logic. The
          cutoffs are documented at {" "}
          and on the <a href="/methodology/">/methodology/</a> page; tier reassignments would
          undermine the consistency of the lever. We will consider revising the cutoff logic
          itself if a peer-reviewed publication or regulatory change supports a different threshold.
        </li>
        <li>
          <strong>NOVA group disagreements.</strong> NOVA group is ingested verbatim from
          OpenFoodFacts. We do not override NOVA assignments. If a brand believes the NOVA group
          for a product is wrong, the fix is filed at OpenFoodFacts upstream.
        </li>
        <li>
          <strong>Voluntary PAL coverage requests.</strong> We parse PAL (&quot;may contain&quot;)
          statements from the OpenFoodFacts allergen text when present. We do not add PAL flags
          that the OpenFoodFacts entry does not already contain — doing so would manufacture
          allergen warnings the upstream source has not documented.
        </li>
        <li>
          <strong>Removal of a product entry.</strong> We do not remove products from the catalog
          on brand request. The catalog reflects what OpenFoodFacts contributors have documented;
          removal requests should be addressed to OpenFoodFacts directly.
        </li>
        <li>
          <strong>Endorsement or de-endorsement of a regulatory framework.</strong> We will not
          remove or soften citations of FDA, USDA, EFSA, WHO-FAO Codex Alimentarius, FALCPA, or
          FASTER Act because a particular reader or brand disagrees with the underlying regulation.
          Our role is to compile and decode the regulatory framework as it stands; advocacy for or
          against any specific regulation is outside our editorial scope.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">When we issue a public correction</h2>
      <p>
        We publish a visible correction note on the affected page (with a vintage date update)
        when:
      </p>
      <ul>
        <li>
          A tier label changes for one or more products as a result of the correction (for
          example, a fix to the ProcessingScore cutoff logic that moves a class of products
          between tiers).
        </li>
        <li>
          A regulatory citation is updated to reflect a current FDA, USDA, EFSA, WHO-FAO Codex
          Alimentarius, FALCPA, or FASTER Act version.
        </li>
        <li>
          An allergen flag changes for a specific product as a result of an upstream OpenFoodFacts
          correction.
        </li>
        <li>
          A methodology page section is revised to reflect a change in source authorities or
          tier-cutoff logic.
        </li>
      </ul>
      <p>
        Minor typographical and styling fixes do not warrant a separate disclosure. Substantive
        factual corrections, regulatory citation updates, and tier reassignments always do. The
        editorial team retains discretion about the form of the disclosure (inline note vs.
        separate changelog) based on how prominent and persistent the affected claim was.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Severe-error escalation</h2>
      <p>
        If you believe IngrediPeek has presented information that could lead to a severe allergic
        reaction, anaphylaxis, or other acute clinical harm, please escalate via the{" "}
        <a href="/contact/" className="text-green-700 hover:underline">Contact page</a> with the
        subject line beginning &quot;SAFETY:&quot;. We monitor this channel daily and aim to
        respond within one business day. For any current clinical emergency, do not wait for our
        response — contact emergency services, your allergist, or the FDA MedWatch reporting
        system at fda.gov/safety/medwatch directly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">NutrientDensityBand corrections (PSU 2차)</h2>
      <p>
        The NutrientDensityBand lever (lib/nutrient-density-band.ts) reads OpenFoodFacts per-100 g
        nutriment columns (protein, fiber, saturated fat, salt, sugars, calories) against FDA Daily
        Value reference amounts codified at 21 CFR 101.9(c). Three kinds of corrections apply:
      </p>
      <ul>
        <li>
          <strong>Upstream OpenFoodFacts nutriment errors.</strong> A wrong per-100 g value at the
          OpenFoodFacts source — corrected upstream and propagated by the next ingest cycle. We
          forward these reports to OpenFoodFacts rather than overriding the row locally.
        </li>
        <li>
          <strong>Tier-cutoff disagreements.</strong> The cutoffs (LimitingDense ≥ 50% / NutrientRich
          ≥ 30% beneficial × ≤ 15% limiting / NutrientDense ≥ 20% × ≤ 25% / NutrientSparse &lt; 10% ×
          &lt; 25%) are documented at {" "}
          and apply uniformly. We will revise the cutoff logic itself only if peer-reviewed work or
          an FDA / USDA / EFSA regulatory update warrants it.
        </li>
        <li>
          <strong>FDA Daily Value reference-amount changes.</strong> If FDA publishes an update to
          21 CFR 101.9(c) Daily Value figures, we revise the constants (DV_PROTEIN_G, DV_FIBER_G,
          DV_SAT_FAT_G, DV_SODIUM_MG, DV_ADDED_SUGAR_G in lib/nutrient-density-band.ts) and re-run
          the tier classifier. The vintage on the methodology and disclaimer pages is bumped at the
          same time.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Four-paragraph composite corrections</h2>
      <p>
        The 4-paragraph composite interpretation (lib/ingredient-interpretation.ts) is deterministic
        — the same (processing tier, allergen tier, density tier) tuple always produces the same
        verdict. Corrections to a composite paragraph fall into one of two categories:
      </p>
      <ul>
        <li>
          <strong>Verdict-string error</strong> (the verdict sentence does not match the levers it
          summarizes): fixed in source code, audit re-run on the dominantSignal switch, and the
          ENTITY_VINTAGE is bumped on the next deploy.
        </li>
        <li>
          <strong>Authority-citation drift</strong> (a citation to FDA 21 CFR 101, FALCPA, FASTER
          Act, USDA FoodData Central, EFSA, WHO-FAO Codex Alimentarius, or Monteiro et al. 2019
          NOVA paper has become stale): fixed in the authorityCitations array, vintage bumped, and
          surfaced on the methodology page.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Source-authority drift surveillance</h2>
      <p>
        Regulatory framework citations on IngrediPeek (FDA 21 CFR 101 / 101.9 / 101.91 / 182 / 184,
        FALCPA 2004, FASTER Act 2021, FDA Food Additive Status List, FDA GRAS Notice Inventory, USDA
        FoodData Central, NIH ODS dietary supplement fact sheets, CDC food-allergy surveillance,
        EFSA Food Additives Database, EU Regulation 1169/2011 Annex II, WHO-FAO Codex Alimentarius
        STAN 1-1985, Monteiro et al. 2019 NOVA, AAAAI clinical guidance, FARE patient resources) can
        change. We monitor the FDA Federal Register, USDA FoodData Central release notes, and EFSA
        announcements for updates. When an authority changes a Daily Value figure, a FALCPA-listed
        allergen, an additive GRAS status, or a NOVA-related publication appears, we update the
        relevant constants in source code and bump the vintage on the methodology and disclaimer
        pages within seven business days of the change appearing in the Federal Register or the
        equivalent EU / Codex publication channel.
      </p>

      <AuthorBox vintage={CORRECTIONS_REVIEWED} source="IngrediPeek corrections policy — FDA MedWatch / FALCPA / FASTER Act / OpenFoodFacts edit interface" />
    </article>
  );
}
