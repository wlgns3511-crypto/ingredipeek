#!/usr/bin/env python3
"""Fetch food products using Open Food Facts V2 API + build SQLite DB"""

import json
import os
import re
import sqlite3
import time

import requests

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/foods.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

FIELDS = "code,product_name,brands,categories_tags,allergens_tags,labels_tags,ingredients_text,nutriments,nutriscore_grade,nova_group,image_front_small_url,countries_tags"
PAGE_SIZE = 50
TARGET = 20000  # 2만 제품 목표
HEADERS = {"User-Agent": "IngrediPeek/1.0 (contact@ingredipeek.com)"}


def create_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS products")
    conn.execute("""
        CREATE TABLE products (
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
            is_dairy_free INTEGER DEFAULT 0,
            is_nut_free INTEGER DEFAULT 0,
            allergen_milk INTEGER DEFAULT 0,
            allergen_gluten INTEGER DEFAULT 0,
            allergen_nuts INTEGER DEFAULT 0,
            allergen_soy INTEGER DEFAULT 0,
            allergen_eggs INTEGER DEFAULT 0,
            allergen_fish INTEGER DEFAULT 0,
            allergen_shellfish INTEGER DEFAULT 0,
            allergen_peanuts INTEGER DEFAULT 0,
            image_url TEXT,
            countries TEXT
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_slug ON products(slug)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_brand ON products(brand)")
    conn.commit()
    return conn


def make_slug(name: str, barcode: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower().strip())
    slug = slug.strip("-")[:80]
    if not slug:
        slug = barcode
    return f"{slug}-{barcode[-6:]}"


def parse_allergens(allergens_tags: list) -> dict:
    tags = set(t.lower() for t in allergens_tags)
    return {
        "allergen_milk": 1 if any("milk" in t or "dairy" in t for t in tags) else 0,
        "allergen_gluten": 1 if any("gluten" in t or "wheat" in t for t in tags) else 0,
        "allergen_nuts": 1 if any("nuts" in t and "peanut" not in t for t in tags) else 0,
        "allergen_soy": 1 if any("soy" in t for t in tags) else 0,
        "allergen_eggs": 1 if any("egg" in t for t in tags) else 0,
        "allergen_fish": 1 if any("fish" in t for t in tags) else 0,
        "allergen_shellfish": 1 if any("shellfish" in t or "crustacean" in t for t in tags) else 0,
        "allergen_peanuts": 1 if any("peanut" in t for t in tags) else 0,
    }


def parse_product(p: dict) -> dict | None:
    name = (p.get("product_name") or "").strip()
    if not name or len(name) < 3 or len(name) > 200:
        return None

    barcode = p.get("code", "")
    if not barcode:
        return None

    labels = p.get("labels_tags") or []
    allergens = p.get("allergens_tags") or []
    categories = p.get("categories_tags") or []
    n = p.get("nutriments") or {}
    allergen_flags = parse_allergens(allergens)

    labels_lower = set(l.lower() for l in labels)

    return {
        "barcode": barcode,
        "name": name,
        "brand": (p.get("brands") or "")[:100],
        "slug": make_slug(name, barcode),
        "categories": ",".join(categories[:5]),
        "allergens": ",".join(allergens),
        "labels": ",".join(labels[:10]),
        "ingredients_text": (p.get("ingredients_text") or "")[:2000],
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
        "is_vegan": 1 if "en:vegan" in labels_lower else 0,
        "is_vegetarian": 1 if "en:vegetarian" in labels_lower else 0,
        "is_gluten_free": 1 if any("gluten-free" in l for l in labels_lower) else 0,
        "is_halal": 1 if "en:halal" in labels_lower else 0,
        "is_organic": 1 if any("organic" in l for l in labels_lower) else 0,
        "is_lactose_free": 1 if any("lactose-free" in l for l in labels_lower) else 0,
        "is_dairy_free": 1 if any("dairy-free" in l for l in labels_lower) else 0,
        "is_nut_free": 1 if allergen_flags["allergen_nuts"] == 0 and allergen_flags["allergen_peanuts"] == 0 else 0,
        **allergen_flags,
        "image_url": p.get("image_front_small_url") or "",
        "countries": ",".join((p.get("countries_tags") or [])[:3]),
    }


def main():
    conn = create_db()
    total = 0
    page = 1
    max_pages = TARGET // PAGE_SIZE + 1
    errors = 0

    print(f"🍎 Fetching {TARGET} products from Open Food Facts V2 API...\n")

    while total < TARGET and page <= max_pages:
        url = f"https://world.openfoodfacts.org/api/v2/search?fields={FIELDS}&page_size={PAGE_SIZE}&page={page}&sort_by=popularity_key"

        try:
            resp = requests.get(url, timeout=30, headers=HEADERS)
            resp.raise_for_status()
            data = resp.json()
            errors = 0
        except Exception as e:
            errors += 1
            if errors > 5:
                print(f"\n⚠️ Too many errors, stopping at {total}")
                break
            print(f"  ⚠️ Page {page}: {e}, retrying in 5s...")
            time.sleep(5)
            continue

        products = data.get("products", [])
        if not products:
            break

        inserted = 0
        for p in products:
            parsed = parse_product(p)
            if not parsed:
                continue
            try:
                cols = list(parsed.keys())
                placeholders = ",".join(f":{c}" for c in cols)
                conn.execute(f"INSERT OR IGNORE INTO products ({','.join(cols)}) VALUES ({placeholders})", parsed)
                inserted += 1
            except Exception:
                pass

        conn.commit()
        total += inserted
        print(f"  [{page}] +{inserted} (total: {total})", flush=True)

        page += 1
        time.sleep(0.3)

    # Summary
    final = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    with_allergens = conn.execute("SELECT COUNT(*) FROM products WHERE allergens != ''").fetchone()[0]
    vegan = conn.execute("SELECT COUNT(*) FROM products WHERE is_vegan=1").fetchone()[0]
    gf = conn.execute("SELECT COUNT(*) FROM products WHERE is_gluten_free=1").fetchone()[0]

    print(f"\n🎉 Done! Total: {final} products")
    print(f"   With allergen info: {with_allergens}")
    print(f"   Vegan: {vegan}, Gluten-free: {gf}")

    conn.close()


if __name__ == "__main__":
    main()
