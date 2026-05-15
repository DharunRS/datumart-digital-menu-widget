const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "default.jpg" },
    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

categorySchema.index({ vendorId: 1, isPublished: 1, isDeleted: 1 });
categorySchema.index({ vendorId: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);