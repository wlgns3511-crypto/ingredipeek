export interface ProductProprietaryMetrics {
  processingScore: number;
  additiveLoadScore: number;
  nutrientDensityScore: number;
  overallGrade: string;
  commentary: string;
}

/**
 * Returns a deterministic commentary paragraph based on product details and slug-based hash
 * to rotate content variation and prevent duplicate content.
 */
function getDeterministicCommentary(
  productName: string,
  overallScore: number,
  slug: string
): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;

  let key = 'MODERATE_BALANCED';
  if (overallScore >= 75) {
    key = 'WHOLE_FOOD_CLEAN';
  } else if (overallScore < 50) {
    key = 'ULTRA_PROCESSED_DENSE';
  }

  const variations: Record<string, string[]> = {
    WHOLE_FOOD_CLEAN: [
      `The ${productName} presents an excellent nutritional profile. Being minimally processed with zero or low additives, it retains its natural nutrient density, serving as a highly recommended, clean whole-food choice.`,
      `Positioned as a highly clean product, ${productName} carries a robust nutrient structure. The minimal use of synthetic preservatives or colorings makes it an outstanding addition to standard nutritional regimens.`,
      `With a superior health score and minimal processing markers, ${productName} offers high nutritional density. It aligns perfectly with clean eating principles and clean-label verification parameters.`
    ],
    MODERATE_BALANCED: [
      `A moderately processed option, ${productName} balances standard additive safety and nutritional density. While it serves well for regular consumption, checking the allergen panel and managing daily portions is recommended.`,
      `This product offers a balanced nutritional profile suitable for a standard diet. It contains a few culinary additives, but maintains solid core nutrients that fit comfortably in balanced meals.`,
      `${productName} presents standard processing indicators. It balances convenience with decent nutritional content, making it an acceptable choice as long as it is consumed alongside whole foods.`
    ],
    ULTRA_PROCESSED_DENSE: [
      `This is an ultra-processed product containing multiple watchlist additives or low nutrient density. It is best consumed selectively, paying close attention to sodium, sugar, or synthetic preservative contents.`,
      `Characterized by high processing metrics and a dense additive load. Frequent consumption of ${productName} is not recommended for clean diets, and sensitive consumers should review the ingredient details.`,
      `A convenience-first food ${productName} features elevated processing indicators and low natural nutrients. The high count of synthetic additives suggests moderate dietary value; prioritize whole alternatives.`
    ]
  };

  const list = variations[key] || variations['MODERATE_BALANCED'];
  return list[index];
}

/**
 * Calculates proprietary product metrics for IngrediPeek.
 */
export function calculateProprietaryMetrics(
  productName: string,
  slug: string,
  novaGroup: number | null,
  additiveCount: number,
  nutriScore: string | null
): ProductProprietaryMetrics {
  // 1. Processing Score (15-99) — higher means more processed
  let processingScore = 50;
  if (novaGroup === 1) {
    processingScore = 20;
  } else if (novaGroup === 2) {
    processingScore = 40;
  } else if (novaGroup === 3) {
    processingScore = 65;
  } else if (novaGroup === 4) {
    processingScore = 92;
  }
  processingScore = Math.max(15, Math.min(99, processingScore));

  // 2. Additive Safety Load (12-99) — higher means more additives / higher load
  const additiveLoadScore = Math.max(12, Math.min(99, Math.round(additiveCount * 18 + 12)));

  // 3. Nutrient Density ROI (15-99) — higher means more nutrient dense
  let nutrientDensityScore = 50;
  const cleanScore = (nutriScore || '').toLowerCase().trim();
  if (cleanScore === 'a') {
    nutrientDensityScore = 95;
  } else if (cleanScore === 'b') {
    nutrientDensityScore = 82;
  } else if (cleanScore === 'c') {
    nutrientDensityScore = 68;
  } else if (cleanScore === 'd') {
    nutrientDensityScore = 45;
  } else if (cleanScore === 'e') {
    nutrientDensityScore = 22;
  }
  nutrientDensityScore = Math.max(15, Math.min(99, nutrientDensityScore));

  // 4. Overall Grade
  // Suitability is higher when processing and additives are low, and nutrients are high
  const composite = (100 - processingScore) * 0.4 + (100 - additiveLoadScore) * 0.3 + nutrientDensityScore * 0.3;

  let overallGrade = 'C';
  if (composite >= 90) overallGrade = 'A+';
  else if (composite >= 85) overallGrade = 'A';
  else if (composite >= 80) overallGrade = 'A-';
  else if (composite >= 75) overallGrade = 'B+';
  else if (composite >= 70) overallGrade = 'B';
  else if (composite >= 65) overallGrade = 'B-';
  else if (composite >= 60) overallGrade = 'C+';
  else if (composite >= 55) overallGrade = 'C';
  else if (composite >= 50) overallGrade = 'C-';
  else if (composite >= 40) overallGrade = 'D';
  else overallGrade = 'F';

  // 5. Commentary
  const commentary = getDeterministicCommentary(productName, composite, slug);

  return {
    processingScore,
    additiveLoadScore,
    nutrientDensityScore,
    overallGrade,
    commentary,
  };
}
