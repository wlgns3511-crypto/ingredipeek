import { getRecentProducts, getAllBrands } from "@/lib/db";
import { AdSlot } from "@/components/AdSlot";
import { AllergenChecker } from "@/components/AllergenChecker";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" },
  openGraph: { url: "/" },
};


const CATEGORIES = [
  {
    label: "Gluten-Free",
    href: "/allergen/gluten-free",
    icon: "🌾",
    desc: "Safe for celiac & gluten sensitivity",
    color: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
    textColor: "text-yellow-800",
  },
  {
    label: "Vegan",
    href: "/allergen/vegan",
    icon: "🌱",
    desc: "100% plant-based certified",
    color: "border-green-200 bg-green-50 hover:bg-green-100",
    textColor: "text-green-800",
  },
  {
    label: "Halal",
    href: "/allergen/halal",
    icon: "☪️",
    desc: "Halal certified products",
    color: "border-teal-200 bg-teal-50 hover:bg-teal-100",
    textColor: "text-teal-800",
  },
  {
    label: "Nut-Free",
    href: "/allergen/nut-free",
    icon: "🥜",
    desc: "No nuts or peanuts",
    color: "border-orange-200 bg-orange-50 hover:bg-orange-100",
    textColor: "text-orange-800",
  },
  {
    label: "Dairy-Free",
    href: "/allergen/dairy-free",
    icon: "🥛",
    desc: "No milk or dairy ingredients",
    color: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    label: "Organic",
    href: "/allergen/organic",
    icon: "♻️",
    desc: "Certified organic foods",
    color: "border-lime-200 bg-lime-50 hover:bg-lime-100",
    textColor: "text-lime-800",
  },
];

export default function Home() {
  const recent = getRecentProducts(12);
  const topBrands = getAllBrands(20);

  return (
    <div>
      {/* Hero / Search */}
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm text-green-700 font-medium mb-4">
          <span>🌿</span> Trusted Allergen Reference
        </div>
        <h1 className="text-4xl font-bold mb-4 text-slate-900">
          Food Allergen &amp; Ingredient Checker
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Instantly check if any food product is gluten-free, vegan, halal, nut-free, or dairy-free.
          Verified allergen data for thousands of products.
        </p>
        <form action="/search" method="GET" className="max-w-xl mx-auto flex gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search by product name or brand..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {/* Diet Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-2">Browse by Diet</h2>
        <p className="text-slate-500 text-sm mb-5">
          Find products that match your dietary needs and restrictions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.href}
              href={cat.href}
              className={`border rounded-xl p-4 transition-colors ${cat.color}`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className={`font-semibold ${cat.textColor}`}>{cat.label}</div>
              <div className="text-xs text-slate-500 mt-1">{cat.desc}</div>
            </a>
          ))}
        </div>
      </section>

      <AllergenChecker />

      <AdSlot id="3741591457" />

      {/* How it works */}
      <section className="mb-12 bg-green-50 border border-green-100 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 text-green-900">How IngrediPeek Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-medium text-slate-800">Search any product</p>
              <p className="text-slate-600">Enter a product name, brand, or barcode to find detailed allergen information.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-medium text-slate-800">Check allergens instantly</p>
              <p className="text-slate-600">See clear red/green badges for all 8 major allergens at a glance.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-medium text-slate-800">Eat with confidence</p>
              <p className="text-slate-600">Review full ingredients, nutrition facts, and diet compatibility in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Products */}
      {recent.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Recently Added Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.map((product) => (
              <a
                key={product.barcode}
                href={`/product/${product.slug}/`}
                className="border border-slate-200 rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all group"
              >
                {product.image_url && (
                  <div className="w-full h-24 mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-green-700">
                  {product.name}
                </p>
                {product.brand && (
                  <p className="text-xs text-slate-500 mt-0.5">{product.brand}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.is_gluten_free === 1 && (
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5">GF</span>
                  )}
                  {product.is_vegan === 1 && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">Vegan</span>
                  )}
                  {product.is_halal === 1 && (
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5">Halal</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Top Brands */}
      {topBrands.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Browse by Brand</h2>
          <div className="flex flex-wrap gap-2">
            {topBrands.map((b) => (
              <a
                key={b.brand}
                href={`/brand/${b.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                {b.brand}
                <span className="ml-1.5 text-xs text-slate-400">({b.count})</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* High-CPC CTA */}
      <section className="mb-12 bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Managing food allergies?</h2>
        <p className="text-green-100 mb-4 text-sm">
          Need allergy-safe meal plans? Compare food delivery services that cater to dietary restrictions.
        </p>
        <a
          href="https://caloriewize.com"
          className="inline-block bg-white text-green-800 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Compare Allergy-Safe Meal Delivery →
        </a>
      </section>

      <AdSlot id="9876543210" />
    </div>
  );
}
