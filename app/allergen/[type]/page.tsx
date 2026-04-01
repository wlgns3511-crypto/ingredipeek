import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGlutenFreeProducts,
  getVeganProducts,
  getHalalProducts,
  getNutFreeProducts,
  getDairyFreeProducts,
  getOrganicProducts,
  getVegetarianProducts,
  countProductsByType,
} from "@/lib/db";
import type { Product } from "@/lib/db";
import { AllergenBadge } from "@/components/AllergenBadge";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumb } from "@/components/Breadcrumb";
import { allergenPageJsonLd } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

const ALLERGEN_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    icon: string;
    metaDesc: string;
    getFn: (limit: number, offset: number) => Product[];
    longDesc: string;
  }
> = {
  "gluten-free": {
    title: "Gluten-Free Foods",
    icon: "🌾",
    description: "Products certified or labeled gluten-free, safe for celiac disease and gluten sensitivity.",
    metaDesc: "Browse gluten-free certified food products. Safe for celiac disease and gluten sensitivity. Full allergen and ingredient info.",
    getFn: getGlutenFreeProducts,
    longDesc: "Gluten is a protein found in wheat, barley, rye, and triticale. People with celiac disease, non-celiac gluten sensitivity, or wheat allergies must strictly avoid gluten. These products are labeled or certified as gluten-free, meaning they contain less than 20 parts per million (ppm) of gluten as per FDA standards.",
  },
  vegan: {
    title: "Vegan Foods",
    icon: "🌱",
    description: "100% plant-based products with no animal-derived ingredients.",
    metaDesc: "Browse certified vegan food products. No animal ingredients, dairy, eggs, or honey. Full ingredient lists and allergen info.",
    getFn: getVeganProducts,
    longDesc: "Vegan products contain no animal-derived ingredients including meat, poultry, seafood, dairy, eggs, honey, gelatin, and other animal byproducts. These products are labeled or certified as vegan by manufacturers or certification bodies.",
  },
  halal: {
    title: "Halal Foods",
    icon: "☪️",
    description: "Halal certified food products conforming to Islamic dietary laws.",
    metaDesc: "Browse halal certified food products. Verified halal ingredients and preparation methods. Full allergen and ingredient info.",
    getFn: getHalalProducts,
    longDesc: "Halal foods are those permissible under Islamic dietary law. Halal certification ensures that products do not contain pork or pork by-products, alcohol, or other forbidden ingredients, and that proper slaughter and preparation methods have been followed.",
  },
  "nut-free": {
    title: "Nut-Free Foods",
    icon: "🥜",
    description: "Products confirmed free from tree nuts and peanuts.",
    metaDesc: "Browse nut-free food products with no tree nuts or peanuts. Safe for nut allergies. Full allergen and ingredient info.",
    getFn: getNutFreeProducts,
    longDesc: "Tree nut and peanut allergies are among the most common and potentially severe food allergies. These products have been identified as containing no tree nuts (such as almonds, cashews, walnuts, pecans) and no peanuts. Always check labels for 'may contain' cross-contamination warnings.",
  },
  "dairy-free": {
    title: "Dairy-Free Foods",
    icon: "🥛",
    description: "Products with no milk, cheese, butter, or other dairy ingredients.",
    metaDesc: "Browse dairy-free food products. No milk, lactose, or dairy derivatives. Safe for lactose intolerance and dairy allergies.",
    getFn: getDairyFreeProducts,
    longDesc: "Dairy-free products contain no milk or milk derivatives including cheese, butter, cream, yogurt, casein, whey, or lactose. These products are suitable for people with dairy allergies, lactose intolerance, or those following a vegan diet.",
  },
  organic: {
    title: "Organic Foods",
    icon: "♻️",
    description: "Certified organic products grown without synthetic pesticides or fertilizers.",
    metaDesc: "Browse certified organic food products. No synthetic pesticides or GMOs. Full ingredient lists and nutrition info.",
    getFn: getOrganicProducts,
    longDesc: "Organic certification means crops were grown without synthetic pesticides, herbicides, or fertilizers, and without genetically modified organisms (GMOs). Organic livestock products come from animals raised without antibiotics or growth hormones.",
  },
  vegetarian: {
    title: "Vegetarian Foods",
    icon: "🥦",
    description: "Vegetarian products with no meat, poultry, or seafood.",
    metaDesc: "Browse vegetarian food products. No meat, poultry, or fish. May include dairy and eggs. Full allergen and ingredient info.",
    getFn: getVegetarianProducts,
    longDesc: "Vegetarian products contain no meat, poultry, or seafood. Unlike vegan products, vegetarian foods may still contain dairy products and eggs. These products are labeled or certified as suitable for vegetarians.",
  },
};

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return Object.keys(ALLERGEN_CONFIG).map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const config = ALLERGEN_CONFIG[type];
  if (!config) return { title: "Not Found" };

  return {
    title: `${config.title} - Complete List`,
    description: config.metaDesc,
    alternates: { canonical: `${SITE_URL}/allergen/${type}/` },
    openGraph: {
      title: `${config.title} | IngrediPeek`,
      description: config.metaDesc,
      url: `${SITE_URL}/allergen/${type}/`,
    },
  };
}

export default async function AllergenPage({ params }: Props) {
  const { type } = await params;
  const config = ALLERGEN_CONFIG[type];
  if (!config) notFound();

  const products = config.getFn(60, 0);
  const total = countProductsByType(type);

  const pageSchema = allergenPageJsonLd(config.title, total, config.metaDesc);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Diet Categories", href: "/" },
          { label: config.title },
        ]}
      />

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{config.icon}</span>
          <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
        </div>
        <p className="text-lg text-slate-600 mb-3">{config.description}</p>
        {total > 0 && (
          <p className="text-sm text-green-700 font-medium">
            {total.toLocaleString()} products found
          </p>
        )}
      </section>

      {/* Long description for SEO */}
      <section className="mb-8 bg-green-50 border border-green-100 rounded-xl p-5">
        <p className="text-sm text-slate-700 leading-relaxed">{config.longDesc}</p>
        <p className="text-xs text-slate-500 mt-3">
          <strong>Important:</strong> Always verify allergen information on product packaging, as formulations can change.
          Data sourced from Open Food Facts.
        </p>
      </section>

      <AdSlot id="3741591457" />

      {/* Other diet categories */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
          Browse Other Diets
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ALLERGEN_CONFIG)
            .filter(([key]) => key !== type)
            .map(([key, conf]) => (
              <a
                key={key}
                href={`/allergen/${key}/`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-full hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                <span>{conf.icon}</span>
                {conf.title.replace(" Foods", "")}
              </a>
            ))}
        </div>
      </section>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">No products found in this category yet.</p>
          <p className="text-sm mt-2">Check back as we continue adding more products.</p>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-bold mb-5">
            {config.title} Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <a
                key={product.barcode}
                href={`/product/${product.slug}/`}
                className="border border-slate-200 rounded-xl p-4 hover:border-green-300 hover:shadow-sm transition-all group flex gap-3"
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
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-green-700">
                    {product.name}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-slate-500 mt-0.5">{product.brand}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.allergen_gluten === 0 && (
                      <AllergenBadge name="Gluten" contains={false} size="sm" />
                    )}
                    {product.allergen_milk === 0 && (
                      <AllergenBadge name="Dairy" contains={false} size="sm" />
                    )}
                    {product.allergen_nuts === 0 && product.allergen_peanuts === 0 && (
                      <AllergenBadge name="Nuts" contains={false} size="sm" />
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {total > 60 && (
            <p className="text-center mt-8 text-sm text-slate-500">
              Showing 60 of {total.toLocaleString()} {config.title.toLowerCase()} products.
            </p>
          )}
        </section>
      )}

      {/* High-CPC CTA */}
      <section className="mt-12 bg-gradient-to-r from-green-700 to-emerald-800 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Need {config.title.replace(" Foods", "")} meal delivery?</h2>
        <p className="text-green-100 text-sm mb-4">
          Compare food delivery services that specialize in {config.title.toLowerCase()} meal plans.
        </p>
        <a
          href="https://caloriewize.com"
          className="inline-block bg-white text-green-800 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Compare Specialty Meal Delivery →
        </a>
      </section>

      <AdSlot id="9876543210" />
    </>
  );
}
