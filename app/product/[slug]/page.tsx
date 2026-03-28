import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProductSlugs, getRelatedProducts } from "@/lib/db";
import { generateAnalysis, generateFAQ, ALLERGEN_LIST, DIET_LIST } from "@/lib/analysis";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";
import { AllergenBadge } from "@/components/AllergenBadge";
import { NutriScore, NovaGroup } from "@/components/NutriScore";
import { AdSlot } from "@/components/AdSlot";
import { EmbedButton } from "@/components/EmbedButton";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FAQ } from "@/components/FAQ";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllProductSlugs(5000);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const title = `Is ${product.name} Gluten Free, Vegan, Halal? | Allergen Info`;
  const description = `Check if ${product.name}${product.brand ? ` by ${product.brand}` : ""} is gluten-free, vegan, halal, nut-free, or dairy-free. Full allergen and ingredient list.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${slug}/`,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const analysis = generateAnalysis(product);
  const faqItems = generateFAQ(product);
  const related = getRelatedProducts(product.categories, slug, 6);

  const allergenData = ALLERGEN_LIST.map((a) => ({
    name: a.name,
    contains: product[a.key] === 1 ? true : product[a.key] === 0 ? false : null,
  }));

  const containsCount = allergenData.filter((a) => a.contains === true).length;

  const productSchema = productJsonLd(product);
  const breadSchema = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Products", url: `${SITE_URL}/` },
    { name: product.name, url: `${SITE_URL}/product/${slug}/` },
  ]);
  const faqSchema = faqJsonLd(faqItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products" },
          { label: product.name },
        ]}
      />

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Header */}
          <section>
            <div className="flex gap-6 items-start">
              {product.image_url && (
                <div className="w-28 h-28 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {product.name}
                </h1>
                {product.brand && (
                  <a
                    href={`/brand/${product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`}
                    className="text-green-700 hover:underline font-medium text-sm"
                  >
                    {product.brand}
                  </a>
                )}
                {product.categories && (
                  <p className="text-xs text-slate-500 mt-1">
                    {product.categories.split(",").slice(0, 3).join(", ")}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  {containsCount === 0 ? (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full border border-green-200">
                      <span>✓</span> No major allergens detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full border border-red-200">
                      <span>⚠</span> Contains {containsCount} allergen{containsCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Allergen Badges */}
          <section>
            <h2 className="text-lg font-bold mb-3">Allergen Information</h2>
            <div className="flex flex-wrap gap-2">
              {allergenData.map((a) => (
                <AllergenBadge
                  key={a.name}
                  name={a.name}
                  contains={a.contains}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              ✓ green = confirmed free-of · ⚠ red = contains · ? = unknown
            </p>
          </section>

          {/* Diet Compatibility */}
          <section>
            <h2 className="text-lg font-bold mb-3">Diet Compatibility</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIET_LIST.map((diet) => {
                const val = product[diet.key];
                const isYes = val === 1;
                const isNo = val === 0;
                return (
                  <div
                    key={diet.label}
                    className={`rounded-lg border p-3 text-center text-sm ${
                      isYes
                        ? "bg-green-50 border-green-200"
                        : isNo
                        ? "bg-red-50 border-red-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="text-xl mb-1">{diet.icon}</div>
                    <div
                      className={`font-medium text-xs ${
                        isYes
                          ? "text-green-700"
                          : isNo
                          ? "text-red-700"
                          : "text-slate-500"
                      }`}
                    >
                      {diet.label}
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        isYes
                          ? "text-green-700"
                          : isNo
                          ? "text-red-600"
                          : "text-slate-400"
                      }`}
                    >
                      {isYes ? "✓" : isNo ? "✗" : "?"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <AdSlot id="3741591457" />

          {/* AI Analysis */}
          <section className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-lg font-bold mb-2 text-green-900">Allergen Summary</h2>
            <p className="text-slate-700 text-sm leading-relaxed">{analysis}</p>
            <FreshnessTag />
          </section>

          {/* Ingredients */}
          {product.ingredients_text && (
            <section>
              <h2 className="text-lg font-bold mb-3">Ingredients</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {product.ingredients_text}
                </p>
              </div>
            </section>
          )}

          {/* Nutrition Facts */}
          {(product.calories != null ||
            product.protein != null ||
            product.fat != null ||
            product.carbs != null) && (
            <section>
              <h2 className="text-lg font-bold mb-3">Nutrition Facts</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 text-white px-4 py-3">
                  <p className="text-xl font-black">Nutrition Facts</p>
                  <p className="text-xs text-slate-400">Per 100g serving</p>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: "Calories", value: product.calories, unit: "kcal" },
                      { label: "Total Fat", value: product.fat, unit: "g" },
                      { label: "Saturated Fat", value: product.saturated_fat, unit: "g", indent: true },
                      { label: "Total Carbohydrates", value: product.carbs, unit: "g" },
                      { label: "Sugars", value: product.sugars, unit: "g", indent: true },
                      { label: "Dietary Fiber", value: product.fiber, unit: "g", indent: true },
                      { label: "Protein", value: product.protein, unit: "g" },
                      { label: "Salt / Sodium", value: product.salt, unit: "g" },
                    ]
                      .filter((row) => row.value != null)
                      .map((row, i) => (
                        <tr
                          key={row.label}
                          className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                        >
                          <td className={`py-2 px-4 text-slate-700 ${row.indent ? "pl-8 text-xs" : "font-medium"}`}>
                            {row.label}
                          </td>
                          <td className="py-2 px-4 text-right font-medium text-slate-900">
                            {row.value}
                            <span className="text-slate-500 font-normal ml-0.5 text-xs">
                              {row.unit}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Nutri-Score & NOVA */}
          {(product.nutriscore || product.nova_group) && (
            <section>
              <h2 className="text-lg font-bold mb-4">Food Quality Scores</h2>
              <div className="flex flex-wrap gap-8">
                <NutriScore score={product.nutriscore} />
                <NovaGroup group={product.nova_group} />
              </div>
            </section>
          )}

          {/* FAQ */}
          <FAQ items={faqItems} />

          {/* High-CPC CTA */}
          <section className="bg-gradient-to-r from-green-700 to-emerald-800 rounded-xl p-5 text-white">
            <h3 className="font-bold text-lg mb-1">Managing food allergies?</h3>
            <p className="text-green-100 text-sm mb-3">
              Need allergy-safe meal plans? Compare food delivery services that cater to dietary restrictions and food allergies.
            </p>
            <a
              href="https://caloriewize.com"
              className="inline-block bg-white text-green-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              Compare Allergy-Safe Meal Delivery →
            </a>
          </section>

          {/* Related Data Resources */}
          <section className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Related Data Resources</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href="https://caloriewize.com" className="text-green-600 hover:underline">CalorieWize - Nutrition facts &rarr;</a>
              <a href="https://calcpeek.com" className="text-green-600 hover:underline">CalcPeek - Health calculators &rarr;</a>
            </div>
          </section>

          <DataFeedback />

          <div className="flex gap-4 items-center flex-wrap">
            <EmbedButton
              url={`${SITE_URL}/product/${slug}/`}
              title={`${product.name} allergen info`}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Quick Summary Card */}
          <div className="border border-slate-200 rounded-xl p-4 sticky top-20">
            <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
              Quick Summary
            </h3>
            <dl className="space-y-2 text-sm">
              {product.barcode && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Barcode</dt>
                  <dd className="font-mono text-xs text-slate-700">{product.barcode}</dd>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Brand</dt>
                  <dd className="text-slate-700 font-medium">{product.brand}</dd>
                </div>
              )}
              {product.nutriscore && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Nutri-Score</dt>
                  <dd className="font-bold text-slate-700 uppercase">{product.nutriscore}</dd>
                </div>
              )}
              {product.nova_group && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">NOVA Group</dt>
                  <dd className="text-slate-700">{product.nova_group}</dd>
                </div>
              )}
              {product.countries && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Countries</dt>
                  <dd className="text-slate-700 text-right text-xs">
                    {product.countries.split(",").slice(0, 2).join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Diet Status</p>
              <div className="space-y-1">
                {DIET_LIST.slice(0, 6).map((diet) => {
                  const val = product[diet.key];
                  const isYes = val === 1;
                  const isNo = val === 0;
                  return (
                    <div key={diet.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{diet.label}</span>
                      <span
                        className={`font-bold ${
                          isYes ? "text-green-600" : isNo ? "text-red-500" : "text-slate-300"
                        }`}
                      >
                        {isYes ? "✓ Yes" : isNo ? "✗ No" : "Unknown"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <AdSlot id="1234567890" className="w-full" />
        </aside>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {related.map((p) => (
              <a
                key={p.barcode}
                href={`/product/${p.slug}/`}
                className="border border-slate-200 rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all group"
              >
                {p.image_url && (
                  <div className="w-full h-20 mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-green-700">
                  {p.name}
                </p>
                {p.brand && <p className="text-xs text-slate-500">{p.brand}</p>}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
