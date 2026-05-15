const Fuse = require("fuse.js");
const MenuIndex = require("../models/MenuIndex");

const INTENT_MAPS = {
  dietary: {
    veg: ["veg", "vegetarian", "meatless", "plant", "no meat"],
    "non-veg": ["non veg", "nonveg", "chicken", "lamb", "prawn", "meat", "fish"],
  },
  taste: {
    spicy: ["spicy", "hot", "fiery", "chilli", "chili", "spice"],
    mild: ["mild", "light", "not spicy"],
    crispy: ["crispy", "crunchy", "fried", "golden"], // added 'rispy' for typo tolerance
    sweet: ["sweet", "dessert", "sugar", "syrup"],
  },
  course: {
    starter: ["starter", "snack", "appetiser", "appetizer", "bite"],
    main: ["main", "curry", "rice", "biryani", "dosa", "meal"],
    dessert: ["dessert", "sweet", "pudding"],
    drink: ["drink", "juice", "lassi", "chai", "tea"],
    side: ["side", "bread", "naan", "roti"],
  },
  budget: {
    budget: ["cheap", "budget", "affordable", "low cost", "value", "under 5", "under 6", "under 7", "under 8"],
    premium: ["premium", "special", "luxury", "signature"],
  },
};

const extractIntentTags = (query) => {
  const q = query.toLowerCase();
  const tags = [];
  for (const [, map] of Object.entries(INTENT_MAPS)) {
    for (const [tag, keywords] of Object.entries(map)) {
      if (keywords.some((kw) => q.includes(kw))) tags.push(tag);
    }
  }
  const priceMatch = q.match(/under\s+[£$]?(\d+)/i);
  const maxPrice = priceMatch ? parseFloat(priceMatch[1]) : null;
  return { tags, maxPrice };
};

const scoreProduct = (item, intentTags, maxPrice) => {
  let score = 0;
  const reasons = [];

  if (intentTags.includes("veg") && item.isVeg) { score += 0.2; reasons.push("vegetarian"); }
  if (intentTags.includes("non-veg") && item.isNonVeg) { score += 0.2; reasons.push("non-vegetarian"); }
  if (intentTags.includes("spicy") && ["hot", "extra-hot"].includes(item.spiceLevel)) { score += 0.15; reasons.push("spicy"); }
  if (intentTags.includes("mild") && ["none", "mild"].includes(item.spiceLevel)) { score += 0.15; reasons.push("mild"); }
  if (intentTags.includes("crispy") && (item.productName.toLowerCase().includes("fry") || item.productName.toLowerCase().includes("65"))) { score += 0.15; reasons.push("crispy texture"); }
  if (intentTags.includes("starter") && item.mealType.includes("starter")) { score += 0.2; reasons.push("starter"); }
  if (intentTags.includes("main") && item.mealType.includes("main")) { score += 0.2; reasons.push("main course"); }
  if (intentTags.includes("dessert") && item.mealType.includes("dessert")) { score += 0.2; reasons.push("dessert"); }
  if (intentTags.includes("budget") && item.price <= 7) { score += 0.1; reasons.push("budget-friendly"); }
  if (maxPrice && item.price <= maxPrice) { score += 0.15; reasons.push(`under £${maxPrice}`); }
  
  if (!item.inStock) score -= 0.5;

  return { score, reasons };
};

const nlpSearch = async (vendorId, query) => {
  if (!query?.trim()) return { query: "", intentTags: [], results: [], recommendations: [], fallback: true };

  const allIndexed = await MenuIndex.find({ vendorId }).lean();
  if (!allIndexed.length) return { query, intentTags: [], results: [], recommendations: [], fallback: true };

  // --- UPDATED FUSE CONFIGURATION ---
  const fuse = new Fuse(allIndexed, {
    keys: ["searchableText", "productName", "categoryName", "keywords"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true, // Crucial for multi-keyword processing
  });

  // Convert comma-separated or space-separated list into a Fuse OR query
  // Turns "potato, sweet" into "'potato | 'sweet"
  const searchPattern = query
    .split(/[\s,]+/)
    .filter(term => term.length >= 2)
    .map(term => `'${term}`) 
    .join(' | ');

  const fuseResults = fuse.search(searchPattern || query);
  const { tags: intentTags, maxPrice } = extractIntentTags(query);

  const scored = fuseResults.map(({ item, score: fuseScore }) => {
    const { score: intentScore, reasons } = scoreProduct(item, intentTags, maxPrice);
    
    // Logic: Higher weight to keyword match (1-fuseScore) while adding Intent points
    const combinedScore = Math.min(1, (1 - fuseScore) * 0.5 + intentScore * 0.5);
    
    return {
      productId: item.productId,
      name: item.productName,
      categoryName: item.categoryName,
      price: item.price,
      isVeg: item.isVeg,
      inStock: item.inStock,
      score: Math.round(combinedScore * 100) / 100,
      reason: reasons.length > 0 ? `Matches ${reasons.join(", ")}.` : "Keyword match.",
    };
  });

  // Lowered threshold slightly to be more inclusive of broad searches
  const results = scored
    .filter((r) => r.score > 0.15) 
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  let recommendations = [];
  if (results.length > 0) {
    const topDoc = allIndexed.find((d) => d.productId.toString() === results[0].productId.toString());
    if (topDoc) {
      recommendations = allIndexed
        .filter((d) => {
          const sameCategory = d.categoryId?.toString() === topDoc.categoryId?.toString();
          const sameDiet = (topDoc.isVeg && d.isVeg) || (topDoc.isNonVeg && d.isNonVeg);
          return d.productId.toString() !== topDoc.productId.toString() && d.inStock && (sameCategory || sameDiet);
        })
        .slice(0, 3)
        .map((d) => ({
          productId: d.productId,
          name: d.productName,
          price: d.price,
          reason: `Similar ${topDoc.isVeg ? "vegetarian" : ""} ${d.categoryName} option.`,
        }));
    }
  }

  return {
    query,
    intentTags,
    results,
    recommendations,
    fallback: results.length === 0,
    fallbackMessage: results.length === 0 ? "No exact match found. Try searching for 'spicy' or 'budget'." : null,
  };
};

module.exports = { nlpSearch, extractIntentTags };