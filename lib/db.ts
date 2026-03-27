import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "foods.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

// --- Types ---

export interface Product {
  barcode: string;
  name: string;
  brand: string | null;
  slug: string | null;
  categories: string | null;
  allergens: string | null;
  labels: string | null;
  ingredients_text: string | null;
  calories: number | null;
  fat: number | null;
  saturated_fat: number | null;
  carbs: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
  fiber: number | null;
  nutriscore: string | null;
  nova_group: number | null;
  is_vegan: number | null;
  is_vegetarian: number | null;
  is_gluten_free: number | null;
  is_halal: number | null;
  is_organic: number | null;
  is_lactose_free: number | null;
  is_dairy_free: number | null;
  is_nut_free: number | null;
  allergen_milk: number | null;
  allergen_gluten: number | null;
  allergen_nuts: number | null;
  allergen_soy: number | null;
  allergen_eggs: number | null;
  allergen_fish: number | null;
  allergen_shellfish: number | null;
  allergen_peanuts: number | null;
  image_url: string | null;
  countries: string | null;
}

// --- Product queries ---

export function getProductBySlug(slug: string): Product | undefined {
  return getDb()
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug) as Product | undefined;
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return getDb()
    .prepare("SELECT * FROM products WHERE barcode = ?")
    .get(barcode) as Product | undefined;
}

export function getAllProductSlugs(limit = 5000): { slug: string }[] {
  return getDb()
    .prepare(
      "SELECT slug FROM products WHERE slug IS NOT NULL ORDER BY name LIMIT ?"
    )
    .all(limit) as { slug: string }[];
}

export function getRecentProducts(limit = 12): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE slug IS NOT NULL AND name IS NOT NULL ORDER BY rowid DESC LIMIT ?"
    )
    .all(limit) as Product[];
}

export function searchProducts(query: string, limit = 20): Product[] {
  const q = `%${query}%`;
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE (name LIKE ? OR brand LIKE ?) AND slug IS NOT NULL LIMIT ?"
    )
    .all(q, q, limit) as Product[];
}

// --- Diet/Allergen filtered queries ---

export function getGlutenFreeProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_gluten_free = 1 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function getVeganProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_vegan = 1 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function getHalalProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_halal = 1 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function getNutFreeProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_nut_free = 1 AND allergen_nuts = 0 AND allergen_peanuts = 0 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function getDairyFreeProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_dairy_free = 1 AND allergen_milk = 0 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function getOrganicProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_organic = 1 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function getVegetarianProducts(limit = 50, offset = 0): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE is_vegetarian = 1 AND slug IS NOT NULL ORDER BY name LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as Product[];
}

export function countProductsByType(type: string): number {
  const columnMap: Record<string, string> = {
    "gluten-free": "is_gluten_free = 1",
    vegan: "is_vegan = 1",
    halal: "is_halal = 1",
    "nut-free": "is_nut_free = 1 AND allergen_nuts = 0 AND allergen_peanuts = 0",
    "dairy-free": "is_dairy_free = 1 AND allergen_milk = 0",
    organic: "is_organic = 1",
    vegetarian: "is_vegetarian = 1",
  };
  const condition = columnMap[type];
  if (!condition) return 0;
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as c FROM products WHERE ${condition} AND slug IS NOT NULL`
    )
    .get() as { c: number };
  return row.c;
}

// --- Brand queries ---

export function getProductsByBrand(brand: string, limit = 50): Product[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE brand = ? AND slug IS NOT NULL ORDER BY name LIMIT ?"
    )
    .all(brand, limit) as Product[];
}

export function getAllBrands(limit = 500): { brand: string; count: number }[] {
  return getDb()
    .prepare(
      "SELECT brand, COUNT(*) as count FROM products WHERE brand IS NOT NULL AND brand != '' GROUP BY brand ORDER BY count DESC LIMIT ?"
    )
    .all(limit) as { brand: string; count: number }[];
}

export function getBrandSlug(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getProductsByBrandSlug(brandSlug: string, limit = 50): Product[] {
  // Get all brands and find matching slug
  const brands = getAllBrands(1000);
  const matched = brands.find((b) => getBrandSlug(b.brand) === brandSlug);
  if (!matched) return [];
  return getProductsByBrand(matched.brand, limit);
}

export function getBrandBySlug(brandSlug: string): string | undefined {
  const brands = getAllBrands(1000);
  const matched = brands.find((b) => getBrandSlug(b.brand) === brandSlug);
  return matched?.brand;
}

// --- Sitemap helpers ---

export function getAllProductSlugsForSitemap(limit = 50000): { slug: string }[] {
  return getDb()
    .prepare(
      "SELECT slug FROM products WHERE slug IS NOT NULL ORDER BY name LIMIT ?"
    )
    .all(limit) as { slug: string }[];
}

export function countAllProducts(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as c FROM products WHERE slug IS NOT NULL")
    .get() as { c: number };
  return row.c;
}

export function getRelatedProducts(categories: string | null, excludeSlug: string, limit = 6): Product[] {
  if (!categories) {
    return getDb()
      .prepare(
        "SELECT * FROM products WHERE slug IS NOT NULL AND slug != ? ORDER BY RANDOM() LIMIT ?"
      )
      .all(excludeSlug, limit) as Product[];
  }
  const firstCat = categories.split(",")[0]?.trim();
  if (!firstCat) return [];
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE categories LIKE ? AND slug IS NOT NULL AND slug != ? LIMIT ?"
    )
    .all(`%${firstCat}%`, excludeSlug, limit) as Product[];
}
