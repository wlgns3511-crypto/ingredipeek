import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductsByBrandSlug, getBrandBySlug, getAllBrands, getBrandSlug } from "@/lib/db";
import { AllergenBadge } from "@/components/AllergenBadge";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumb } from "@/components/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const brands = getAllBrands(1000);
  return brands.map((b) => ({ slug: getBrandSlug(b.brand) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: "Brand Not Found" };

  const title = `${brand} Allergen Information - All Products`;
  const description = `Browse all ${brand} products and check allergen information, ingredients, and dietary compatibility for gluten-free, vegan, halal, and more.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/brand/${slug}/` },
    openGraph: {
      title: `${brand} Products | IngrediPeek`,
      description,
      url: `${SITE_URL}/brand/${slug}/`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const products = getProductsByBrandSlug(slug, 100);

  // Count diet stats
  const veganCount = products.filter((p) => p.is_vegan === 1).length;
  const glutenFreeCount = products.filter((p) => p.is_gluten_free === 1).length;
  const halalCount = products.filter((p) => p.is_halal === 1).length;
  const dairyFreeCount = products.filter((p) => p.is_dairy_free === 1 || p.allergen_milk === 0).length;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Brands" },
          { label: brand },
        ]}
      />

      <section className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {brand} Allergen Information
        </h1>
        <p className="text-slate-600">
          Browse all {brand} products and check allergens, ingredients, and dietary compatibility.
        </p>
      </section>

      {/* Stats */}
      {products.length > 0 && (
        <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{products.length}</div>
            <div className="text-xs text-slate-500 mt-1">Total Products</div>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{glutenFreeCount}</div>
            <div className="text-xs text-slate-500 mt-1">Gluten-Free</div>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{veganCount}</div>
            <div className="text-xs text-slate-500 mt-1">Vegan</div>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{halalCount}</div>
            <div className="text-xs text-slate-500 mt-1">Halal</div>
          </div>
        </section>
      )}

      <AdSlot id="3741591457" />

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No products found for this brand.</p>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-bold mb-5">All {brand} Products ({products.length})</h2>
          <div className="space-y-3">
            {products.map((product) => (
              <a
                key={product.barcode}
                href={`/product/${product.slug}/`}
                className="flex gap-4 border border-slate-200 rounded-xl p-4 hover:border-green-300 hover:shadow-sm transition-all group"
              >
                {product.image_url && (
                  <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-green-700">
                    {product.name}
                  </p>
                  {product.categories && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {product.categories.split(",").slice(0, 2).join(", ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.is_gluten_free === 1 && (
                      <AllergenBadge name="Gluten" contains={false} size="sm" />
                    )}
                    {product.is_vegan === 1 && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                        🌱 Vegan
                      </span>
                    )}
                    {product.is_halal === 1 && (
                      <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5">
                        ☪️ Halal
                      </span>
                    )}
                    {product.allergen_milk === 1 && (
                      <AllergenBadge name="Dairy" contains={true} size="sm" />
                    )}
                    {product.allergen_gluten === 1 && (
                      <AllergenBadge name="Gluten" contains={true} size="sm" />
                    )}
                    {product.allergen_nuts === 1 && (
                      <AllergenBadge name="Tree Nuts" contains={true} size="sm" />
                    )}
                  </div>
                </div>
                {product.nutriscore && (
                  <div className="flex-shrink-0 flex items-center">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm ${
                        product.nutriscore.toLowerCase() === "a"
                          ? "bg-green-600"
                          : product.nutriscore.toLowerCase() === "b"
                          ? "bg-lime-500"
                          : product.nutriscore.toLowerCase() === "c"
                          ? "bg-yellow-400"
                          : product.nutriscore.toLowerCase() === "d"
                          ? "bg-orange-500"
                          : "bg-red-600"
                      }`}
                    >
                      {product.nutriscore.toUpperCase()}
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* High-CPC CTA */}
      <section className="mt-12 bg-gradient-to-r from-green-700 to-emerald-800 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Looking for allergy-safe alternatives?</h2>
        <p className="text-green-100 text-sm mb-4">
          Compare food delivery services that specialize in allergen-free meal plans.
        </p>
        <a
          href="https://caloriewize.com"
          className="inline-block bg-white text-green-800 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Compare Allergy-Safe Meal Delivery →
        </a>
      </section>

      <AdSlot id="9876543210" />
    </>
  );
}
