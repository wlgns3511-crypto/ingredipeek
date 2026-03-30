import type { Product } from "./db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

export function productJsonLd(product: Product) {
  const containsAllergens: string[] = [];
  if (product.allergen_milk === 1) containsAllergens.push("Milk");
  if (product.allergen_gluten === 1) containsAllergens.push("Gluten");
  if (product.allergen_nuts === 1) containsAllergens.push("Tree Nuts");
  if (product.allergen_soy === 1) containsAllergens.push("Soy");
  if (product.allergen_eggs === 1) containsAllergens.push("Eggs");
  if (product.allergen_fish === 1) containsAllergens.push("Fish");
  if (product.allergen_shellfish === 1) containsAllergens.push("Shellfish");
  if (product.allergen_peanuts === 1) containsAllergens.push("Peanuts");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `Check allergens, ingredients and dietary information for ${product.name}${product.brand ? ` by ${product.brand}` : ""}.`,
    url: `${SITE_URL}/product/${product.slug}/`,
    ...(product.image_url ? { image: product.image_url } : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    ...(product.barcode
      ? { gtin: product.barcode }
      : {}),
    dateModified: "2026-03-31",
    author: { "@type": "Organization", name: "DataPeek" },
  };

  // Nutrition
  if (
    product.calories != null ||
    product.protein != null ||
    product.fat != null ||
    product.carbs != null
  ) {
    schema.nutrition = {
      "@type": "NutritionInformation",
      ...(product.calories != null
        ? { calories: `${product.calories} kcal` }
        : {}),
      ...(product.protein != null
        ? { proteinContent: `${product.protein} g` }
        : {}),
      ...(product.fat != null ? { fatContent: `${product.fat} g` } : {}),
      ...(product.saturated_fat != null
        ? { saturatedFatContent: `${product.saturated_fat} g` }
        : {}),
      ...(product.carbs != null
        ? { carbohydrateContent: `${product.carbs} g` }
        : {}),
      ...(product.sugars != null
        ? { sugarContent: `${product.sugars} g` }
        : {}),
      ...(product.fiber != null
        ? { fiberContent: `${product.fiber} g` }
        : {}),
      ...(product.salt != null
        ? { sodiumContent: `${product.salt} g` }
        : {}),
    };
  }

  if (containsAllergens.length > 0) {
    schema.additionalProperty = containsAllergens.map((a) => ({
      "@type": "PropertyValue",
      name: "allergen",
      value: a,
    }));
  }

  return schema;
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function allergenPageJsonLd(
  type: string,
  count: number,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${type} Foods - IngrediPeek`,
    description,
    url: `${SITE_URL}/allergen/${type}/`,
    numberOfItems: count,
  };
}
