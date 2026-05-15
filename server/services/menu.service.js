const Vendor = require("../models/Vendor");
const Category = require("../models/Category");
const Product = require("../models/Product");

const getFullMenu = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor) throw new Error("Vendor not found");

  const categories = await Category.find({
    vendorId,
    isPublished: true,
    isDeleted: false,
  }).sort({ sortOrder: 1 }).lean();

  const products = await Product.find({
    vendorId,
    isPublished: true,
    isDeleted: false,
  }).lean();

  const productsByCategory = {};
  products.forEach((p) => {
    const key = p.categoryId.toString();
    if (!productsByCategory[key]) productsByCategory[key] = [];
    productsByCategory[key].push({
      ...p,
      inStock: p.currentStock > 0,
      hasDiscount: p.priceDiscount > 0,
    });
  });

  const menuSections = categories.map((cat) => ({
    ...cat,
    products: productsByCategory[cat._id.toString()] || [],
  }));

  return {
    vendor: {
      _id: vendor._id,
      name: vendor.name,
      slug: vendor.slug,
      logo: vendor.logo,
      theme: vendor.theme,
      currency: vendor.currency,
      currencySymbol: vendor.currencySymbol,
      address: vendor.address,
      cuisine: vendor.cuisine,
    },
    seoDefaults: vendor.seoDefaults,
    widgetConfig: vendor.widgetConfig,
    categories: menuSections,
    totalProducts: products.length,
  };
};

const getVendorBySlug = async (slug) => {
  return Vendor.findOne({ slug, isActive: true }).lean();
};

module.exports = { getFullMenu, getVendorBySlug };