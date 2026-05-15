const mongoose = require("mongoose");

const menuIndexSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    productName: { type: String, required: true },
    categoryName: { type: String, required: true },
    price: { type: Number, required: true },
    isVeg: { type: Boolean, default: false },
    isNonVeg: { type: Boolean, default: false },
    spiceLevel: { type: String, default: "" },
    mealType: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    searchableText: { type: String, required: true },
    keywords: { type: [String], default: [] },
    popularityScore: { type: Number, default: 0 },
    embedding: { type: [Number], default: [] },
  },
  { timestamps: true }
);

menuIndexSchema.index({ vendorId: 1 });
menuIndexSchema.index({ vendorId: 1, productId: 1 }, { unique: true });
menuIndexSchema.index({ searchableText: "text" });

module.exports = mongoose.model("MenuIndex", menuIndexSchema);