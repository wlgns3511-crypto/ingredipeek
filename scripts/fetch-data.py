#!/usr/bin/env python3
"""Fetch food products from Open Food Facts API and build SQLite DB"""

import json
import os
import sqlite3
import time

import requests

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/foods.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Categories to fetch - high search volume + allergen relevant
CATEGORIES = [
    "en:chocolates",
    "en:biscuits",
    "en:chips",
    "en:cereals",
    "en:yogurts",
    "en:cheeses",
    "en:breads",
    "en:ice-creams",
    "en:sodas",
    "en:juices",
    "en:candies",
    "en:sauces",
    "en:snacks",
    "en:frozen-foods",
    "en:pastas",
    "en:soups",
    "en:baby-foods",
    "en:plant-based-foods",
    "en:gluten-free-foods",
    "en:organic-foods",
    "en:energy-drinks",
    "en:protein-bars",
    "en:nut-butters",
    "en:milks",
    "en:beers",
    "en:wines",
    "en:coffees",
    "en:teas",
    "en:instant-noodles",
    "en:korean-foods",
    "en:japanese-foods",
    "en:mexican-foods",
    "en:indian-foods",
    "en:condiments",
    "en:spreads",
    "en:canned-foods",
    "en:dried-fruits",
    "en:nuts",
    "en:seeds",
    "en:meal-replacements",
    "en:salad-dressings",
]

FIELDS = "code,product_name,brands,categories_tags,allergens_tags,labels_tags,ingredients_text,nutriments,nutriscore_grade,nova_group,image_front_small_url,countries_tags"
PAGE_SIZE = 100
MAX_PAGES_PER_CAT = 5  # 500 products per category max


def create_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            barcode TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            brand TEXT,
            slug TEXT UNIQUE,
            categories TEXT,
            allergens TEXT,
            labels TEXT,
            ingredients_text TEXT,
            calories REAL,
            fat REAL,
            saturated_fat REAL,
            carbs REAL,
            sugars REAL,
            protein REAL,
            salt REAL,
            fiber REAL,
            nutriscore TEXT,
            nova_group INTEGER,
            is_vegan INTEGER DEFAULT 0,
            is_vegetarian INTEGER DEFAULT 0,
            is_gluten_free INTEGER DEFAULT 0,
            is_halal INTEGER DEFAULT 0,
            is_organic INTEGER DEFAULT 0,
            is_lactose_free INTEGER DEFAULT 0,
            image_url TEXT,
            countries TEXT
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_slug ON products(slug)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_vegan ON products(is_vegan)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_gluten_free ON products(is_gluten_free)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_halal ON products(is_halal)")
    conn.commit()
    return conn


def make_slug(name: str, barcode: str) -> str:
    import re
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower().strip())
    slug = slug.strip("-")[:80]
    if not slug:
        slug = barcode
    return f"{slug}-{barcode[-6:]}"


def parse_product(p: dict) -> dict | None:
    name = p.get("product_name", "").strip()
    if not name or len(name) < 3:
        return None

    barcode = p.get("code", "")
    if not barcode:
        return None

    labels = p.get("labels_tags", [])
    labels_str = ",".join(labels) if labels else ""
    allergens = p.get("allergens_tags", [])
    allergens_str = ",".join(allergens) if allergens else ""
    categories = p.get("categories_tags", [])
    categories_str = ",".join(categories[:5]) if categories else ""

    n = p.get("nutriments", {})

    return {
        "barcode": barcode,
        "name": name,
        "brand": p.get("brands", ""),
        "slug": make_slug(name, barcode),
        "categories": categories_str,
        "allergens": allergens_str,
        "labels": labels_str,
        "ingredients_text": p.get("ingredients_text", ""),
        "calories": n.get("energy-kcal_100g"),
        "fat": n.get("fat_100g"),
        "saturated_fat": n.get("saturated-fat_100g"),
        "carbs": n.get("carbohydrates_100g"),
        "sugars": n.get("sugars_100g"),
        "protein": n.get("proteins_100g"),
        "salt": n.get("salt_100g"),
        "fiber": n.get("fiber_100g"),
        "nutriscore": p.get("nutriscore_grade"),
        "nova_group": p.get("nova_group"),
        "is_vegan": 1 if "en:vegan" in labels else 0,
        "is_vegetarian": 1 if "en:vegetarian" in labels else 0,
        "is_gluten_free": 1 if any("gluten-free" in l for l in labels) else 0,
        "is_halal": 1 if "en:halal" in labels else 0,
        "is_organic": 1 if any("organic" in l for l in labels) else 0,
        "is_lactose_free": 1 if any("lactose-free" in l for l in labels) else 0,
        "image_url": p.get("image_front_small_url", ""),
        "countries": ",".join(p.get("countries_tags", [])[:3]),
    }


def fetch_category(category: str, conn: sqlite3.Connection) -> int:
    count = 0
    for page in range(1, MAX_PAGES_PER_CAT + 1):
        url = f"https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0={category}&fields={FIELDS}&page_size={PAGE_SIZE}&page={page}&json=1"

        try:
            resp = requests.get(url, timeout=30, headers={"User-Agent": "IngrediPeek/1.0 (jihoon@ingredipeek.com)"})
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"    ⚠️ Page {page} error: {e}")
            break

        products = data.get("products", [])
        if not products:
            break

        for p in products:
            parsed = parse_product(p)
            if not parsed:
                continue
            try:
                conn.execute(
                    """INSERT OR IGNORE INTO products VALUES (
                        :barcode,:name,:brand,:slug,:categories,:allergens,:labels,
                        :ingredients_text,:calories,:fat,:saturated_fat,:carbs,:sugars,
                        :protein,:salt,:fiber,:nutriscore,:nova_group,
                        :is_vegan,:is_vegetarian,:is_gluten_free,:is_halal,:is_organic,
                        :is_lactose_free,:image_url,:countries
                    )""",
                    parsed,
                )
                count += 1
            except Exception:
                pass

        conn.commit()
        time.sleep(0.5)  # Rate limit

    return count


def main():
    conn = create_db()
    total = 0

    print(f"📦 Fetching from {len(CATEGORIES)} categories...\n")

    for i, cat in enumerate(CATEGORIES, 1):
        short = cat.replace("en:", "")
        print(f"  [{i}/{len(CATEGORIES)}] {short}...", end=" ", flush=True)
        count = fetch_category(cat, conn)
        total += count
        print(f"✅ +{count} (total: {total})")

    # Summary
    final = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    vegan = conn.execute("SELECT COUNT(*) FROM products WHERE is_vegan=1").fetchone()[0]
    gf = conn.execute("SELECT COUNT(*) FROM products WHERE is_gluten_free=1").fetchone()[0]
    halal = conn.execute("SELECT COUNT(*) FROM products WHERE is_halal=1").fetchone()[0]

    print(f"\n🎉 Done! Total products: {final}")
    print(f"   Vegan: {vegan}, Gluten-free: {gf}, Halal: {halal}")

    conn.close()


if __name__ == "__main__":
    main()
