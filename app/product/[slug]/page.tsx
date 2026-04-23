import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProductSlugs, getAllComparisonSlugs, getRelatedProducts, getRandomProducts, getGlobalAvgCalories } from "@/lib/db";
import { generateAnalysis, generateFAQ, ALLERGEN_LIST, DIET_LIST } from "@/lib/analysis";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";
import { generateAutoFaqs } from "@/lib/auto-faqs";
import { AllergenBadge } from "@/components/AllergenBadge";
import { NutriScore, NovaGroup } from "@/components/NutriScore";
import { AdSlot } from "@/components/AdSlot";
import { EmbedButton } from "@/components/EmbedButton";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FAQ } from "@/components/FAQ";
import { AuthorBox } from "@/components/AuthorBox";
import { EditorNote } from "@/components/EditorNote";
import { DidYouKnow } from "@/components/DidYouKnow";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { FeedbackButton } from "@/components/FeedbackButton";
import { AllergenSafetyCheck } from "@/components/tools/AllergenSafetyCheck";
import { InsightCards } from "@/components/InsightCards";
import { InsightBlock } from "@/components/upgrades/InsightBlock";
import { generateInsights } from "@/lib/insights";
import { AnswerHero } from "@/components/upgrades/AnswerHero";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { DecisionNext } from "@/components/upgrades/DecisionNext";
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { TableOfContents } from '@/components/upgrades/TableOfContents';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";
const STATIC_COMPARISON_SET = new Set(getAllComparisonSlugs(5000).map((c) => c.slug));

function toCanonicalComparisonSlug(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join("-vs-");
}

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = getAllProductSlugs(5000);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  // Derive direct yes/no answers from allergen columns (1=contains, 0=free of, null=unknown)
  const gfVal = product.is_gluten_free;
  const veganVal = product.is_vegan;
  const nutsVal = product.allergen_nuts === 1 || product.allergen_peanuts === 1
    ? 1
    : (product.allergen_nuts === 0 && product.allergen_peanuts === 0) ? 0 : null;
  const gfAns = gfVal === 1 ? 'Yes' : gfVal === 0 ? 'No' : 'Unclear';
  const veganAns = veganVal === 1 ? 'Yes' : veganVal === 0 ? 'No' : 'Unclear';
  const nutsAns = nutsVal === 1 ? 'contains nuts' : nutsVal === 0 ? 'nut-free' : 'nut status unclear';
  const brandSuffix = product.brand ? ` by ${product.brand}` : '';

  // Lead with the strongest signal — prefer gluten-free if known, else vegan, else generic
  let title: string;
  if (gfVal != null) {
    title = `Is ${product.name} gluten-free? ${gfAns} · Allergen Check`;
  } else if (veganVal != null) {
    title = `Is ${product.name} vegan? ${veganAns} · Allergen Check`;
  } else {
    title = `Is ${product.name} safe for allergies? Ingredient Check`;
  }

  const nutriPart = product.nutriscore ? `Nutri-Score ${product.nutriscore.toUpperCase()}` : null;
  const caloriePart = product.calories != null ? `${Math.round(product.calories)} kcal/100g` : null;
  const statParts = [
    `gluten-free: ${gfAns}`,
    `vegan: ${veganAns}`,
    nutsAns,
    nutriPart,
    caloriePart,
  ].filter(Boolean).slice(0, 3).join(', ');
  const description = `${product.name}${brandSuffix}: ${statParts}. Full allergen panel (8 FDA-tracked), diet compatibility, and ingredient list from Open Food Facts.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${slug}/` },
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
  const baseFaqItems = generateFAQ(product);
  const autoFaqItems = generateAutoFaqs(product);
  // Merge: existing diet-compatibility FAQs + auto-generated data FAQs (deduplicate by checking question text)
  const seenQuestions = new Set(baseFaqItems.map(f => f.question.toLowerCase()));
  const faqItems = [...baseFaqItems, ...autoFaqItems.filter(f => !seenQuestions.has(f.question.toLowerCase()))];
  const related = getRelatedProducts(product.categories, slug, 6);
  const randomProducts = getRandomProducts(20).filter(
    (p) => p.slug && p.slug !== slug && STATIC_COMPARISON_SET.has(toCanonicalComparisonSlug(slug, p.slug))
  );
  const primaryCompareSlug =
    related[0]?.slug ? toCanonicalComparisonSlug(slug, related[0].slug) : null;
  const canShowPrimaryCompare = primaryCompareSlug ? STATIC_COMPARISON_SET.has(primaryCompareSlug) : false;

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

      <AnswerHero
        title={product.name}
        subtitle={product.brand || null}
        tagline={`${
          containsCount === 0
            ? "No major allergens detected in the listed ingredients."
            : `Contains ${containsCount} of the 8 major allergens.`
        }${product.nutriscore ? ` Nutri-Score ${product.nutriscore.toUpperCase()}.` : ""}${
          product.nova_group ? ` NOVA group ${product.nova_group}.` : ""
        }${
          product.calories != null ? ` ${Math.round(product.calories)} kcal per 100g.` : ""
        } Always confirm against the product packaging before consuming.`}
        badges={[
          {
            label: containsCount === 0 ? "No major allergens" : `${containsCount} allergen${containsCount > 1 ? "s" : ""}`,
            tone: containsCount === 0 ? "emerald" : "amber",
          },
          ...(product.nutriscore
            ? [{ label: `Nutri-Score ${product.nutriscore.toUpperCase()}`, tone: "indigo" as const }]
            : []),
          ...(product.is_vegan === 1 ? [{ label: "Vegan", tone: "emerald" as const }] : []),
          ...(product.is_gluten_free === 1 ? [{ label: "Gluten-free", tone: "emerald" as const }] : []),
        ]}
        alternatives={related.slice(0, 3).map((p) => ({
          label: p.name,
          href: `/product/${p.slug}/`,
          sublabel: p.brand || undefined,
        }))}
        alternativesLabel="Similar products"
      />

      <TrustBlock
        sources={[
          {
            name: "Open Food Facts",
            url: product.barcode
              ? `https://world.openfoodfacts.org/product/${product.barcode}`
              : "https://world.openfoodfacts.org/",
          },
          {
            name: "USDA FoodData Central",
            url: "https://fdc.nal.usda.gov/",
          },
          {
            name: "FDA Food Allergen Labeling",
            url: "https://www.fda.gov/food/food-labeling-nutrition/food-allergies",
          },
          {
            name: "Nutri-Score (Santé publique France)",
            url: "https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score",
          },
          {
            name: "NOVA Classification",
            url: "https://world.openfoodfacts.org/nova",
          },
        ]}
        updated="Open Food Facts community database"
      />

      <TableOfContents />

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
                    {product.categories.split(",").join(", ")}
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

          <EditorNote note={`We cross-referenced ${product.name}${product.brand ? ` by ${product.brand}` : ""} against Open Food Facts and USDA databases to verify allergen labels, ingredient lists, and nutritional values. Always confirm with the product packaging before consuming.`} />

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

          <AllergenSafetyCheck
            name={product.name}
            allergen_peanuts={product.allergen_peanuts}
            allergen_nuts={product.allergen_nuts}
            allergen_milk={product.allergen_milk}
            allergen_eggs={product.allergen_eggs}
            allergen_gluten={product.allergen_gluten}
            allergen_soy={product.allergen_soy}
            allergen_fish={product.allergen_fish}
            allergen_shellfish={product.allergen_shellfish}
            ingredients_text={product.ingredients_text}
            allergens={product.allergens}
          />

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

          {/* Why this product matters — US shopper / allergy parent context */}
          <section data-upgrade="why-it-matters">
            <h2 className="text-lg font-bold mb-3">
              Why this product matters
            </h2>
            <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
              {(() => {
                const hasCritical = product.allergen_peanuts === 1 || product.allergen_nuts === 1 || product.allergen_shellfish === 1;
                const hasMilk = product.allergen_milk === 1;
                const hasGluten = product.allergen_gluten === 1;
                const isUltraProcessed = product.nova_group === 4;
                const isHighQuality = product.nutriscore === "a" || product.nutriscore === "b";
                const isPoorQuality = product.nutriscore === "d" || product.nutriscore === "e";

                const primary = containsCount === 0
                  ? `${product.name} is listed in Open Food Facts with no declaration for the 8 major FDA-regulated allergens. For households managing food allergies, that makes it a candidate to consider \u2014 but cross-check the packaging for "may contain" warnings, which often sit outside the ingredient list but still matter legally and medically.`
                  : hasCritical
                  ? `${product.name} contains allergens in the highest-risk category for anaphylactic reactions: peanut, tree nut, or shellfish. For US households with diagnosed allergies in these groups, this product should be treated as a hard avoid and anyone handling it should wash hands and surfaces before touching shared food.`
                  : hasMilk || hasGluten
                  ? `${product.name} contains ${hasMilk && hasGluten ? "milk and gluten" : hasMilk ? "milk" : "gluten"} \u2014 two of the most common intolerances in US households. It is not a safe choice for a ${hasMilk ? "lactose-intolerant or dairy-free" : ""}${hasMilk && hasGluten ? " or " : ""}${hasGluten ? "celiac or gluten-sensitive" : ""} diet.`
                  : `${product.name} contains at least one of the 8 major allergens tracked by the FDA. Check the specific allergen badges above against your household's needs.`;

                const qualityNote = isHighQuality
                  ? `Nutri-Score ${product.nutriscore?.toUpperCase()} places this product in the upper tier of nutritional quality in Open Food Facts' French-standardized rating. The rating balances calories, saturated fat, sugar, sodium against fiber, protein, fruits/vegetables \u2014 it is a rough guide, not a verdict.`
                  : isPoorQuality
                  ? `Nutri-Score ${product.nutriscore?.toUpperCase()} flags this product as lower-quality by the French-standardized rating. The main drivers are typically high sugar, saturated fat, or sodium. Consider this a nudge, not a prohibition \u2014 context matters (portion size, frequency, diet diversity).`
                  : product.nutriscore
                  ? `Nutri-Score ${product.nutriscore?.toUpperCase()} places this product in the middle of the French nutritional rating scale \u2014 neither a standout nor a red flag.`
                  : null;

                const novaNote = isUltraProcessed
                  ? `NOVA group 4 means this is an "ultra-processed" food by the São Paulo University classification used across European food policy. US research including the NIH metabolic ward studies has linked higher ultra-processed intake to higher calorie consumption. Moderate, don't panic.`
                  : product.nova_group
                  ? `NOVA group ${product.nova_group} places this product in ${product.nova_group === 1 ? "the least-processed" : product.nova_group === 2 ? "a lightly processed" : "a processed"} category on the 1\u20134 food-processing scale.`
                  : null;

                const labelingNote = `US packaging is governed by the FDA's Food Allergen Labeling and Consumer Protection Act (FALCPA) and, since 2023, the FASTER Act which added sesame as the 9th major allergen. Always read the latest printed label \u2014 formulations change and databases lag.`;

                return (
                  <>
                    <p>{primary}</p>
                    {qualityNote && <p>{qualityNote}</p>}
                    {novaNote && <p>{novaNote}</p>}
                    <p className="text-sm text-slate-500">{labelingNote}</p>
                  </>
                );
              })()}
            </div>
          </section>

          <InsightCards product={product} />

          <InsightBlock entityName={product.name} insights={generateInsights(product)} />

          {/* Data Insights */}
          {(() => {
            const nutriscoreLabels: Record<string, string> = {
              a: 'Excellent nutritional quality',
              b: 'Good nutritional quality',
              c: 'Average nutritional quality',
              d: 'Poor nutritional quality',
              e: 'Unhealthy nutritional quality',
            };
            const novaLabels: Record<number, string> = {
              1: 'unprocessed/minimally processed',
              2: 'processed culinary ingredients',
              3: 'processed foods',
              4: 'ultra-processed foods',
            };
            const globalAvgCal = getGlobalAvgCalories();
            const calDiff = product.calories != null && globalAvgCal > 0 ? ((product.calories - globalAvgCal) / globalAvgCal * 100) : null;
            return (
              <section className="mb-6 bg-green-50 border border-green-200 rounded-xl p-5">
                <h2 className="text-lg font-bold text-green-900 mb-3">Product Insights</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">!</span>
                    <p className="text-slate-700">
                      This product contains <strong className={containsCount > 0 ? 'text-red-700' : 'text-green-700'}>{containsCount} of 8 major allergens</strong> tracked by food safety authorities (milk, gluten, nuts, soy, eggs, fish, shellfish, peanuts).
                    </p>
                  </div>
                  {product.nutriscore && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 font-bold uppercase">{product.nutriscore}</span>
                      <p className="text-slate-700">
                        Nutri-Score <strong className="uppercase">{product.nutriscore}</strong> means <strong>{nutriscoreLabels[product.nutriscore.toLowerCase()] || 'unrated'}</strong> based on the European nutritional grading system.
                      </p>
                    </div>
                  )}
                  {calDiff !== null && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">{calDiff > 0 ? '▲' : '▼'}</span>
                      <p className="text-slate-700">
                        At <strong>{product.calories} kcal/100g</strong>, this is <strong className={calDiff > 0 ? 'text-red-700' : 'text-green-700'}>{Math.abs(calDiff).toFixed(0)}% {calDiff > 0 ? 'above' : 'below'}</strong> the database average of {globalAvgCal} kcal/100g.
                      </p>
                    </div>
                  )}
                  {product.nova_group && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">{product.nova_group}</span>
                      <p className="text-slate-700">
                        NOVA Group {product.nova_group} classifies this as <strong>{novaLabels[product.nova_group] || 'unknown processing level'}</strong>.{product.nova_group === 4 ? ' Consider less processed alternatives.' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          <AdSlot id="3741591457" />

          {/* AI Analysis */}
          <section className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-lg font-bold mb-2 text-green-900">Allergen Summary</h2>
            <p className="text-slate-700 text-sm leading-relaxed">{analysis}</p>
            <FreshnessTag source="Open Food Facts" />
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

          <RelatedEntities
            entityName={product.name}
            items={related.map(r => ({
              name: r.name,
              href: `/product/${r.slug}/`,
              stat: r.nutriscore ? `Score ${r.nutriscore.toUpperCase()}` : undefined,
            }))}
            heading={`Similar to ${product.name}`}
            statLabel="Nutri-Score"
          />

          {/* FAQ */}
          <FAQ items={faqItems} />

          <DidYouKnow fact="The average packaged food product contains 5-7 ingredients that may trigger allergic reactions. Reading ingredient labels carefully can help identify hidden allergens like casein (milk), lecithin (soy), or modified food starch (wheat)." />

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

          {/* DecisionNext — 3 opinionated next steps */}
          <DecisionNext
            cards={[
              ...(related.length > 0
                ? [
                    {
                      title: `${product.name} vs ${related[0].name}`,
                      blurb: `See allergen, diet, and nutritional differences side-by-side with the closest similar product.`,
                      href: primaryCompareSlug ? `/compare/${primaryCompareSlug}/` : "/compare/",
                      cta: `Open comparison`,
                      tone: "emerald" as const,
                    },
                  ]
                : []).filter(() => canShowPrimaryCompare),
              ...(product.brand
                ? [
                    {
                      title: `More from ${product.brand}`,
                      blurb: `Browse other products in our database from ${product.brand} \u2014 useful for comparing ingredient patterns across a brand.`,
                      href: `/brand/${product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`,
                      cta: `See brand`,
                      tone: "indigo" as const,
                    },
                  ]
                : []),
              {
                title: `Allergen-free alternatives`,
                blurb: `Find products confirmed free of your allergen using our dedicated allergen filters.`,
                href: `/allergen/gluten/`,
                cta: `Browse by allergen`,
                tone: "amber" as const,
              },
            ].slice(0, 3)}
          />

          <DataFeedback />

          <div className="flex gap-4 items-center flex-wrap">
            <EmbedButton
              url={`${SITE_URL}/product/${slug}/`}
              title={`${product.name} allergen info`}
            />
          </div>

          <FeedbackButton pageId={slug} />

          <DataSourceBadge sources={[
            {
              name: "Open Food Facts",
              url: product.barcode
                ? `https://world.openfoodfacts.org/product/${product.barcode}`
                : "https://world.openfoodfacts.org",
            },
            { name: "USDA FoodData Central", url: "https://fdc.nal.usda.gov/" },
            { name: "FDA Allergen Labeling", url: "https://www.fda.gov/food/food-labeling-nutrition/food-allergies" },
            { name: "Nutri-Score", url: "https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score" },
            { name: "NOVA Classification", url: "https://world.openfoodfacts.org/nova" },
          ]} />

          <CrossSiteLinks current="IngredIPeek" />

          <AuthorBox />
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
                    {product.countries.split(",").join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Diet Status</p>
              <div className="space-y-1">
                {DIET_LIST.map((diet) => {
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

      {/* Related Products with compare links */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Compare with Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {related.map((p) => (
              <div key={p.barcode} className="border border-slate-200 rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all">
                <a href={`/product/${p.slug}/`} className="group">
                  {p.image_url && (
                    <div className="w-full h-20 mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-contain" loading="lazy" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-green-700">{p.name}</p>
                </a>
                {p.brand && <p className="text-xs text-slate-500">{p.brand}</p>}
                {p.slug && STATIC_COMPARISON_SET.has(toCanonicalComparisonSlug(slug, p.slug)) && (
                  <a
                    href={`/compare/${toCanonicalComparisonSlug(slug, p.slug)}/`}
                    className="text-xs text-green-600 hover:underline mt-1 block"
                  >
                    Compare →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Discover More Comparisons */}
      {randomProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Discover More Comparisons</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {randomProducts.map((p) => {
              const pair = [slug, p.slug!].sort();
              const compareSlug = `${pair[0]}-vs-${pair[1]}`;
              return (
                <a
                  key={p.barcode}
                  href={`/compare/${compareSlug}/`}
                  className="block border border-slate-200 rounded-lg p-3 hover:border-green-300 hover:shadow-sm transition-all text-sm"
                >
                  <span className="font-medium text-green-700">{product.name}</span>
                  <span className="text-slate-400 mx-1">vs</span>
                  <span className="font-medium text-slate-700">{p.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
