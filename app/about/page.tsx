import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "About IngrediPeek - Food Allergen & Ingredient Checker",
  description:
    "Learn about IngrediPeek, the trusted food allergen and ingredient reference. How we source data, our mission, and how to use our tools safely.",
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">About IngrediPeek</h1>

        <section className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
            <p className="text-slate-700 text-lg font-medium">
              IngrediPeek is a food allergen and ingredient reference tool that helps people with dietary restrictions,
              food allergies, and specific nutritional needs make informed food choices.
            </p>
          </div>

          <p className="text-slate-600 mb-4">
            We understand how important it is for people with food allergies and intolerances to have quick, reliable
            access to allergen information. Whether you have celiac disease and need to know if a product is truly
            gluten-free, or you&apos;re managing a peanut allergy for your child, IngrediPeek is here to help.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Our Data Source</h2>
          <p className="text-slate-600 mb-3">
            IngrediPeek&apos;s product data is sourced from{" "}
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              Open Food Facts
            </a>
            , a free, open, collaborative database of food products from around the world.
            Open Food Facts is a non-profit project backed by thousands of contributors and is
            one of the world&apos;s largest open food databases.
          </p>
          <p className="text-slate-600">
            We regularly update our database and verify data accuracy. However, because food formulations can change,
            we always recommend verifying allergen information on the physical product packaging before consuming.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Important Disclaimer</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm font-medium mb-2">
              ⚠ Always verify allergen information on product packaging.
            </p>
            <p className="text-red-700 text-sm">
              IngrediPeek provides allergen information for reference purposes only. Product formulations change
              frequently, and cross-contamination warnings (&quot;may contain traces of...&quot;) may not always be
              captured in our database. Never rely solely on IngrediPeek for life-threatening food allergy decisions.
              Always read the current product label and consult your healthcare provider.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">What We Track</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">8 Major Allergens</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Milk / Dairy</li>
                <li>• Gluten / Wheat</li>
                <li>• Tree Nuts</li>
                <li>• Peanuts</li>
                <li>• Soy</li>
                <li>• Eggs</li>
                <li>• Fish</li>
                <li>• Shellfish</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Dietary Categories</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Vegan</li>
                <li>• Vegetarian</li>
                <li>• Gluten-Free</li>
                <li>• Halal</li>
                <li>• Organic</li>
                <li>• Dairy-Free</li>
                <li>• Nut-Free</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Part of the DataPeek Network</h2>
          <p className="text-slate-600 mb-4">
            IngrediPeek is part of the DataPeek Insights Network — a collection of data-driven reference tools
            designed to help people make better-informed decisions.
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
      </div>
    </>
  );
}
