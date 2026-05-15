const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/:vendorId", async (req, res, next) => {
  try {
    const { categoryId, isVeg, isNonVeg, maxPrice, inStock } = req.query;
    const filter = {
      vendorId: req.params.vendorId,
      isPublished: true,
      isDeleted: false,
    };
    if (categoryId) filter.categoryId = categoryId;
    if (isVeg === "true") filter.isVeg = true;
    if (isNonVeg === "true") filter.isNonVeg = true;
    if (maxPrice) filter.priceDiscounted = { $lte: parseFloat(maxPrice) };
    if (inStock === "true") filter.currentStock = { $gt: 0 };

    const products = await Product.find(filter).lean();
    const mapped = products.map((p) => ({
      ...p,
      inStock: p.currentStock > 0,
      hasDiscount: p.priceDiscount > 0,
    }));
    res.json({ success: true, data: mapped });
  } catch (err) { next(err); }
});

router.get("/:vendorId/:productId", async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendorId: req.params.vendorId,
    }).populate("categoryId", "name slug").lean();
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: { ...product, inStock: product.currentStock > 0 } });
  } catch (err) { next(err); }
});

module.exports = router;