import type { Product } from "./db";
import {
  DB_UPDATED,
  ENTITY_VINTAGE,
  ALLERGEN_VINTAGE,
  PUBLISHER,
  EDITORIAL_TEAM,
  SOURCE_AUTHORITIES,
} from './authorship';

const sourceOrgs = SOURCE_AUTHORITIES.map(s => ({ '@type': 'Organization', name: s.name, url: s.url }));
const sourceUrls = SOURCE_AUTHORITIES.map(s => s.url);

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
    datePublished: ENTITY_VINTAGE,
    dateModified: ENTITY_VINTAGE,
    author: { "@type": "Organization", name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { "@type": "Organization", name: PUBLISHER.name, url: PUBLISHER.url },
    reviewedBy: sourceOrgs,
    isBasedOn: sourceUrls,
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
    dateModified: ALLERGEN_VINTAGE,
    author: { "@type": "Organization", name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { "@type": "Organization", name: PUBLISHER.name, url: PUBLISHER.url },
    reviewedBy: sourceOrgs,
    isBasedOn: sourceUrls,
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
    author: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    reviewedBy: sourceOrgs,
    isBasedOn: sourceUrls,
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}
