// Top-50 controversial food additives — first-party reference table.
//
// Scope is deliberately narrow: 50 well-known additives that meet at least
// one of these conditions:
//   - regulatory restriction in EU/UK/CA/US
//   - IARC group classification (1, 2A, or 2B)
//   - EFSA re-evaluation flagging additional concerns
//   - peer-reviewed literature with replicated findings
//
// Out-of-scope: the long tail of GRAS-only additives. EWG's full list runs
// to thousands of entries; we keep the 50 that produce the most useful
// signal when matched against ingredients_text on this site's catalog.
//
// Each entry's `aliases` is the surface form set we'll match against the
// raw ingredients string (case-insensitive substring). `tier` gates the
// per-product risk score and the verdict copy.
//
// Tiers:
//   1 = banned or under active restriction in major jurisdictions, OR
//       IARC 1 / 2A, OR replicated harm signal in human studies
//   2 = IARC 2B, OR EU mandatory warning label, OR mixed evidence
//   3 = debated; mostly GRAS but specific subgroups may want to avoid

export type AdditiveTier = 1 | 2 | 3;

export interface Additive {
  id: string;
  name: string;
  ename?: string;
  aliases: string[];
  tier: AdditiveTier;
  summary: string;
}

export const ADDITIVES: Additive[] = [
  // ── Artificial colors ──────────────────────────────────────────
  { id: 'red-40', name: 'Red 40', ename: 'E129',
    aliases: ['red 40', 'red no. 40', 'allura red', 'fd&c red 40', 'e129'],
    tier: 2,
    summary: 'EU mandatory warning label for hyperactivity link in children. Common in candy, sodas, cereal.' },
  { id: 'yellow-5', name: 'Yellow 5', ename: 'E102',
    aliases: ['yellow 5', 'yellow no. 5', 'tartrazine', 'fd&c yellow 5', 'e102'],
    tier: 2,
    summary: 'EU mandatory warning label. Linked to behavioral effects in sensitive children.' },
  { id: 'yellow-6', name: 'Yellow 6', ename: 'E110',
    aliases: ['yellow 6', 'yellow no. 6', 'sunset yellow', 'fd&c yellow 6', 'e110'],
    tier: 2,
    summary: 'EU mandatory warning label. Banned in Norway and Finland for years.' },
  { id: 'red-3', name: 'Red 3', ename: 'E127',
    aliases: ['red 3', 'red no. 3', 'erythrosine', 'fd&c red 3', 'e127'],
    tier: 1,
    summary: 'FDA banned in food (2025) after long restriction in cosmetics. Animal carcinogen.' },
  { id: 'caramel-iv', name: 'Caramel color IV', ename: 'E150d',
    aliases: ['caramel iv', 'caramel color iv', 'caramel colour iv', 'e150d', 'sulfite ammonia caramel'],
    tier: 2,
    summary: '4-methylimidazole byproduct classified IARC 2B (possibly carcinogenic). Common in colas.' },

  // ── Preservatives ──────────────────────────────────────────────
  { id: 'bha', name: 'BHA',
    aliases: ['bha', 'butylated hydroxyanisole', 'e320'],
    tier: 2,
    summary: 'IARC 2B possibly carcinogenic. NTP "reasonably anticipated to be human carcinogen".' },
  { id: 'bht', name: 'BHT',
    aliases: ['bht', 'butylated hydroxytoluene', 'e321'],
    tier: 2,
    summary: 'EWG moderate concern. Animal studies show liver and thyroid effects at high doses.' },
  { id: 'tbhq', name: 'TBHQ', ename: 'E319',
    aliases: ['tbhq', 'tert-butylhydroquinone', 'e319'],
    tier: 2,
    summary: 'EFSA-acceptable only at strict limits. 2021 study links to immune effects.' },
  { id: 'sodium-nitrite', name: 'Sodium nitrite', ename: 'E250',
    aliases: ['sodium nitrite', 'e250'],
    tier: 1,
    summary: 'Processed meats containing nitrites classified IARC 1 (carcinogenic to humans).' },
  { id: 'sodium-nitrate', name: 'Sodium nitrate', ename: 'E251',
    aliases: ['sodium nitrate', 'e251'],
    tier: 2,
    summary: 'Converts to nitrite in the body. Same processed-meat concerns at scale.' },
  { id: 'sodium-benzoate', name: 'Sodium benzoate', ename: 'E211',
    aliases: ['sodium benzoate', 'e211'],
    tier: 2,
    summary: 'Forms benzene (a known carcinogen) when combined with vitamin C.' },
  { id: 'sulfites', name: 'Sulfites', ename: 'E220',
    aliases: ['sulfite', 'sulphite', 'sulfur dioxide', 'sulphur dioxide', 'sodium metabisulfite', 'potassium metabisulfite', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'],
    tier: 2,
    summary: 'FDA mandatory disclosure threshold of 10 ppm. Triggers asthma in ~1 in 100 asthmatics.' },
  { id: 'potassium-sorbate', name: 'Potassium sorbate', ename: 'E202',
    aliases: ['potassium sorbate', 'e202'],
    tier: 3,
    summary: 'Generally regarded as safe. Skin/eye irritation in concentrated form.' },

  // ── Sweeteners ─────────────────────────────────────────────────
  { id: 'aspartame', name: 'Aspartame', ename: 'E951',
    aliases: ['aspartame', 'e951'],
    tier: 2,
    summary: 'IARC reclassified 2B "possibly carcinogenic" in 2023. JECFA kept ADI at 40 mg/kg.' },
  { id: 'sucralose', name: 'Sucralose', ename: 'E955',
    aliases: ['sucralose', 'e955'],
    tier: 2,
    summary: '2023 study: heat-degraded sucralose forms chloropropanols (genotoxic concern).' },
  { id: 'acesulfame-k', name: 'Acesulfame potassium', ename: 'E950',
    aliases: ['acesulfame', 'acesulfame potassium', 'acesulfame-k', 'ace-k', 'e950'],
    tier: 2,
    summary: 'EFSA flagged data gaps in 2024 re-evaluation. Animal studies inconclusive.' },
  { id: 'saccharin', name: 'Saccharin', ename: 'E954',
    aliases: ['saccharin', 'e954'],
    tier: 3,
    summary: 'Delisted from US carcinogen list in 2000 after rodent-specific mechanism identified.' },
  { id: 'hfcs', name: 'High-fructose corn syrup',
    aliases: ['high fructose corn syrup', 'high-fructose corn syrup', 'hfcs', 'corn syrup, high fructose'],
    tier: 2,
    summary: 'Heavy metabolic literature: insulin resistance, NAFLD, uric acid in high intake.' },

  // ── Flavor enhancers ───────────────────────────────────────────
  { id: 'msg', name: 'MSG', ename: 'E621',
    aliases: ['monosodium glutamate', 'msg', 'e621'],
    tier: 3,
    summary: 'GRAS. "Chinese restaurant syndrome" largely debunked but sensitivity in a subset.' },
  { id: 'disodium-inosinate', name: 'Disodium inosinate', ename: 'E631',
    aliases: ['disodium inosinate', 'e631'],
    tier: 3,
    summary: 'GRAS. Gout/purine-watch consideration; usually paired with MSG.' },
  { id: 'disodium-guanylate', name: 'Disodium guanylate', ename: 'E627',
    aliases: ['disodium guanylate', 'e627'],
    tier: 3,
    summary: 'GRAS. Same purine consideration as inosinate.' },

  // ── Emulsifiers / Stabilizers ──────────────────────────────────
  { id: 'carrageenan', name: 'Carrageenan', ename: 'E407',
    aliases: ['carrageenan', 'e407'],
    tier: 2,
    summary: 'Degraded form (poligeenan) IARC 2B. Food-grade debated for IBD/gut effects.' },
  { id: 'polysorbate-80', name: 'Polysorbate 80', ename: 'E433',
    aliases: ['polysorbate 80', 'e433'],
    tier: 2,
    summary: '2015 Nature study: low-dose polysorbates altered gut microbiome and inflammation in mice.' },
  { id: 'polysorbate-60', name: 'Polysorbate 60', ename: 'E435',
    aliases: ['polysorbate 60', 'e435'],
    tier: 2,
    summary: 'Same emulsifier family as polysorbate 80; same gut microbiome concern.' },
  { id: 'mono-diglycerides', name: 'Mono- and diglycerides',
    aliases: ['mono- and diglycerides', 'mono and diglycerides', 'monoglycerides', 'diglycerides'],
    tier: 2,
    summary: 'Trans-fat regulatory loophole — labeled 0g trans fat regardless of partial hydrogenation.' },
  { id: 'cmc', name: 'Cellulose gum (CMC)', ename: 'E466',
    aliases: ['cellulose gum', 'sodium carboxymethylcellulose', 'carboxymethylcellulose', 'cmc', 'e466'],
    tier: 2,
    summary: '2022 RCT in healthy adults: CMC altered gut microbiota and increased colonic inflammation markers.' },

  // ── Bleaching / Maturing ───────────────────────────────────────
  { id: 'potassium-bromate', name: 'Potassium bromate', ename: 'E924',
    aliases: ['potassium bromate', 'e924'],
    tier: 1,
    summary: 'IARC 2B. Banned in EU, UK, Canada, Brazil, China. CA mandates Prop 65 warning.' },
  { id: 'azodicarbonamide', name: 'Azodicarbonamide', ename: 'E927',
    aliases: ['azodicarbonamide', 'ada', 'e927'],
    tier: 1,
    summary: 'Banned in EU, Australia, Singapore. Forms semicarbazide (animal carcinogen) when baked.' },

  // ── Trans fats / hidden ────────────────────────────────────────
  { id: 'partially-hydrogenated', name: 'Partially hydrogenated oil',
    aliases: ['partially hydrogenated', 'partially-hydrogenated'],
    tier: 1,
    summary: 'Trans fat. FDA banned 2020 but residuals appear in pre-existing inventory and imports.' },
  { id: 'bvo', name: 'Brominated vegetable oil',
    aliases: ['brominated vegetable oil', 'bvo', 'e443'],
    tier: 1,
    summary: 'FDA banned 2024 (effective Aug 2024). Bioaccumulates in body fat.' },

  // ── Phosphates ─────────────────────────────────────────────────
  { id: 'phosphoric-acid', name: 'Phosphoric acid', ename: 'E338',
    aliases: ['phosphoric acid', 'e338'],
    tier: 2,
    summary: 'Cola-grade. High intake associated with reduced bone mineral density.' },
  { id: 'sodium-phosphate', name: 'Sodium phosphate', ename: 'E339',
    aliases: ['sodium phosphate', 'monosodium phosphate', 'disodium phosphate', 'e339'],
    tier: 2,
    summary: 'Excess inorganic phosphate intake linked to cardiovascular calcification in CKD patients.' },

  // ── Sugar alcohols ─────────────────────────────────────────────
  { id: 'erythritol', name: 'Erythritol', ename: 'E968',
    aliases: ['erythritol', 'e968'],
    tier: 2,
    summary: '2023 Cleveland Clinic study: high blood erythritol associated with cardiovascular events.' },
  { id: 'sorbitol', name: 'Sorbitol', ename: 'E420',
    aliases: ['sorbitol', 'e420'],
    tier: 3,
    summary: 'GRAS but FDA mandates "may cause laxative effect" warning above 50 g/day.' },
  { id: 'maltitol', name: 'Maltitol', ename: 'E965',
    aliases: ['maltitol', 'e965'],
    tier: 3,
    summary: 'Sugar alcohol; GI distress at moderate doses, similar to sorbitol.' },

  // ── Hydrogenated / processed markers ───────────────────────────
  { id: 'hydrolyzed-protein', name: 'Hydrolyzed vegetable protein',
    aliases: ['hydrolyzed vegetable protein', 'hydrolysed vegetable protein', 'hvp', 'autolyzed yeast extract'],
    tier: 3,
    summary: 'Free glutamate source — equivalent to MSG for sensitive individuals; no MSG label needed.' },
  { id: 'maltodextrin', name: 'Maltodextrin',
    aliases: ['maltodextrin'],
    tier: 3,
    summary: 'Glycemic index 110+. Spikes blood glucose faster than table sugar.' },

  // ── Aluminum-bearing leaveners ─────────────────────────────────
  { id: 'sodium-aluminum-phosphate', name: 'Sodium aluminum phosphate',
    aliases: ['sodium aluminum phosphate', 'sodium aluminium phosphate', 'e541'],
    tier: 2,
    summary: 'Common leavener; cumulative aluminum intake debated for neurodegenerative concern.' },
  { id: 'sodium-aluminum-sulfate', name: 'Sodium aluminum sulfate',
    aliases: ['sodium aluminum sulfate', 'sodium aluminium sulphate', 'alum'],
    tier: 2,
    summary: 'Same aluminum intake category. EFSA reduced TWI to 1 mg/kg in 2008.' },

  // ── Emulsifier / fat substitute ────────────────────────────────
  { id: 'olestra', name: 'Olestra',
    aliases: ['olestra', 'olean'],
    tier: 1,
    summary: 'FDA-approved 1996 with mandatory GI side-effect warning. Banned in UK and Canada.' },

  // ── Additional restricted dyes ─────────────────────────────────
  { id: 'blue-1', name: 'Blue 1', ename: 'E133',
    aliases: ['blue 1', 'brilliant blue', 'fd&c blue 1', 'e133'],
    tier: 3,
    summary: 'Generally regarded safer than other AFC dyes; minor allergy reports.' },
  { id: 'blue-2', name: 'Blue 2', ename: 'E132',
    aliases: ['blue 2', 'indigo carmine', 'indigotine', 'fd&c blue 2', 'e132'],
    tier: 2,
    summary: 'Mixed animal data; CSPI flags as "avoid" pending further study.' },
  { id: 'green-3', name: 'Green 3', ename: 'E143',
    aliases: ['green 3', 'fast green fcf', 'fd&c green 3', 'e143'],
    tier: 2,
    summary: 'Banned in EU; FDA permits. CSPI rates "avoid".' },
  { id: 'quinoline-yellow', name: 'Quinoline yellow', ename: 'E104',
    aliases: ['quinoline yellow', 'e104'],
    tier: 2,
    summary: 'Banned in US, Australia, Norway. EU mandatory warning label.' },

  // ── Fillers / texturizers (debated) ────────────────────────────
  { id: 'titanium-dioxide', name: 'Titanium dioxide', ename: 'E171',
    aliases: ['titanium dioxide', 'e171'],
    tier: 1,
    summary: 'EU banned 2022 after EFSA could not rule out genotoxicity. Still permitted in US.' },
  { id: 'propylparaben', name: 'Propylparaben',
    aliases: ['propylparaben', 'propyl paraben', 'e216'],
    tier: 2,
    summary: 'Endocrine-disruption signal in animal studies. EWG "high concern".' },

  // ── Other notable ──────────────────────────────────────────────
  { id: 'caffeine-added', name: 'Added caffeine',
    aliases: ['caffeine'],
    tier: 3,
    summary: 'Naturally present in coffee/tea/cocoa; flagged here only when added to non-caffeine foods.' },
  { id: 'natural-flavor', name: 'Natural flavors',
    aliases: ['natural flavor', 'natural flavour', 'natural flavors', 'natural flavours'],
    tier: 3,
    summary: 'Catch-all term — anywhere from one ingredient to dozens; transparency low.' },
  { id: 'caramel-iii', name: 'Caramel color III', ename: 'E150c',
    aliases: ['caramel iii', 'caramel color iii', 'caramel colour iii', 'e150c'],
    tier: 2,
    summary: 'Ammonia process; same 4-MEI byproduct concern as caramel IV at lower levels.' },
  { id: 'silicon-dioxide', name: 'Silicon dioxide', ename: 'E551',
    aliases: ['silicon dioxide', 'e551'],
    tier: 3,
    summary: 'Anticaking agent. EFSA 2018 re-eval found no safety concern at typical use.' },
  { id: 'calcium-disodium-edta', name: 'Calcium disodium EDTA', ename: 'E385',
    aliases: ['calcium disodium edta', 'edta', 'e385'],
    tier: 2,
    summary: 'Chelating preservative; high intake interferes with mineral absorption.' },
];

if (process.env.NODE_ENV !== 'production') {
  const ids = new Set<string>();
  for (const a of ADDITIVES) {
    if (ids.has(a.id)) throw new Error(`duplicate additive id: ${a.id}`);
    ids.add(a.id);
  }
}

export const ADDITIVE_COUNT = ADDITIVES.length;
