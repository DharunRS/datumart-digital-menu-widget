const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    image: { type: String, default: "default-product.jpg" },
    isVeg: { type: Boolean, default: false },
    isNonVeg: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0 },
    storePrice: { type: Number, default: 0 },
    priceDiscount: { type: Number, default: 0 },
    priceDiscounted: { type: Number, default: 0 },
    openingStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    spiceLevel: {
      type: String,
      enum: ["none", "mild", "medium", "hot", "extra-hot", ""],
      default: "",
    },
    mealType: {
      type: [String],
      default: [],
      enum: ["starter", "main", "dessert", "drink", "side", "sharing", "kids"],
    },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  this.priceDiscounted = this.priceDiscount > 0
    ? Math.max(0, this.price - this.priceDiscount)
    : this.price;
  next();
});

productSchema.virtual("inStock").get(function () {
  return this.currentStock > 0;
});

productSchema.index({ vendorId: 1, categoryId: 1 });
productSchema.index({ vendorId: 1, isPublished: 1, isDeleted: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);