const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.get("/:vendorId", async (req, res, next) => {
  try {
    const categories = await Category.find({
      vendorId: req.params.vendorId,
      isPublished: true,
      isDeleted: false,
    }).sort({ sortOrder: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

module.exports = router;