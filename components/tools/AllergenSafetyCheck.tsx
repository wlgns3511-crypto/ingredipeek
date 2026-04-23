"use client";

import { type JSX, useState } from "react";

interface AllergenSafetyCheckProps {
  name: string;
  allergen_peanuts: number | null;
  allergen_nuts: number | null;
  allergen_milk: number | null;
  allergen_eggs: number | null;
  allergen_gluten: number | null;
  allergen_soy: number | null;
  allergen_fish: number | null;
  allergen_shellfish: number | null;
  ingredients_text: string | null;
  allergens: string | null;
}

interface AllergenDef {
  key: keyof AllergenSafetyCheckProps;
  label: string;
  keywords: string[];
}

const ALLERGENS: AllergenDef[] = [
  { key: "allergen_peanuts", label: "Peanuts", keywords: ["peanut", "arachide", "groundnut"] },
  { key: "allergen_nuts", label: "Tree Nuts", keywords: ["almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut", "macadamia", "brazil nut", "tree nut", "nuts"] },
  { key: "allergen_milk", label: "Milk", keywords: ["milk", "dairy", "lactose", "casein", "whey", "cream", "butter", "cheese"] },
  { key: "allergen_eggs", label: "Eggs", keywords: ["egg", "albumin", "lysozyme", "mayonnaise", "meringue"] },
  { key: "allergen_gluten", label: "Wheat/Gluten", keywords: ["wheat", "gluten", "flour", "barley", "rye", "spelt", "semolina", "durum"] },
  { key: "allergen_soy", label: "Soy", keywords: ["soy", "soya", "soybean", "edamame", "tofu", "lecithin"] },
  { key: "allergen_fish", label: "Fish", keywords: ["fish", "anchovy", "cod", "salmon", "tuna", "sardine", "tilapia", "bass"] },
  { key: "allergen_shellfish", label: "Shellfish", keywords: ["shellfish", "shrimp", "crab", "lobster", "prawn", "crawfish", "mussel", "oyster", "clam", "scallop"] },
];

type Status = "safe" | "warning" | "danger";

function getStatus(dbValue: number | null): Status {
  if (dbValue === 1) return "danger";
  if (dbValue === 0) return "safe";
  return "warning";
}

const STATUS_CONFIG: Record<Status, { label: string; icon: string; bg: string; text: string; border: string }> = {
  safe: { label: "Safe", icon: "\u2713", bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  warning: { label: "Unknown", icon: "?", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  danger: { label: "Contains", icon: "\u2716", bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
};

function highlightIngredients(text: string, selectedAllergens: Set<string>): JSX.Element[] {
  if (!text) return [];
  const allKeywords: string[] = [];
  ALLERGENS.forEach((a) => {
    if (selectedAllergens.has(a.label)) {
      allKeywords.push(...a.keywords);
    }
  });
  if (allKeywords.length === 0) return [<span key="0">{text}</span>];

  const pattern = new RegExp(`(${allKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (pattern.test(part)) {
      return (
        <mark key={i} className="bg-red-200 text-red-900 font-semibold px-0.5 rounded">
          {part}
        </mark>
      );
    }
    // Reset lastIndex since we reuse the regex
    pattern.lastIndex = 0;
    return <span key={i}>{part}</span>;
  });
}

export function AllergenSafetyCheck(props: AllergenSafetyCheckProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(ALLERGENS.map((a) => a.label)));
  const clearAll = () => setSelected(new Set());

  // Compute results for selected allergens
  const results = ALLERGENS.filter((a) => selected.has(a.label)).map((a) => {
    const status = getStatus(props[a.key] as number | null);
    return { ...a, status };
  });

  const dangerCount = results.filter((r) => r.status === "danger").length;
  const warningCount = results.filter((r) => r.status === "warning").length;
  const safeCount = results.filter((r) => r.status === "safe").length;

  let overallVerdict: { label: string; description: string; bg: string; text: string; border: string };
  if (selected.size === 0) {
    overallVerdict = { label: "Select allergens", description: "Check the boxes above to see results.", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" };
  } else if (dangerCount > 0) {
    overallVerdict = {
      label: "Not Safe",
      description: `This product contains ${dangerCount} of your selected allergen${dangerCount > 1 ? "s" : ""}. Do not consume without consulting a medical professional.`,
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-300",
    };
  } else if (warningCount > 0) {
    overallVerdict = {
      label: "Caution",
      description: `${warningCount} allergen${warningCount > 1 ? "s" : ""} could not be confirmed. Check the product label for "may contain" warnings.`,
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-300",
    };
  } else {
    overallVerdict = {
      label: "Likely Safe",
      description: `This product does not contain your ${safeCount} selected allergen${safeCount > 1 ? "s" : ""} based on database records. Always verify with the actual product label.`,
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-300",
    };
  }

  return (
    <section className="border border-green-200 rounded-xl p-5 bg-green-50/50 mb-8">
      <h2 className="text-lg font-bold text-green-900 mb-1">Allergen Safety Check</h2>
      <p className="text-sm text-slate-500 mb-4">
        Select your allergens to check if {props.name} is safe for you.
      </p>

      {/* Allergen checkboxes */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={selectAll} className="text-xs text-green-700 hover:underline font-medium">Select all</button>
          <button onClick={clearAll} className="text-xs text-slate-500 hover:underline">Clear</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALLERGENS.map((a) => {
            const isChecked = selected.has(a.label);
            const status = getStatus(props[a.key] as number | null);
            const statusConf = STATUS_CONFIG[status];
            return (
              <label
                key={a.label}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                  isChecked
                    ? `${statusConf.bg} ${statusConf.border} border-2`
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(a.label)}
                  className="accent-green-600 w-4 h-4"
                />
                <span className={isChecked ? `font-medium ${statusConf.text}` : "text-slate-700"}>
                  {a.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Overall verdict */}
      <div className={`rounded-lg border ${overallVerdict.border} ${overallVerdict.bg} p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-lg font-bold ${overallVerdict.text}`}>{overallVerdict.label}</span>
        </div>
        <p className={`text-sm ${overallVerdict.text}`}>{overallVerdict.description}</p>
      </div>

      {/* Per-allergen results */}
      {results.length > 0 && (
        <div className="space-y-2 mb-4">
          {results.map((r) => {
            const conf = STATUS_CONFIG[r.status];
            return (
              <div
                key={r.label}
                className={`flex items-center justify-between p-3 rounded-lg border ${conf.border} ${conf.bg}`}
              >
                <span className={`font-medium text-sm ${conf.text}`}>{r.label}</span>
                <span className={`inline-flex items-center gap-1 text-sm font-bold ${conf.text}`}>
                  <span>{conf.icon}</span> {conf.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Flagged ingredients */}
      {props.ingredients_text && selected.size > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700 mb-1">Ingredients (flagged)</p>
          <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
            {highlightIngredients(props.ingredients_text, selected)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Highlighted words match your selected allergen keywords.</p>
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-3">
        Data from Open Food Facts. Always verify against the actual product packaging before consuming.
      </p>
    </section>
  );
}
