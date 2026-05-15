const express = require("express");
const router = express.Router();
const { nlpSearch } = require("../services/nlpSearch.service");

// GET /api/search/:vendorId?q=spicy veg starter
router.get("/:vendorId", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: "Query param q is required" });
    const results = await nlpSearch(req.params.vendorId, q);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

module.exports = router;