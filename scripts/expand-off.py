#!/usr/bin/env python3
"""
Expand IngrediPeek with additional products from Open Food Facts API.
No API key required - public, open-source food database.

Source: https://world.openfoodfacts.org/api/v2/
"""

import sqlite3
import os
import json
import re
import time
import urllib.request
import urllib.error

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'foods.db')
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'off_cache')

# Categories to fetch (popular US food categories)
CATEGORIES = [
    "breakfast-cereals", "snacks", "beverages", "dairy", "frozen-foods",
    "canned-foods", "condiments", "baked-goods", "pasta", "sauces",
    "chips", "cookies", "crackers", "candy", "chocolate",
    "yogurts", "cheese", "ice-cream", "bread", "nuts",
    "granola-bars", "protein-bars", "baby-foods", "soups", "dressings",
    "juices", "sodas", "energy-drinks", "coffee", "tea",
]

OFF_URL = "https://world.openfoodfacts.org/cgi/search.pl"


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:100]


def fetch_category(category, page=1, page_size=100):
    """Fetch products from Open Food Facts by category."""
    cache_file = os.path.join(CACHE_DIR, f"{category}_p{page}.json")

    if os.path.exists(cache_file):
        with open(cache_file) as f:
            return json.load(f)

    url = (
        f"{OFF_URL}?action=process&tagtype_0=categories"
        f"&tag_contains_0=contains&tag_0={category}"
        f"&countries=United+States"
        f"&page_size={page_size}&page={page}"
        f"&json=1&fields=code,product_name,brands,categories,ingredients_text,"
        f"allergens_tags,nutriments,nutriscore_grade,nova_group,"
        f"image_front_small_url,countries_tags,"
        f"labels_tags"
    )

    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'IngrediPeek/1.0 (datapeekfacts@gmail.com)'
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            products = data.get('products', [])

        with open(cache_file, 'w') as f:
            json.dump(products, f)

        return products
    except Exception as e:
        print(f"    Error fetching {category}: {e}")
        return []


def extract_allergens(product):
    """Extract allergen flags from product data."""
    allergen_tags = product.get('allergens_tags', [])
    allergen_map = {
        'en:milk': 'allergen_milk',
        'en:gluten': 'allergen_gluten',
        'en:nuts': 'allergen_nuts',
        'en:soybeans': 'allergen_soy',
        'en:eggs': 'allergen_eggs',
        'en:fish': 'allergen_fish',
        'en:crustaceans': 'allergen_shellfish',
        'en:peanuts': 'allergen_peanuts',
    }
    flags = {v: 0 for v in allergen_map.values()}
    for tag in allergen_tags:
        if tag in allergen_map:
            flags[allergen_map[tag]] = 1
    return flags


def extract_diet_flags(product):
    """Extract dietary flags from labels."""
    labels = product.get('labels_tags', [])
    return {
        'is_vegan': 1 if 'en:vegan' in labels else 0,
        'is_vegetarian': 1 if 'en:vegetarian' in labels else 0,
        'is_gluten_free': 1 if 'en:gluten-free' in labels or 'en:no-gluten' in labels else 0,
        'is_organic': 1 if 'en:organic' in labels else 0,
        'is_halal': 1 if 'en:halal' in labels else 0,
        'is_lactose_free': 1 if 'en:lactose-free' in labels else 0,
        'is_dairy_free': 1 if 'en:dairy-free' in labels else 0,
        'is_nut_free': 1 if 'en:nut-free' in labels else 0,
    }


def main():
    print("=== IngrediPeek Open Food Facts Expansion ===\n")

    os.makedirs(CACHE_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)

    # Get existing barcodes
    existing = {r[0] for r in conn.execute('SELECT barcode FROM products').fetchall()}
    print(f"Existing products: {len(existing)}")

    inserted = 0
    skipped = 0

    for cat in CATEGORIES:
        print(f"\n  Category: {cat}")
        for page in range(1, 6):  # Up to 5 pages per category (500 products)
            products = fetch_category(cat, page)
            if not products:
                break

            for p in products:
                barcode = p.get('code', '')
                name = p.get('product_name', '')
                if not barcode or not name or len(name) < 3 or barcode in existing:
                    skipped += 1
                    continue

                brand = p.get('brands', '')
                categories = p.get('categories', '')
                ingredients = p.get('ingredients_text', '')
                nutri = p.get('nutriments', {})
                slug = slugify(f"{name}-{barcode[-6:]}")

                allergens = extract_allergens(p)
                diet = extract_diet_flags(p)

                try:
                    conn.execute('''
                        INSERT OR IGNORE INTO products
                        (barcode, name, brand, slug, categories, ingredients_text, allergens,
                         calories, fat, saturated_fat, carbs, sugars, protein, salt, fiber,
                         is_vegan, is_vegetarian, is_gluten_free, is_halal, is_organic,
                         is_lactose_free, is_dairy_free, is_nut_free,
                         allergen_milk, allergen_gluten, allergen_nuts, allergen_soy,
                         allergen_eggs, allergen_fish, allergen_shellfish, allergen_peanuts,
                         nutriscore, nova_group, image_url, countries)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                    ''', (
                        barcode, name, brand, slug, categories, ingredients,
                        ','.join(t.replace('en:', '') for t in p.get('allergens_tags', [])),
                        nutri.get('energy-kcal_100g'), nutri.get('fat_100g'),
                        nutri.get('saturated-fat_100g'), nutri.get('carbohydrates_100g'),
                        nutri.get('sugars_100g'), nutri.get('proteins_100g'),
                        nutri.get('salt_100g'), nutri.get('fiber_100g'),
                        diet['is_vegan'], diet['is_vegetarian'], diet['is_gluten_free'],
                        diet['is_halal'], diet['is_organic'], diet['is_lactose_free'],
                        diet['is_dairy_free'], diet['is_nut_free'],
                        allergens['allergen_milk'], allergens['allergen_gluten'],
                        allergens['allergen_nuts'], allergens['allergen_soy'],
                        allergens['allergen_eggs'], allergens['allergen_fish'],
                        allergens['allergen_shellfish'], allergens['allergen_peanuts'],
                        p.get('nutriscore_grade'), p.get('nova_group'),
                        p.get('image_front_small_url', ''),
                        ','.join(t.replace('en:', '') for t in p.get('countries_tags', [])),
                    ))
                    existing.add(barcode)
                    inserted += 1
                except sqlite3.IntegrityError:
                    skipped += 1

            time.sleep(0.5)  # Be nice to OFF servers

        conn.commit()
        print(f"    Running total: +{inserted} new, {skipped} skipped")

    conn.commit()
    total = conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    print(f"\n=== Done ===")
    print(f"  New products: {inserted}")
    print(f"  Total products: {total}")

    conn.close()


if __name__ == '__main__':
    main()
