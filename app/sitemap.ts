import type { MetadataRoute } from "next";
import { getAllProductSlugsForSitemap, getAllBrands, getBrandSlug, getAllComparisonSlugs, getRotatingComparisonSlugs } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

const ALLERGEN_TYPES = [
  "gluten-free",
  "vegan",
  "halal",
  "nut-free",
  "dairy-free",
  "organic",
  "vegetarian",
];

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const productSlugs = getAllProductSlugsForSitemap(50000);
  const brands = getAllBrands(500);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terms/`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact/`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const allergenPages: MetadataRoute.Sitemap = ALLERGEN_TYPES.map((type) => ({
    url: `${SITE_URL}/allergen/${type}/`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/brand/${getBrandSlug(b.brand)}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = productSlugs.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // 80% stable core + 20% weekly rotation
  const stableComps = getAllComparisonSlugs(1200);
  const rotatingComps = getRotatingComparisonSlugs(300);
  const allComps = [...stableComps, ...rotatingComps];
  // Deduplicate by slug
  const seen = new Set<string>();
  const comparisonPages: MetadataRoute.Sitemap = allComps
    .filter((c) => { if (seen.has(c.slug)) return false; seen.add(c.slug); return true; })
    .map((c) => ({
      url: `${SITE_URL}/compare/${c.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const blogPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog/`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
  ];

  return [...staticPages, ...allergenPages, ...brandPages, ...productPages, ...comparisonPages, ...blogPages];
}
