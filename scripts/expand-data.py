#!/usr/bin/env python3
"""IngrediPeek: Open Food Facts에서 30만 제품 다운로드"""

import json
import os
import re
import sqlite3
import sys
import time
import requests

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/foods.db")
TARGET = 300000
BATCH_SIZE = 100
DELAY = 2

ALLERGEN_MAP = {
    "en:milk": "allergen_milk",
    "en:gluten": "allergen_gluten",
    "en:nuts": "allergen_nuts",
    "en:tree-nuts": "allergen_nuts",
    "en:soybeans": "allergen_soy",
    "en:eggs": "allergen_eggs",
    "en:fish": "allergen_fish",
    "en:shellfish": "allergen_shellfish",
    "en:crustaceans": "allergen_shellfish",
    "en:peanuts": "allergen_peanuts",
}

def slugify(text):
    if not text:
        return None
    s = text.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s-]+', '-', s)
    return s[:100] if s else None


def parse_product(p):
    name = p.get("product_name", "").strip()
    if not name or len(name) < 2:
        return None

    barcode = p.get("code", "")
    if not barcode:
        return None

    slug = slugify(name)
    if not slug:
        return None

    # Parse allergens
    allergen_tags = p.get("allergens_tags", [])
    allergen_flags = {v: 0 for v in ALLERGEN_MAP.values()}
    allergen_list = []
    for tag in allergen_tags:
        tag_lower = tag.lower()
        for key, col in ALLERGEN_MAP.items():
            if key in tag_lower:
                allergen_flags[col] = 1
                allergen_list.append(key.replace("en:", ""))

    # Parse labels for dietary flags
    labels = ",".join(p.get("labels_tags", []))

    nutri = p.get("nutriments", {})

    return {
        "barcode": barcode,
        "name": name,
        "brand": p.get("brands", ""),
        "slug": slug,
        "categories": ",".join(p.get("categories_tags", [])[:5]),
        "allergens": json.dumps(allergen_list) if allergen_list else None,
        "labels": labels,
        "ingredients_text": p.get("ingredients_text", ""),
        "calories": nutri.get("energy-kcal_100g"),
        "fat": nutri.get("fat_100g"),
        "saturated_fat": nutri.get("saturated-fat_100g"),
        "carbs": nutri.get("carbohydrates_100g"),
        "sugars": nutri.get("sugars_100g"),
        "protein": nutri.get("proteins_100g"),
        "salt": nutri.get("salt_100g"),
        "fiber": nutri.get("fiber_100g"),
        "nutriscore": p.get("nutriscore_grade", ""),
        "nova_group": p.get("nova_group"),
        "is_vegan": 1 if "en:vegan" in labels else 0,
        "is_vegetarian": 1 if "en:vegetarian" in labels else 0,
        "is_gluten_free": 1 if "en:gluten-free" in labels else 0,
        "is_halal": 1 if "en:halal" in labels else 0,
        "is_organic": 1 if "en:organic" in labels else 0,
        "is_lactose_free": 1 if "en:lactose-free" in labels else 0,
        "is_dairy_free": 1 if "en:dairy-free" in labels else 0,
        "is_nut_free": 1 if "en:nut-free" in labels else 0,
        **allergen_flags,
        "image_url": p.get("image_url", ""),
        "countries": ",".join(p.get("countries_tags", [])[:3]),
    }


def main():
    conn = sqlite3.connect(DB_PATH)
    current = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    print(f"📊 현재: {current} 제품, 목표: {TARGET}")

    if current >= TARGET:
        print("✅ 이미 목표 달성!")
        return

    # Get existing barcodes to skip duplicates
    existing = set(r[0] for r in conn.execute("SELECT barcode FROM products").fetchall())
    print(f"📦 기존 바코드: {len(existing)}개")

    added = 0
    errors = 0
    page = 1

    # Search categories to get diverse products
    categories = [
        "beverages", "snacks", "cereals", "dairy", "meats", "fruits",
        "vegetables", "frozen", "canned", "condiments", "bread", "pasta",
        "chocolate", "cookies", "chips", "juice", "water", "coffee",
        "tea", "yogurt", "cheese", "ice-cream", "sauces", "soups",
        "baby-foods", "pet-food", "organic", "vegan", "gluten-free",
        "breakfast", "lunch", "dinner", "desserts", "candy", "nuts",
        "dried-fruits", "oils", "vinegars", "spices", "herbs",
        "rice", "noodles", "seafood", "poultry", "pork", "beef",
        "lamb", "tofu", "plant-based", "energy-drinks", "sodas",
    ]

    cat_idx = 0

    while current + added < TARGET:
        try:
            # Rotate through categories and general search
            if cat_idx < len(categories):
                url = f"https://world.openfoodfacts.org/category/{categories[cat_idx]}.json?page={page}&page_size={BATCH_SIZE}"
            else:
                url = f"https://world.openfoodfacts.org/api/v2/search?page={page}&page_size={BATCH_SIZE}&sort_by=popularity"

            resp = requests.get(url, timeout=30, headers={"User-Agent": "IngrediPeek/1.0 (datapeek@gmail.com)"})

            if resp.status_code != 200:
                print(f"⚠️ HTTP {resp.status_code}, skip page {page}")
                errors += 1
                if errors > 10:
                    cat_idx += 1
                    page = 1
                    errors = 0
                    continue
                time.sleep(5)
                continue

            data = resp.json()
            products = data.get("products", [])

            if not products:
                cat_idx += 1
                page = 1
                if cat_idx > len(categories) + 5:
                    break
                continue

            batch_added = 0
            for p in products:
                parsed = parse_product(p)
                if not parsed or parsed["barcode"] in existing:
                    continue

                try:
                    conn.execute(
                        """INSERT OR IGNORE INTO products VALUES (
                            :barcode, :name, :brand, :slug, :categories, :allergens,
                            :labels, :ingredients_text, :calories, :fat, :saturated_fat,
                            :carbs, :sugars, :protein, :salt, :fiber, :nutriscore,
                            :nova_group, :is_vegan, :is_vegetarian, :is_gluten_free,
                            :is_halal, :is_organic, :is_lactose_free, :is_dairy_free,
                            :is_nut_free, :allergen_milk, :allergen_gluten, :allergen_nuts,
                            :allergen_soy, :allergen_eggs, :allergen_fish, :allergen_shellfish,
                            :allergen_peanuts, :image_url, :countries
                        )""",
                        parsed,
                    )
                    existing.add(parsed["barcode"])
                    batch_added += 1
                except Exception:
                    pass

            added += batch_added

            if added % 500 == 0 or batch_added > 0:
                conn.commit()

            total = current + added
            if added % 100 < BATCH_SIZE:
                cat_name = categories[cat_idx] if cat_idx < len(categories) else "general"
                print(f"  [{total}/{TARGET}] +{batch_added} ({cat_name} p{page}) total added: {added}")

            page += 1

            # Move to next category every 50 pages
            if page > 50:
                cat_idx += 1
                page = 1

            time.sleep(DELAY)

        except Exception as e:
            print(f"❌ Error: {e}")
            errors += 1
            if errors > 20:
                print("Too many errors, stopping")
                break
            time.sleep(3)

    conn.commit()
    conn.close()

    final = current + added
    print(f"\n🎉 완료! {current} → {final} 제품 (추가: {added})")


if __name__ == "__main__":
    main()
