export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-lime-50 border-lime-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center text-2xl">
        <span>🥗</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">IngredIPeek Food Science Team</span>
          <span className="text-xs px-2 py-0.5 bg-lime-100 text-lime-800 rounded-full font-medium">Nutrition Science & Food Ingredient Analysts</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Our registered dietitians and food scientists analyze ingredient safety, nutritional profiles, and FDA compliance. Data sourced from FDA GRAS database, USDA FoodData Central, and peer-reviewed nutrition research.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded">✓ FDA GRAS Verified</span>
          <span className="text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded">✓ RD Reviewed</span>
          <span className="text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded">✓ USDA Sourced</span>
        </div>
      </div>
    </div>
  );
}
