import type { Metadata } from "next";
import { searchProducts } from "@/lib/db";
import { AllergenBadge } from "@/components/AllergenBadge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return { title: "Search Products", alternates: { canonical: "/search/" } };
  return {
    title: `"${q}" - Allergen Search Results`,
    description: `Search results for "${q}". Check allergens, ingredients, and dietary compatibility.`,
    alternates: { canonical: "/search/" },
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query ? searchProducts(query, 30) : [];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Search" },
        ]}
      />

      <section className="mb-8">
        <h1 className="text-2xl font-bold mb-4">
          {query ? `Search: "${query}"` : "Search Products"}
        </h1>
        <form action="/search" method="GET" className="flex gap-2 max-w-lg">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by product name or brand..."
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {query && (
        <section>
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-lg">No products found for &quot;{query}&quot;</p>
              <p className="text-sm mt-2">Try a different search term or browse by diet category.</p>
              <div className="flex justify-center gap-3 mt-4 flex-wrap">
                <a href="/allergen/gluten-free" className="text-green-700 hover:underline text-sm">Gluten-Free</a>
                <a href="/allergen/vegan" className="text-green-700 hover:underline text-sm">Vegan</a>
                <a href="/allergen/halal" className="text-green-700 hover:underline text-sm">Halal</a>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-5">
                Found {results.length} product{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              <div className="space-y-3">
                {results.map((product) => (
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
                      {product.brand && (
                        <p className="text-xs text-slate-500 mt-0.5">{product.brand}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.allergen_gluten === 1 && (
                          <AllergenBadge name="Gluten" contains={true} size="sm" />
                        )}
                        {product.allergen_milk === 1 && (
                          <AllergenBadge name="Dairy" contains={true} size="sm" />
                        )}
                        {product.allergen_nuts === 1 && (
                          <AllergenBadge name="Tree Nuts" contains={true} size="sm" />
                        )}
                        {product.allergen_peanuts === 1 && (
                          <AllergenBadge name="Peanuts" contains={true} size="sm" />
                        )}
                        {product.is_gluten_free === 1 && (
                          <AllergenBadge name="Gluten" contains={false} size="sm" />
                        )}
                        {product.is_vegan === 1 && (
                          <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                            🌱 Vegan
                          </span>
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
            </>
          )}
        </section>
      )}

      <AdSlot id="3741591457" />
    </>
  );
}
