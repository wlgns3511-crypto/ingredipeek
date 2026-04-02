import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProductSlugs } from "@/lib/db";
import { generateAnalysis, ALLERGEN_LIST, DIET_LIST } from "@/lib/analysis";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AllergenBadge } from "@/components/AllergenBadge";
import { AdSlot } from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllProductSlugs(300).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} - Alérgenos e Ingredientes | IngrediPeek`,
    description: `Consulta si ${product.name} contiene gluten, lácteos, frutos secos u otros alérgenos. Lista completa de ingredientes y calorías.`,
    alternates: {
      canonical: `${SITE_URL}/es/product/${slug}/`,
      languages: { en: `${SITE_URL}/product/${slug}/`, es: `${SITE_URL}/es/product/${slug}/` },
    },
    openGraph: { url: `${SITE_URL}/es/product/${slug}/` },
  };
}

export default async function EsProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const t = await getDictionary("es");

  const analysis = generateAnalysis(product);
  const allergenData = ALLERGEN_LIST.map((a) => ({
    name: a.name,
    contains: product[a.key] === 1 ? true : product[a.key] === 0 ? false : null,
  }));
  const containsCount = allergenData.filter((a) => a.contains === true).length;

  return (
    <>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:underline">Inicio</a> / <span className="text-slate-800">{product.name}</span>
      </nav>

      <div className="mb-4">
        <a href={`/product/${slug}/`} className="text-green-600 hover:underline text-sm">{t.viewInEnglish}</a>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">{product.name}</h1>
      {product.brand && <p className="text-green-700 font-medium text-sm mb-3">{product.brand}</p>}

      <div className="mb-6">
        {containsCount === 0 ? (
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full border border-green-200">
            {t.noAllergens}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full border border-red-200">
            {t.containsAllergens} ({containsCount})
          </span>
        )}
      </div>

      {/* Allergen Badges */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">{t.allergenInfo}</h2>
        <div className="flex flex-wrap gap-2">
          {allergenData.map((a) => (
            <AllergenBadge key={a.name} name={a.name} contains={a.contains} />
          ))}
        </div>
      </section>

      {/* Diet Compatibility */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">{t.dietCompatibility}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DIET_LIST.map((diet) => {
            const val = product[diet.key];
            const isYes = val === 1;
            const isNo = val === 0;
            return (
              <div key={diet.label} className={`rounded-lg border p-3 text-center text-sm ${isYes ? "bg-green-50 border-green-200" : isNo ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                <div className="text-xl mb-1">{diet.icon}</div>
                <div className={`font-medium text-xs ${isYes ? "text-green-700" : isNo ? "text-red-700" : "text-slate-500"}`}>{diet.label}</div>
                <div className={`font-bold text-lg ${isYes ? "text-green-700" : isNo ? "text-red-600" : "text-slate-400"}`}>{isYes ? "\u2713" : isNo ? "\u2717" : "?"}</div>
              </div>
            );
          })}
        </div>
      </section>

      <AdSlot id="3741591457" />

      {/* Allergen Summary */}
      <section className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-bold mb-2 text-green-900">{t.allergenSummary}</h2>
        <p className="text-slate-700 text-sm leading-relaxed">{analysis}</p>
      </section>

      {/* Ingredients */}
      {product.ingredients_text && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">{t.ingredients}</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{product.ingredients_text}</p>
          </div>
        </section>
      )}

      {/* Nutrition Facts */}
      {(product.calories != null || product.protein != null || product.fat != null) && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">{t.nutritionFacts}</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3">
              <p className="text-xl font-black">{t.nutritionFacts}</p>
              <p className="text-xs text-slate-400">Por 100g</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: t.calories, value: product.calories, unit: "kcal" },
                  { label: t.totalFat, value: product.fat, unit: "g" },
                  { label: t.sugars, value: product.sugars, unit: "g" },
                  { label: t.fiber, value: product.fiber, unit: "g" },
                  { label: t.protein, value: product.protein, unit: "g" },
                  { label: t.salt, value: product.salt, unit: "g" },
                ].filter((row) => row.value != null).map((row, i) => (
                  <tr key={row.label} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="py-2 px-4 text-slate-700 font-medium">{row.label}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-900">{row.value}<span className="text-slate-500 font-normal ml-0.5 text-xs">{row.unit}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
