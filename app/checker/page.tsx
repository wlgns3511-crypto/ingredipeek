import type { Metadata } from "next";
import { AllergenChecker } from "@/components/AllergenChecker";

export const metadata: Metadata = {
  title: "Allergen Checker - Scan Ingredients for Big 9 Allergens",
  description:
    "Paste any ingredient list to instantly detect the Big 9 allergens: milk, eggs, wheat, soy, peanuts, tree nuts, fish, shellfish, and sesame. Free and instant results.",
  alternates: { canonical: "/checker" },
};

export default function CheckerPage() {
  return (
    <div>
      <section className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Ingredient Allergen Checker</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Paste an ingredient list from any food product label. Our tool scans
          for the Big 9 allergens and highlights each ingredient as safe or
          potentially allergenic.
        </p>
      </section>

      <AllergenChecker />

      <section className="mt-10 bg-emerald-50 border border-emerald-100 rounded-xl p-6">
        <h2 className="text-lg font-bold text-emerald-900 mb-3">
          About the Big 9 Allergens
        </h2>
        <p className="text-sm text-slate-700 mb-4">
          The Big 9 allergens account for approximately 90% of all food
          allergic reactions. As of 2023, U.S. food labeling law (FALCPA +
          FASTER Act) requires clear declaration of these allergens:
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
          {[
            { n: "Milk", i: "\uD83E\uDD5B" },
            { n: "Eggs", i: "\uD83E\uDD5A" },
            { n: "Wheat", i: "\uD83C\uDF3E" },
            { n: "Soy", i: "\uD83E\uDED8" },
            { n: "Peanuts", i: "\uD83E\uDD5C" },
            { n: "Tree Nuts", i: "\uD83C\uDF30" },
            { n: "Fish", i: "\uD83D\uDC1F" },
            { n: "Shellfish", i: "\uD83E\uDD90" },
            { n: "Sesame", i: "\uD83C\uDF3F" },
          ].map((a) => (
            <div
              key={a.n}
              className="text-center p-2 bg-white rounded-lg border border-emerald-200"
            >
              <div className="text-xl">{a.i}</div>
              <div className="text-xs font-medium text-slate-700 mt-1">
                {a.n}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 text-center text-sm text-slate-500">
        <p>
          Looking for specific products?{" "}
          <a href="/" className="text-green-600 hover:underline">
            Search our food database
          </a>{" "}
          for verified allergen information on thousands of products.
        </p>
      </section>
    </div>
  );
}
