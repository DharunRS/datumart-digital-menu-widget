const mongoose = require("mongoose");

const menuEventSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "menu_view",
        "category_click",
        "product_view",
        "search",
        "recommendation_click",
        "cta_click",
        "filter_apply",
      ],
    },
    query: {
      type: String,
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false },
  }
);

menuEventSchema.index({ vendorId: 1, eventType: 1 });
menuEventSchema.index({ vendorId: 1, productId: 1, eventType: 1 });
menuEventSchema.index({ sessionId: 1 });
menuEventSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 }
);

module.exports = mongoose.model("MenuEvent", menuEventSchema);