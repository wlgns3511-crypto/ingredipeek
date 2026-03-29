import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparisonBySlug, getProductBySlug, getAllComparisonSlugs } from "@/lib/db";
import { faqJsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";
import { ComparisonBar } from "@/components/ComparisonBar";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllComparisonSlugs(500).map((c) => ({ slug: c.slug }));
}

function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return "N/A";
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = getComparisonBySlug(slug);
  if (!comp) return {};
  const a = getProductBySlug(comp.product_a);
  const b = getProductBySlug(comp.product_b);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} - Nutrition & Ingredient Comparison`,
    description: `Compare ${a.name} (${fmt(a.calories)} cal) vs ${b.name} (${fmt(b.calories)} cal). Side-by-side nutrition facts, allergens, and dietary information.`,
    alternates: { canonical: `/compare/${slug}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const comp = getComparisonBySlug(slug);
  if (!comp) notFound();

  const a = getProductBySlug(comp.product_a);
  const b = getProductBySlug(comp.product_b);
  if (!a || !b) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Compare" },
    { label: `${a.name} vs ${b.name}` },
  ];

  const nutrients = [
    { label: "Calories", a: fmt(a.calories), b: fmt(b.calories), unit: "kcal" },
    { label: "Fat", a: fmt(a.fat), b: fmt(b.fat), unit: "g" },
    { label: "Saturated Fat", a: fmt(a.saturated_fat), b: fmt(b.saturated_fat), unit: "g" },
    { label: "Carbs", a: fmt(a.carbs), b: fmt(b.carbs), unit: "g" },
    { label: "Sugars", a: fmt(a.sugars), b: fmt(b.sugars), unit: "g" },
    { label: "Protein", a: fmt(a.protein), b: fmt(b.protein), unit: "g" },
    { label: "Salt", a: fmt(a.salt), b: fmt(b.salt), unit: "g" },
    { label: "Fiber", a: fmt(a.fiber), b: fmt(b.fiber), unit: "g" },
  ];

  const faqs = [
    { question: `Which has more calories, ${a.name} or ${b.name}?`, answer: `${a.name} has ${fmt(a.calories)} calories per 100g while ${b.name} has ${fmt(b.calories)} calories per 100g.` },
    { question: `Which has more protein?`, answer: `${a.name} has ${fmt(a.protein)}g protein vs ${b.name} with ${fmt(b.protein)}g protein per 100g.` },
  ];

  return (
    <article className="max-w-4xl mx-auto">
      <Breadcrumb items={crumbs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
          {a.name} vs {b.name}
        </h1>
        <p className="text-slate-600">Nutrition & Ingredient Comparison (per 100g)</p>
        <FreshnessTag />
      </header>

      <AdSlot id="top" />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <a href={`/product/${a.slug}/`} className="block p-4 bg-green-50 rounded-lg text-center hover:shadow-md transition-shadow">
          <div className="font-bold text-green-700">{a.name}</div>
          <div className="text-xs text-slate-500">{a.brand}</div>
        </a>
        <a href={`/product/${b.slug}/`} className="block p-4 bg-blue-50 rounded-lg text-center hover:shadow-md transition-shadow">
          <div className="font-bold text-blue-700">{b.name}</div>
          <div className="text-xs text-slate-500">{b.brand}</div>
        </a>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold">Nutrient</th>
            <th className="px-4 py-3 text-right font-semibold text-green-700">{a.name}</th>
            <th className="px-4 py-3 text-right font-semibold text-blue-700">{b.name}</th>
          </tr></thead>
          <tbody>
            {nutrients.map((n, i) => (
              <tr key={n.label} className={i % 2 === 0 ? "" : "bg-slate-50/50"}>
                <td className="px-4 py-2 font-medium">{n.label}</td>
                <td className="px-4 py-2 text-right">{n.a} {n.unit}</td>
                <td className="px-4 py-2 text-right">{n.b} {n.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Nutrition Bars */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Visual Nutrition Comparison</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "24px 0" }}>
          {a.calories != null && b.calories != null && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Calories (kcal per 100g)</h3>
              <ComparisonBar
                bars={[{ label: a.name, value: a.calories }, { label: b.name, value: b.calories }]}
                format={(v) => v.toLocaleString() + " kcal"}
              />
            </div>
          )}
          {a.protein != null && b.protein != null && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Protein (g per 100g)</h3>
              <ComparisonBar
                bars={[{ label: a.name, value: a.protein }, { label: b.name, value: b.protein }]}
                format={(v) => v.toFixed(1) + "g"}
              />
            </div>
          )}
          {a.fat != null && b.fat != null && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Fat (g per 100g)</h3>
              <ComparisonBar
                bars={[{ label: a.name, value: a.fat }, { label: b.name, value: b.fat }]}
                format={(v) => v.toFixed(1) + "g"}
              />
            </div>
          )}
          {a.sugars != null && b.sugars != null && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Sugars (g per 100g)</h3>
              <ComparisonBar
                bars={[{ label: a.name, value: a.sugars }, { label: b.name, value: b.sugars }]}
                format={(v) => v.toFixed(1) + "g"}
              />
            </div>
          )}
        </div>
      </section>

      <AdSlot id="bottom" />

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.question} className="border border-slate-200 rounded-lg">
              <summary className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-50">{f.question}</summary>
              <p className="px-4 pb-3 text-sm text-slate-600">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}
