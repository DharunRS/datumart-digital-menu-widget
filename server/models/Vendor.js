const mongoose = require("mongoose");

const seoDefaultsSchema = new mongoose.Schema(
  {
    titleTemplate: { type: String, default: "{restaurantName} Menu - {categoryName}" },
    defaultDescription: { type: String, default: "Explore our full menu with fresh, delicious dishes." },
    defaultImage: { type: String, default: "default-og.jpg" },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const widgetConfigSchema = new mongoose.Schema(
  {
    showSearch: { type: Boolean, default: true },
    showRecommendations: { type: Boolean, default: true },
    showVegFilter: { type: Boolean, default: true },
    showStockStatus: { type: Boolean, default: true },
    ctaLabel: { type: String, default: "Order Now" },
    itemsPerPage: { type: Number, default: 12 },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    domain: { type: String, trim: true },
    logo: { type: String, default: "default-logo.png" },
    theme: {
      type: String,
      enum: ["chettinad", "modern", "minimal", "classic", "dark"],
      default: "modern",
    },
    address: { type: String, trim: true },
    cuisine: { type: [String], default: [] },
    currency: { type: String, default: "GBP" },
    currencySymbol: { type: String, default: "£" },
    seoDefaults: { type: seoDefaultsSchema, default: () => ({}) },
    widgetConfig: { type: widgetConfigSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Vendor", vendorSchema);