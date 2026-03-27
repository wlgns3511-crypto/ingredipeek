import type { Product } from "./db";

export interface AllergenInfo {
  name: string;
  key: keyof Product;
  label: string;
}

export const ALLERGEN_LIST: AllergenInfo[] = [
  { name: "Milk / Dairy", key: "allergen_milk", label: "milk" },
  { name: "Gluten / Wheat", key: "allergen_gluten", label: "gluten" },
  { name: "Tree Nuts", key: "allergen_nuts", label: "nuts" },
  { name: "Soy", key: "allergen_soy", label: "soy" },
  { name: "Eggs", key: "allergen_eggs", label: "eggs" },
  { name: "Fish", key: "allergen_fish", label: "fish" },
  { name: "Shellfish", key: "allergen_shellfish", label: "shellfish" },
  { name: "Peanuts", key: "allergen_peanuts", label: "peanuts" },
];

export const DIET_LIST = [
  { label: "Vegan", key: "is_vegan" as keyof Product, icon: "🌱" },
  { label: "Vegetarian", key: "is_vegetarian" as keyof Product, icon: "🥦" },
  { label: "Gluten-Free", key: "is_gluten_free" as keyof Product, icon: "🌾" },
  { label: "Halal", key: "is_halal" as keyof Product, icon: "☪️" },
  { label: "Organic", key: "is_organic" as keyof Product, icon: "♻️" },
  { label: "Lactose-Free", key: "is_lactose_free" as keyof Product, icon: "🥛" },
  { label: "Dairy-Free", key: "is_dairy_free" as keyof Product, icon: "🚫🧀" },
  { label: "Nut-Free", key: "is_nut_free" as keyof Product, icon: "🥜" },
];

export function getContainedAllergens(product: Product): string[] {
  return ALLERGEN_LIST.filter((a) => product[a.key] === 1).map((a) => a.name);
}

export function getFreeAllergens(product: Product): string[] {
  return ALLERGEN_LIST.filter((a) => product[a.key] === 0).map((a) => a.name);
}

export function generateAnalysis(product: Product): string {
  const contained = getContainedAllergens(product);
  const name = product.name;
  const brand = product.brand ? ` by ${product.brand}` : "";

  const lines: string[] = [];

  // Allergen overview
  if (contained.length === 0) {
    lines.push(
      `${name}${brand} does not contain any of the 8 major allergens tracked in our database. This makes it a broadly safe option for many people with common food allergies, though always verify the product label for "may contain" warnings.`
    );
  } else {
    lines.push(
      `${name}${brand} contains ${contained.join(", ")}. People with allergies to these ingredients should avoid this product or consult their physician before consuming.`
    );
  }

  // Diet compatibility
  const dietNotes: string[] = [];
  if (product.is_vegan === 1) dietNotes.push("suitable for vegans");
  if (product.is_vegetarian === 1) dietNotes.push("suitable for vegetarians");
  if (product.is_gluten_free === 1) dietNotes.push("gluten-free certified");
  if (product.is_halal === 1) dietNotes.push("halal certified");
  if (product.is_organic === 1) dietNotes.push("certified organic");
  if (product.is_dairy_free === 1) dietNotes.push("dairy-free");
  if (product.is_nut_free === 1) dietNotes.push("nut-free");

  if (dietNotes.length > 0) {
    lines.push(`This product is ${dietNotes.join(", ")}.`);
  }

  // Nutrition note
  if (product.nutriscore) {
    const nutriMap: Record<string, string> = {
      a: "excellent nutritional quality (Nutri-Score A)",
      b: "good nutritional quality (Nutri-Score B)",
      c: "moderate nutritional quality (Nutri-Score C)",
      d: "poor nutritional quality (Nutri-Score D)",
      e: "very poor nutritional quality (Nutri-Score E)",
    };
    const desc = nutriMap[product.nutriscore.toLowerCase()] || `Nutri-Score ${product.nutriscore.toUpperCase()}`;
    lines.push(`From a nutrition standpoint, this product has ${desc}.`);
  }

  if (product.nova_group) {
    const novaMap: Record<number, string> = {
      1: "unprocessed or minimally processed (NOVA Group 1)",
      2: "processed culinary ingredient (NOVA Group 2)",
      3: "processed food (NOVA Group 3)",
      4: "ultra-processed food (NOVA Group 4)",
    };
    const novaDesc = novaMap[product.nova_group] || `NOVA Group ${product.nova_group}`;
    lines.push(`This food is classified as ${novaDesc} according to the NOVA food processing classification.`);
  }

  // Disclaimer
  lines.push(
    "Always check the physical product label for the most accurate and up-to-date allergen information, as formulations can change. This data is sourced from Open Food Facts and may not reflect the latest product versions."
  );

  return lines.join(" ");
}

export function generateFAQ(product: Product): { question: string; answer: string }[] {
  const name = product.name;
  const faqs: { question: string; answer: string }[] = [];

  // Gluten-free FAQ
  faqs.push({
    question: `Is ${name} gluten free?`,
    answer:
      product.is_gluten_free === 1
        ? `Yes, ${name} is labeled as gluten-free. However, if you have celiac disease or a severe gluten sensitivity, always verify the product label for "may contain" or "processed in a facility" warnings.`
        : product.allergen_gluten === 1
        ? `No, ${name} contains gluten. It is not suitable for people with celiac disease or gluten sensitivity.`
        : `Based on available data, ${name} does not appear to be labeled as gluten-free. Always check the product label to confirm.`,
  });

  // Vegan FAQ
  faqs.push({
    question: `Is ${name} vegan?`,
    answer:
      product.is_vegan === 1
        ? `Yes, ${name} is labeled as vegan and does not contain any animal-derived ingredients.`
        : product.allergen_milk === 1 || product.allergen_eggs === 1
        ? `No, ${name} contains animal-derived ingredients (${[product.allergen_milk === 1 ? "dairy" : "", product.allergen_eggs === 1 ? "eggs" : ""].filter(Boolean).join(", ")}) and is not vegan.`
        : `The vegan status of ${name} is not confirmed in our database. Check the ingredient list for animal-derived ingredients.`,
  });

  // Halal FAQ
  faqs.push({
    question: `Is ${name} halal?`,
    answer:
      product.is_halal === 1
        ? `Yes, ${name} is certified halal.`
        : `The halal certification status of ${name} is not confirmed in our database. Contact the manufacturer for official halal certification information.`,
  });

  // Allergens FAQ
  const contained = getContainedAllergens(product);
  faqs.push({
    question: `What allergens does ${name} contain?`,
    answer:
      contained.length === 0
        ? `Based on our database, ${name} does not contain any of the 8 major allergens (milk, gluten, tree nuts, soy, eggs, fish, shellfish, peanuts). Always check the product label for the most current information.`
        : `${name} contains the following allergens: ${contained.join(", ")}. Always read the full ingredient list on the package for complete allergen information.`,
  });

  // Dairy-free FAQ
  faqs.push({
    question: `Is ${name} dairy-free?`,
    answer:
      product.is_dairy_free === 1 || product.allergen_milk === 0
        ? `Yes, ${name} appears to be dairy-free based on available data. Confirm with the product label if you have a severe dairy allergy.`
        : product.allergen_milk === 1
        ? `No, ${name} contains milk or dairy ingredients and is not dairy-free.`
        : `The dairy-free status of ${name} is not confirmed. Check the ingredient label for milk, cream, butter, cheese, or other dairy-derived ingredients.`,
  });

  if (product.ingredients_text) {
    faqs.push({
      question: `What are the ingredients in ${name}?`,
      answer: `The ingredients in ${name} are: ${product.ingredients_text}`,
    });
  }

  return faqs;
}
