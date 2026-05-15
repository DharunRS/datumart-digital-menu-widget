const express = require("express");
const router = express.Router();
const { getFullMenu, getVendorBySlug } = require("../services/menu.service");
const { nlpSearch } = require("../services/nlpSearch.service");
const { getRecommendations } = require("../services/recommendation.service");
const Vendor = require("../models/Vendor");
const Category = require("../models/Category");
const Product = require("../models/Product");

// GET /api/menu/:vendorId
router.get("/:vendorId", async (req, res, next) => {
  try {
    const data = await getFullMenu(req.params.vendorId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/menu/slug/:vendorSlug
router.get("/slug/:vendorSlug", async (req, res, next) => {
  try {
    const vendor = await getVendorBySlug(req.params.vendorSlug);
    if (!vendor) return res.status(404).json({ success: false, error: "Vendor not found" });
    const data = await getFullMenu(vendor._id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/menu/:vendorId/search?q=
router.get("/:vendorId/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: "Query param q is required" });
    const results = await nlpSearch(req.params.vendorId, q);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// GET /api/menu/:vendorId/recommendations?productId=
router.get("/:vendorId/recommendations", async (req, res, next) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ success: false, error: "productId is required" });
    const results = await getRecommendations(req.params.vendorId, productId);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

module.exports = router;