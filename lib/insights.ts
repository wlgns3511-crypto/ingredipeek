export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface ProductData {
  name: string;
  brand?: string | null;
  ingredients_text?: string | null;
  nutriscore?: string | null;
  nova_group?: number | null;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  saturated_fat?: number | null;
  carbs?: number | null;
  sugars?: number | null;
  fiber?: number | null;
  salt?: number | null;
  allergen_milk?: number | null;
  allergen_gluten?: number | null;
  allergen_nuts?: number | null;
  allergen_peanuts?: number | null;
  allergen_soy?: number | null;
  allergen_eggs?: number | null;
  allergen_fish?: number | null;
  allergen_shellfish?: number | null;
  is_vegan?: number | null;
  is_gluten_free?: number | null;
}

const ALLERGEN_KEYS = [
  "allergen_milk", "allergen_gluten", "allergen_nuts", "allergen_peanuts",
  "allergen_soy", "allergen_eggs", "allergen_fish", "allergen_shellfish",
] as const;

export function generateInsights(product: ProductData): Insight[] {
  const insights: Insight[] = [];

  // 1. Allergen count assessment
  const containsCount = ALLERGEN_KEYS.filter(k => product[k] === 1).length;
  const unknownCount = ALLERGEN_KEYS.filter(k => product[k] == null).length;

  if (containsCount === 0 && unknownCount === 0) {
    insights.push({
      text: `${product.name} is confirmed free of all 8 major FDA-tracked allergens. Safe for most dietary restrictions, though always verify the packaging for "may contain" traces.`,
      sentiment: "positive",
    });
  } else if (containsCount === 0 && unknownCount > 0) {
    insights.push({
      text: `No major allergens detected in ${product.name}, but ${unknownCount} allergen${unknownCount > 1 ? "s are" : " is"} unverified. Check the physical label for complete allergen disclosure.`,
      sentiment: "neutral",
    });
  } else {
    const critical = (product.allergen_peanuts === 1 || product.allergen_nuts === 1 || product.allergen_shellfish === 1);
    insights.push({
      text: `Contains ${containsCount} of 8 major allergens.${critical ? " Includes high-risk allergens (peanut/tree nut/shellfish) associated with severe anaphylactic reactions." : ""} Not suitable for households managing these specific allergies.`,
      sentiment: "negative",
    });
  }

  // 2. Ingredient count / processing level
  if (product.ingredients_text) {
    const ingredientCount = product.ingredients_text.split(",").length;
    if (ingredientCount <= 5) {
      insights.push({
        text: `Short ingredient list (${ingredientCount} ingredients). Fewer ingredients generally means less processing and easier allergen identification.`,
        sentiment: "positive",
      });
    } else if (ingredientCount <= 15) {
      insights.push({
        text: `Moderate ingredient list (${ingredientCount} ingredients). Review carefully for hidden allergen derivatives like casein (milk), lecithin (soy), or modified starch (wheat).`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `Long ingredient list (${ingredientCount} ingredients). Complex formulations increase the chance of hidden allergens and cross-contamination risks.`,
        sentiment: "negative",
      });
    }
  }

  // 3. NOVA processing level
  if (product.nova_group != null) {
    if (product.nova_group <= 2) {
      insights.push({
        text: `NOVA group ${product.nova_group}: ${product.nova_group === 1 ? "unprocessed or minimally processed" : "processed culinary ingredient"}. This is one of the least-processed categories in the food supply.`,
        sentiment: "positive",
      });
    } else if (product.nova_group === 3) {
      insights.push({
        text: `NOVA group 3 (processed food). Contains added ingredients like salt, sugar, or oil but is not ultra-processed. A reasonable middle ground.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `NOVA group 4 (ultra-processed). NIH research links high ultra-processed food intake to increased calorie consumption. Consider less processed alternatives for everyday use.`,
        sentiment: "negative",
      });
    }
  }

  // 4. Nutri-Score quality
  if (product.nutriscore) {
    const ns = product.nutriscore.toLowerCase();
    if (ns === "a" || ns === "b") {
      insights.push({
        text: `Nutri-Score ${ns.toUpperCase()} places this in the top tier of nutritional quality. Good balance of beneficial nutrients vs sugar, salt, and saturated fat.`,
        sentiment: "positive",
      });
    } else if (ns === "c") {
      insights.push({
        text: `Nutri-Score C: average nutritional quality. Neither a standout nor a concern, but better alternatives in the same category may exist.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `Nutri-Score ${ns.toUpperCase()} indicates lower nutritional quality, typically driven by high sugar, saturated fat, or sodium. Best consumed occasionally.`,
        sentiment: "negative",
      });
    }
  }

  // 5. Common allergen callout
  const allergenNames: string[] = [];
  if (product.allergen_milk === 1) allergenNames.push("milk/dairy");
  if (product.allergen_gluten === 1) allergenNames.push("gluten/wheat");
  if (product.allergen_peanuts === 1) allergenNames.push("peanuts");
  if (product.allergen_nuts === 1) allergenNames.push("tree nuts");
  if (product.allergen_soy === 1) allergenNames.push("soy");
  if (product.allergen_eggs === 1) allergenNames.push("eggs");

  if (allergenNames.length > 0) {
    insights.push({
      text: `Specific allergens present: ${allergenNames.join(", ")}. These are among the most common triggers in US food allergy households (32 million Americans affected).`,
      sentiment: "negative",
    });
  } else if (containsCount === 0) {
    insights.push({
      text: `This product is compatible with the most common US dietary restrictions: dairy-free, gluten-free, nut-free, and soy-free.`,
      sentiment: "positive",
    });
  }

  return insights.slice(0, 5);
}
