"use client";

import { useState, useMemo } from "react";

const BIG_9_ALLERGENS: {
  name: string;
  keywords: string[];
  icon: string;
}[] = [
  {
    name: "Milk",
    keywords: [
      "milk", "cream", "butter", "cheese", "whey", "casein", "caseinate",
      "lactose", "lactalbumin", "ghee", "curds", "dairy", "yogurt", "yoghurt",
      "kefir", "half-and-half", "custard", "pudding",
    ],
    icon: "\uD83E\uDD5B",
  },
  {
    name: "Eggs",
    keywords: [
      "egg", "eggs", "albumin", "globulin", "lysozyme", "mayonnaise",
      "meringue", "ovalbumin", "ovomucin", "ovomucoid", "ovovitellin",
      "surimi", "eggnog",
    ],
    icon: "\uD83E\uDD5A",
  },
  {
    name: "Wheat",
    keywords: [
      "wheat", "flour", "bread", "breadcrumbs", "bulgur", "couscous",
      "durum", "einkorn", "emmer", "farina", "kamut", "semolina",
      "spelt", "triticale", "gluten", "seitan",
    ],
    icon: "\uD83C\uDF3E",
  },
  {
    name: "Soy",
    keywords: [
      "soy", "soya", "soybean", "soybeans", "edamame", "miso", "tempeh",
      "tofu", "soy sauce", "soy lecithin", "soy protein",
    ],
    icon: "\uD83E\uDED8",
  },
  {
    name: "Peanuts",
    keywords: [
      "peanut", "peanuts", "peanut butter", "peanut oil", "arachis",
      "groundnut", "groundnuts", "monkey nuts",
    ],
    icon: "\uD83E\uDD5C",
  },
  {
    name: "Tree Nuts",
    keywords: [
      "almond", "almonds", "cashew", "cashews", "walnut", "walnuts",
      "pecan", "pecans", "pistachio", "pistachios", "macadamia",
      "hazelnut", "hazelnuts", "brazil nut", "pine nut", "pine nuts",
      "chestnut", "chestnuts", "praline", "marzipan", "nougat",
    ],
    icon: "\uD83C\uDF30",
  },
  {
    name: "Fish",
    keywords: [
      "fish", "cod", "salmon", "tuna", "anchovy", "anchovies", "sardine",
      "sardines", "bass", "catfish", "haddock", "herring", "mackerel",
      "perch", "pike", "pollock", "snapper", "sole", "swordfish",
      "tilapia", "trout", "fish sauce", "fish oil", "worcestershire",
    ],
    icon: "\uD83D\uDC1F",
  },
  {
    name: "Shellfish",
    keywords: [
      "shellfish", "shrimp", "crab", "lobster", "crawfish", "crayfish",
      "prawn", "prawns", "scallop", "scallops", "clam", "clams",
      "mussel", "mussels", "oyster", "oysters", "squid", "calamari",
      "octopus", "snail", "abalone",
    ],
    icon: "\uD83E\uDD90",
  },
  {
    name: "Sesame",
    keywords: [
      "sesame", "sesame seeds", "sesame oil", "tahini", "halvah",
      "hummus", "sesame flour", "sesame paste",
    ],
    icon: "\uD83C\uDF3F",
  },
];

interface IngredientResult {
  text: string;
  allergens: string[];
  isSafe: boolean;
}

function analyzeIngredients(input: string): {
  ingredients: IngredientResult[];
  detectedAllergens: { name: string; icon: string; keywords: string[] }[];
} {
  // Split by commas, semicolons, or periods
  const parts = input
    .split(/[,;.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const detectedSet = new Set<string>();
  const ingredients: IngredientResult[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase();
    const matched: string[] = [];

    for (const allergen of BIG_9_ALLERGENS) {
      for (const kw of allergen.keywords) {
        // Check word boundary match
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(lower)) {
          if (!matched.includes(allergen.name)) {
            matched.push(allergen.name);
            detectedSet.add(allergen.name);
          }
          break;
        }
      }
    }

    ingredients.push({
      text: part,
      allergens: matched,
      isSafe: matched.length === 0,
    });
  }

  const detectedAllergens = BIG_9_ALLERGENS.filter((a) =>
    detectedSet.has(a.name)
  ).map((a) => ({ name: a.name, icon: a.icon, keywords: a.keywords }));

  return { ingredients, detectedAllergens };
}

export function AllergenChecker() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted || !input.trim()) return null;
    return analyzeIngredients(input);
  }, [input, submitted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleClear() {
    setInput("");
    setSubmitted(false);
  }

  const safeAllergens = submitted
    ? BIG_9_ALLERGENS.filter(
        (a) => !result?.detectedAllergens.find((d) => d.name === a.name)
      )
    : [];

  return (
    <section className="my-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
      <h2 className="text-2xl font-bold text-emerald-900 mb-2">
        Allergen Checker
      </h2>
      <p className="text-sm text-emerald-700 mb-5">
        Paste an ingredient list from any product label to instantly detect the
        Big 9 allergens: milk, eggs, wheat, soy, peanuts, tree nuts, fish,
        shellfish, and sesame.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (submitted) setSubmitted(false);
          }}
          placeholder="Paste ingredient list here, e.g.: Water, enriched wheat flour, sugar, soybean oil, eggs, salt, milk powder, sesame seeds..."
          rows={4}
          className="w-full px-4 py-3 border border-emerald-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white resize-y"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Check Allergens
          </button>
          {submitted && (
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 border border-emerald-300 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className="mt-6 space-y-5">
          {/* Allergen summary */}
          {result.detectedAllergens.length > 0 ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="text-sm font-semibold text-red-800 mb-3">
                Allergens Detected ({result.detectedAllergens.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.detectedAllergens.map((a) => (
                  <span
                    key={a.name}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 border border-red-300 text-red-800 rounded-full text-sm font-medium"
                  >
                    <span>{a.icon}</span> {a.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-sm font-semibold text-green-800">
                No Big 9 allergens detected!
              </h3>
              <p className="text-xs text-green-600 mt-1">
                Always verify with the product label and manufacturer for
                cross-contamination risks.
              </p>
            </div>
          )}

          {/* Safe allergens */}
          {safeAllergens.length > 0 && result.detectedAllergens.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-sm font-semibold text-green-800 mb-3">
                Not Detected ({safeAllergens.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeAllergens.map((a) => (
                  <span
                    key={a.name}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 border border-green-300 text-green-800 rounded-full text-sm font-medium"
                  >
                    <span>{a.icon}</span> {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredient breakdown */}
          <div className="p-4 bg-white border border-emerald-200 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Ingredient Breakdown
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {result.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                    ing.isSafe
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-300"
                  }`}
                  title={
                    ing.allergens.length > 0
                      ? `Contains: ${ing.allergens.join(", ")}`
                      : "No allergens detected"
                  }
                >
                  {ing.text}
                  {ing.allergens.length > 0 && (
                    <span className="ml-1 text-red-500 font-bold">!</span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Green = no allergens detected. Red = contains allergens. Hover for
              details.
            </p>
          </div>

          <p className="text-xs text-slate-400">
            This tool provides a general screening only. Always check the actual
            product label and consult with your healthcare provider for
            allergy-related decisions.
          </p>
        </div>
      )}

      {/* High-CPC footer */}
      <div className="mt-6 pt-5 border-t border-emerald-200">
        <h3 className="text-sm font-semibold text-emerald-900 mb-2">
          Managing Food Allergies?
        </h3>
        <p className="text-xs text-emerald-700 leading-relaxed">
          Explore allergy testing kits, compare epinephrine auto-injectors, try
          allergen-free meal kits, and learn about comprehensive food sensitivity
          testing options.
        </p>
      </div>
    </section>
  );
}
