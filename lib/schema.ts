import type { Product } from "./db";
import { DB_UPDATED, PUBLISHER, EDITORIAL_TEAM } from './authorship';

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

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Is ${product.name} Gluten Free, Vegan, Halal? Allergen Info`,
    description: `Check allergens, ingredients and dietary information for ${product.name}${product.brand ? ` by ${product.brand}` : ""}. Contains ${containsAllergens.length} of 8 major allergens.`,
    url: `${SITE_URL}/product/${product.slug}/`,
    ...(product.image_url ? { image: product.image_url } : {}),
    datePublished: DB_UPDATED,
    dateModified: DB_UPDATED,
    author: { "@type": "Organization", name: "IngrediPeek", url: SITE_URL },
    publisher: { "@type": "Organization", name: "IngrediPeek", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/product/${product.slug}/`,
  };
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

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: 'IngrediPeek', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'IngrediPeek', url: SITE_URL },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}
