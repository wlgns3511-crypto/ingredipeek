export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "how-to-read-nutrition-labels",
    title: "How to Read Nutrition Labels Like a Food Scientist",
    description:
      "Nutrition labels contain far more information than most people use — and some of it is designed to mislead. Here's how to decode every element like an expert.",
    publishedAt: "2024-10-15",
    updatedAt: "2025-01-10",
    category: "Label Reading",
    readingTime: 7,
    content: `
<h2>Start With the Serving Size (The Most Important Line)</h2>
<p>Before looking at any other number, find the serving size. This is where labels most commonly mislead consumers. A bag of chips listed as "150 calories" might contain 2.5 servings — meaning the full bag is 375 calories. By law, serving sizes must reflect amounts people "customarily consume," but what the food industry considers customary doesn't always match reality.</p>
<p><strong>Critical trap</strong>: A bottle of iced tea or soda often lists 2–2.5 servings, but most people drink the whole bottle. Always multiply all values by the number of servings you'll actually consume.</p>

<h2>Daily Value Percentages: A Quick Calibration Tool</h2>
<p>The % Daily Value (%DV) column tells you how much a nutrient in one serving contributes to a 2,000-calorie daily diet. The FDA's quick rules:</p>
<ul>
  <li><strong>5% DV or less</strong>: Low in that nutrient</li>
  <li><strong>20% DV or more</strong>: High in that nutrient</li>
</ul>
<p>For nutrients you want more of (fiber, vitamins, protein), higher %DV is better. For nutrients to limit (sodium, saturated fat, added sugar), lower %DV is better. At 20%+ DV of sodium in a single serving, that food is contributing meaningfully to your daily limit in just one portion.</p>

<h2>The Ingredient List: Ranked by Weight</h2>
<p>Ingredients are listed in descending order by weight — the first ingredient is present in the largest amount. This single rule unlocks enormous insight:</p>
<ul>
  <li>If "sugar" is the first ingredient in a granola bar marketed as "high protein," that's telling</li>
  <li>In "whole grain bread," if whole wheat is the first ingredient, the product is genuinely whole grain — if enriched white flour appears first, "whole grain" is largely marketing</li>
  <li>Multiple forms of the same ingredient (sugar, corn syrup, honey, molasses) spread across the list are a tactic to prevent any single form from appearing too high</li>
</ul>

<h2>Understanding the Macros</h2>
<h3>Total Fat vs. Saturated vs. Trans</h3>
<p>Total fat includes all types. Saturated fat (found in animal products and tropical oils) contributes to cardiovascular risk — current guidance recommends less than 10% of calories from saturated fat. Trans fat (partially hydrogenated oils) is associated with increased cardiovascular risk and is largely banned in the US, though products can list "0g trans fat" if they contain under 0.5g per serving.</p>

<h3>Total Carbohydrates, Fiber, and Added Sugar</h3>
<p>Total carbohydrates include starches, fiber, and sugars. Dietary fiber (listed separately) should be at least 3g per serving for a "good source" claim. <strong>Added sugars</strong> (listed separately since 2020) are key: they represent sugar added during processing, separate from naturally occurring sugars in milk or fruit. The 2020 Dietary Guidelines recommend keeping added sugars below 10% of daily calories (~50g for a 2,000-calorie diet).</p>

<h2>What "Light," "Reduced," and "Free" Legally Mean</h2>
<p>These claims have specific FDA definitions:</p>
<ul>
  <li><strong>"Light" or "Lite"</strong>: Must have 1/3 fewer calories OR 50% less fat than the reference food</li>
  <li><strong>"Reduced"</strong>: At least 25% less of a nutrient than the reference food</li>
  <li><strong>"Free" (as in "fat-free" or "sugar-free")</strong>: Less than a specific small amount per serving (e.g., less than 0.5g fat per serving = "fat-free")</li>
  <li><strong>"Good source of"</strong>: 10–19% DV per serving</li>
  <li><strong>"Excellent source of"</strong>: 20%+ DV per serving</li>
</ul>

<h2>Sodium: The Overlooked Number</h2>
<p>The 2020 Dietary Guidelines recommend no more than 2,300mg of sodium per day — about 1 teaspoon of salt. The average American consumes about 3,400mg/day. Processed foods are the primary source: a single serving of canned soup can contain 800–1,200mg, over half the daily recommended limit. Check sodium %DV on every processed food you buy consistently.</p>
`,
  },
  {
    slug: "hidden-ingredients-watch-out",
    title: "Hidden Ingredients in Your Food: What Food Companies Don't Want You to See",
    description:
      "Food labels can be legally accurate while still concealing what's really in your food. Here are the hidden ingredients most people don't recognize — and why they matter.",
    publishedAt: "2024-10-22",
    category: "Food Safety",
    readingTime: 7,
    content: `
<h2>The Hidden Sugar Problem</h2>
<p>If you see "no added sugar" on a product's front label but the ingredient list shows corn syrup, you might think it's contradictory — but food companies have learned to use over <strong>60 different names for sugar</strong> to avoid the word appearing too prominently. Common hidden sugar names:</p>
<ul>
  <li>Dextrose, fructose, glucose, maltose, sucrose</li>
  <li>Corn syrup, high-fructose corn syrup, corn sweetener</li>
  <li>Cane juice, cane crystals, evaporated cane juice</li>
  <li>Barley malt, rice syrup, malt syrup</li>
  <li>Fruit juice concentrate (often as sweet as corn syrup)</li>
  <li>Agave nectar, coconut sugar, palm sugar (marketed as "natural" but metabolically similar)</li>
</ul>
<p>The 2020 Nutrition Facts label now requires "added sugars" to be listed separately in grams, making this somewhat easier to track — but the ingredient list still hides the diversity of sources.</p>

<h2>MSG Derivatives</h2>
<p>Many consumers avoid monosodium glutamate (MSG) due to concerns about sensitivity. But manufacturers use a range of ingredients that contain or generate free glutamates during processing:</p>
<ul>
  <li><strong>Autolyzed yeast extract</strong> — contains free glutamic acid at levels similar to MSG</li>
  <li><strong>Hydrolyzed vegetable protein (HVP)</strong> or hydrolyzed soy protein</li>
  <li><strong>Yeast extract</strong></li>
  <li><strong>Torula yeast</strong></li>
  <li><strong>Textured protein</strong></li>
</ul>
<p>These don't have to be labeled as "contains MSG" even though they deliver similar amounts of free glutamate. People sensitive to MSG should look for all these terms.</p>

<h2>Hidden Gluten Sources</h2>
<p>For people with celiac disease or gluten sensitivity, the obvious sources (wheat, barley, rye) are easy to avoid. Less obvious:</p>
<ul>
  <li><strong>Modified food starch</strong> — can be wheat-derived unless labeled "modified cornstarch"</li>
  <li><strong>Malt extract / malt flavoring</strong> — typically barley-derived</li>
  <li><strong>Soy sauce</strong> — usually contains wheat; tamari is often gluten-free</li>
  <li><strong>Dextrin</strong> — may be wheat-derived</li>
  <li><strong>Caramel color</strong> — sometimes made from barley malt in Europe (typically corn in US)</li>
</ul>
<p>Products labeled "gluten-free" in the US must contain less than 20 ppm gluten under FDA regulations — this is the safest designation to look for.</p>

<h2>Carrageenan: The Controversial Thickener</h2>
<p>Carrageenan is a seaweed-derived thickener used in dairy products, plant milks, deli meats, and infant formula. It's approved by the FDA as "generally recognized as safe," but some researchers argue that food-grade carrageenan may cause intestinal inflammation. The scientific evidence is contested — animal studies show potential issues, but human evidence is limited. People with inflammatory bowel conditions sometimes report symptom improvement when eliminating carrageenan.</p>

<h2>TBHQ: The Petroleum-Derived Preservative</h2>
<p>Tertiary butylhydroquinone (TBHQ) is an antioxidant preservative found in fast food items, packaged snacks, and cooking oils. It's derived from butane (a petroleum product). The FDA allows up to 0.02% of the oil content in foods. Animal studies at high doses show concerning effects, though the doses in food are much lower. It's banned in Japan and some other countries but legal in the US and EU.</p>

<h2>"Natural Flavors": The Catch-All</h2>
<p>"Natural flavors" is one of the most common ingredients on labels — and also one of the vaguest. Under FDA rules, natural flavors must be derived from a natural source (plants, animals, seafood, dairy), but can be extensively processed and may contain dozens of chemical compounds. This means:</p>
<ul>
  <li>Vegans and vegetarians should note that "natural flavors" can include animal-derived compounds</li>
  <li>People with specific allergies should be aware that allergens can be present in natural flavors (though major allergens must be declared)</li>
  <li>The term tells you nothing about how much processing was involved</li>
</ul>

<h2>Artificial Colors and Behavioral Concerns</h2>
<p>The FDA-approved artificial dyes (Red 40, Yellow 5, Yellow 6, Blue 1, Blue 2, Green 3, Red 3) are widely used in candies, cereals, beverages, and snacks. A 2007 UK study found that certain combinations of artificial dyes with sodium benzoate increased hyperactivity in children — leading the European Union to require warning labels on products containing them. The FDA reviewed the same evidence and concluded it did not show a causal link but allows individual families to make their own decisions.</p>
`,
  },
  {
    slug: "organic-vs-conventional-worth-it",
    title: "Organic vs. Conventional: A Data-Based Analysis of When It's Worth It",
    description:
      "Organic produce costs 20–100% more than conventional. Is it worth it? The answer depends on which produce you're buying — and the data gives clear guidance.",
    publishedAt: "2024-11-05",
    category: "Food Buying",
    readingTime: 6,
    content: `
<h2>What "Organic" Actually Means</h2>
<p>USDA certified organic produce:</p>
<ul>
  <li>Must be grown without synthetic pesticides or herbicides</li>
  <li>Cannot be grown with synthetic fertilizers</li>
  <li>Cannot be genetically modified (non-GMO)</li>
  <li>Must meet USDA National Organic Program standards</li>
</ul>
<p>Organic does <strong>not</strong> mean pesticide-free — organic-approved pesticides (including copper sulfate, spinosad, and others) can and do appear on organic produce. The key difference is the exclusion of synthetic pesticides.</p>

<h2>The EWG Dirty Dozen and Clean Fifteen</h2>
<p>The Environmental Working Group (EWG) analyzes USDA pesticide testing data to produce annual lists of the most and least pesticide-contaminated produce. The 2024 Dirty Dozen (highest pesticide residues, buy organic if possible):</p>
<ol>
  <li>Strawberries</li>
  <li>Spinach</li>
  <li>Kale, collard, and mustard greens</li>
  <li>Peaches</li>
  <li>Pears</li>
  <li>Nectarines</li>
  <li>Apples</li>
  <li>Grapes</li>
  <li>Bell and hot peppers</li>
  <li>Cherries</li>
  <li>Blueberries</li>
  <li>Green beans</li>
</ol>
<p>The 2024 Clean Fifteen (lowest pesticide residues, conventional is fine):</p>
<ul>
  <li>Avocados, sweet corn, pineapple, onions, papaya, sweet peas (frozen), asparagus, honeydew melon, kiwi, cabbage, mushrooms, mangoes, sweet potatoes, watermelon, carrots</li>
</ul>

<h2>Pesticide Residue Research</h2>
<p>Multiple studies have found measurable pesticide residues on a significant percentage of conventional produce — the EWG found pesticide residues on 75% of non-organic produce tested. However, the research on health effects at typical dietary exposure levels is more nuanced. Most regulatory agencies (EPA, EFSA) set Maximum Residue Limits (MRLs) based on chronic exposure modeling, and most residues fall well below these limits.</p>
<p>The strongest evidence for harm from pesticide exposure comes from studies of agricultural workers with much higher occupational exposures, not typical consumer dietary exposure. The precautionary argument for organic is more compelling for children and pregnant women, whose exposures relative to body weight are higher.</p>

<h2>Does Organic Taste or Nutrition Differ?</h2>
<p>A comprehensive 2012 Stanford meta-analysis of 237 studies found <strong>no strong evidence</strong> that organic food is nutritionally superior to conventional. A 2014 British Journal of Nutrition meta-analysis found modestly higher levels of certain antioxidants in organic crops — approximately 19–69% higher for specific polyphenols — though the clinical significance is uncertain. Taste differences are subjective and not consistently supported in blind studies.</p>

<h2>When to Buy Organic: A Practical Framework</h2>
<h3>Prioritize organic for:</h3>
<ul>
  <li>Thin-skinned produce you eat whole (strawberries, apples, grapes, peaches)</li>
  <li>Leafy greens eaten raw (spinach, kale)</li>
  <li>Produce given to young children or consumed by pregnant women</li>
  <li>Any item on the Dirty Dozen list where organic is available</li>
</ul>

<h3>Save money on conventional for:</h3>
<ul>
  <li>Produce with thick, inedible skins (avocados, pineapple, onions, corn)</li>
  <li>Any item on the Clean Fifteen list</li>
  <li>Produce you cook thoroughly at high temperatures</li>
</ul>

<h2>The Cost Reality</h2>
<p>Selectively buying organic only for Dirty Dozen items while buying conventional for Clean Fifteen items can reduce the premium substantially — organic for 12 key items rather than everything can cut the organic premium from 40–50% of your total produce bill to 10–20%, while still reducing your highest pesticide exposures.</p>
`,
  },
  {
    slug: "best-protein-sources-by-cost",
    title: "Best Protein Sources Ranked by Cost, Quality, and Completeness",
    description:
      "Not all protein is created equal — and cost per gram of protein varies by 10x between sources. Here's how to get the most protein value for your dollar.",
    publishedAt: "2024-11-20",
    category: "Nutrition Guides",
    readingTime: 6,
    content: `
<h2>Complete vs. Incomplete Protein</h2>
<p>Proteins are made of amino acids, nine of which are "essential" — meaning your body can't make them and must get them from food. A <strong>complete protein</strong> contains all nine essential amino acids in adequate proportions. Animal proteins (meat, fish, dairy, eggs) are complete. Most plant proteins are "incomplete," meaning they're low in one or more essential amino acids.</p>
<p>This doesn't mean plant proteins are inadequate for health — it means you need to consume a variety of plant proteins to ensure you get all essential amino acids. The classic example is rice and beans: rice is low in lysine, beans are low in methionine, but together they provide a complete amino acid profile.</p>

<h2>Cost Per Gram of Protein: Rankings</h2>
<table>
  <thead><tr><th>Food Source</th><th>Protein per serving</th><th>Cost/serving</th><th>Cost per gram protein</th></tr></thead>
  <tbody>
    <tr><td>Eggs (large, grocery store)</td><td>6g per egg</td><td>~$0.15/egg</td><td>~$0.025/g</td></tr>
    <tr><td>Canned tuna (chunk light)</td><td>25g per can</td><td>~$0.75/can</td><td>~$0.030/g</td></tr>
    <tr><td>Whey protein powder</td><td>25g per scoop</td><td>~$0.75/scoop</td><td>~$0.030/g</td></tr>
    <tr><td>Canned chicken breast</td><td>26g per can</td><td>~$1.50/can</td><td>~$0.058/g</td></tr>
    <tr><td>Chicken breast (fresh, bulk)</td><td>31g per 4 oz</td><td>~$1.50 per serving</td><td>~$0.048/g</td></tr>
    <tr><td>Greek yogurt (non-fat, store brand)</td><td>17g per cup</td><td>~$0.80/cup</td><td>~$0.047/g</td></tr>
    <tr><td>Canned chickpeas/black beans</td><td>7g per 1/2 cup</td><td>~$0.25/serving</td><td>~$0.036/g</td></tr>
    <tr><td>Lentils (dry, cooked)</td><td>9g per 1/2 cup cooked</td><td>~$0.20/serving</td><td>~$0.022/g</td></tr>
    <tr><td>Tofu (firm)</td><td>10g per 3 oz</td><td>~$0.50/serving</td><td>~$0.050/g</td></tr>
  </tbody>
</table>

<h2>PDCAAS: Measuring Protein Quality</h2>
<p>The Protein Digestibility-Corrected Amino Acid Score (PDCAAS) is the FDA's standard for measuring protein quality. It accounts for both amino acid completeness and digestibility. Scores range from 0 to 1.0:</p>
<ul>
  <li><strong>Score 1.0</strong>: Whey, eggs, casein, soy, quinoa</li>
  <li><strong>Score 0.9–0.95</strong>: Beef, chicken, fish, dairy</li>
  <li><strong>Score 0.5–0.7</strong>: Legumes, grains (individually)</li>
</ul>
<p>Soy protein is notable as the only plant protein that scores 1.0 on PDCAAS — making it a complete, high-quality protein source equivalent to animal proteins.</p>

<h2>Practical Budget Protein Strategy</h2>
<p>For maximum protein per dollar:</p>
<ol>
  <li><strong>Eggs</strong>: Most affordable complete protein. Versatile, nutrient-dense, and fast to prepare.</li>
  <li><strong>Canned tuna and canned chicken</strong>: Shelf-stable, no preparation, excellent protein density.</li>
  <li><strong>Lentils and canned beans</strong>: Cheapest protein available, with the bonus of fiber. Pair with a grain for complete amino acids.</li>
  <li><strong>Plain Greek yogurt (store brand)</strong>: Doubles as a snack with good protein density; also provides calcium and probiotics.</li>
  <li><strong>Whey protein</strong>: Excellent cost-per-gram when bought in bulk (5 lb bags); useful for hitting protein targets without a lot of food volume.</li>
</ol>

<h2>Protein Combining for Plant-Based Diets</h2>
<p>You don't need to combine complete proteins at every meal — your body maintains an amino acid pool that averages across your daily intake. However, consistently eating a variety of plant proteins (legumes + grains, nuts/seeds + legumes) across the day ensures you meet all essential amino acid needs. Soy, quinoa, buckwheat, and hemp seeds are complete plant proteins that don't require combining.</p>
`,
  },
  {
    slug: "food-additives-safe-or-avoid",
    title: "Common Food Additives: Which Are Safe and Which to Avoid",
    description:
      "The US food supply contains hundreds of approved additives. Most are safe; a few are genuinely worth avoiding. Here's a science-based guide to what's in your food.",
    publishedAt: "2024-12-05",
    category: "Food Safety",
    readingTime: 7,
    content: `
<h2>How Food Additives Get Approved</h2>
<p>In the United States, food additives are regulated by the FDA through two main pathways: formal food additive approval (requiring safety testing data submitted to the FDA) and <strong>GRAS designation</strong> (Generally Recognized As Safe). GRAS is controversial because companies can self-affirm GRAS status without notifying the FDA — meaning some ingredients enter the food supply without independent government review.</p>
<p>The FDA has an ongoing program to review GRAS designations, but the system's reliance on self-affirmation has been criticized by the Government Accountability Office and consumer advocacy groups.</p>

<h2>Additives with Strong Safety Records</h2>
<h3>Lecithin</h3>
<p>Found in eggs, soy, sunflowers, and used as an emulsifier in chocolate, baked goods, and margarine. Lecithin is derived from naturally occurring phospholipids and has decades of safe use data. It's also found naturally in many foods we eat regularly.</p>

<h3>Ascorbic Acid (Vitamin C)</h3>
<p>Used as an antioxidant preservative and added for nutritional enrichment. As a naturally occurring vitamin, its safety is well-established. Also helps prevent browning in cut fruits and processed foods.</p>

<h3>Xanthan Gum</h3>
<p>A polysaccharide produced by bacterial fermentation, used as a thickener and stabilizer in salad dressings, sauces, and gluten-free baked goods. Long safety record; also used in medical food thickening. Well-tolerated by most people, though very large amounts can have a laxative effect.</p>

<h3>Citric Acid</h3>
<p>Found naturally in citrus fruits and produced commercially by fermentation. Used as a preservative, flavor enhancer, and pH adjuster. No significant safety concerns established.</p>

<h2>Controversial Additives</h2>

<h3>BHA and BHT (Butylated Hydroxyanisole and Butylated Hydroxytoluene)</h3>
<p>These petroleum-derived antioxidants are used to prevent fat oxidation in cereals, chewing gum, potato chips, and vegetable oils. The National Toxicology Program has listed BHA as "reasonably anticipated to be a human carcinogen" based on animal data. BHT has a better safety profile but shares structural similarity with BHA. Both are banned in several countries including Japan; the EU permits limited use.</p>

<h3>Sodium Nitrate and Sodium Nitrite</h3>
<p>Used to cure and preserve meats (bacon, hot dogs, deli meats) and provide the characteristic pink color. In the stomach, nitrites can convert to nitrosamines, which are potent carcinogens. The International Agency for Research on Cancer (IARC) classifies processed meats as a Group 1 carcinogen (causes cancer in humans), with nitrites being the primary concern. Many manufacturers have switched to "celery juice powder" which naturally contains nitrates — these function identically to added nitrates despite the "uncured" label.</p>

<h3>Artificial Colors (Red 40, Yellow 5, Yellow 6, etc.)</h3>
<p>As described in our hidden ingredients guide, the Southampton study linked certain combinations of artificial dyes to hyperactivity in children. The EU requires warning labels ("may have an adverse effect on activity and attention in children") on products containing these dyes. The FDA has not required similar labeling but continues to monitor the research.</p>

<h2>Additives Legal in the US But Banned Elsewhere</h2>
<table>
  <thead><tr><th>Additive</th><th>US Status</th><th>Banned In</th><th>Found In</th></tr></thead>
  <tbody>
    <tr><td>Potassium bromate</td><td>Legal (used in bread)</td><td>EU, UK, Canada, Brazil, China</td><td>Some commercial breads</td></tr>
    <tr><td>Azodicarbonamide (ADA)</td><td>Legal (dough conditioner)</td><td>EU, UK, Australia</td><td>Subway bread, many commercial breads</td></tr>
    <tr><td>rBGH/rBST (growth hormone)</td><td>Legal (dairy cattle)</td><td>EU, Canada, Japan, Australia</td><td>Non-labeled conventional dairy</td></tr>
    <tr><td>Brominated vegetable oil (BVO)</td><td>Being phased out (2024)</td><td>EU, Japan, India</td><td>Some citrus sodas</td></tr>
  </tbody>
</table>
<p>Note: The FDA approved BVO's removal from the GRAS list in 2024, so it is being phased out of the US food supply after decades of use.</p>

<h2>How to Use Our Ingredient Checker</h2>
<p>Our ingredient checker lets you scan any food product and instantly see which additives are present, their function, safety classification, and whether they appear on any concerning lists. Look up ingredients for products you regularly consume to build a clearer picture of your dietary additive exposure — and make informed choices about which products to swap.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(posts.map((p) => p.category)));
}
