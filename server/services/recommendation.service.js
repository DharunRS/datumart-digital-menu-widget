const MenuIndex = require("../models/MenuIndex");

const getRecommendations = async (vendorId, productId) => {
  const source = await MenuIndex.findOne({ vendorId, productId }).lean();
  if (!source) return [];

  const all = await MenuIndex.find({ vendorId, inStock: true, productId: { $ne: source.productId } }).lean();

  const scored = all.map((item) => {
    let score = 0;
    const reasons = [];

    if (item.categoryId?.toString() === source.categoryId?.toString()) { score += 0.4; reasons.push(`same category (${source.categoryName})`); }
    if (item.isVeg === source.isVeg) { score += 0.2; reasons.push(source.isVeg ? "both vegetarian" : "both non-veg"); }
    if (Math.abs(item.price - source.price) <= 2) { score += 0.2; reasons.push("similar price"); }
    if (item.spiceLevel === source.spiceLevel && source.spiceLevel) { score += 0.1; reasons.push("same spice level"); }
    if (item.mealType.some((m) => source.mealType.includes(m))) { score += 0.1; reasons.push("same meal type"); }

    return {
      productId: item.productId,
      name: item.productName,
      price: item.price,
      isVeg: item.isVeg,
      score: Math.round(score * 100) / 100,
      reason: reasons.length > 0 ? `Recommended: ${reasons.join(", ")}.` : "You may also like this.",
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
};

module.exports = { getRecommendations };