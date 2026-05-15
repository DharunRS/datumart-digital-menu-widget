require("dotenv").config();
const { connectDB } = require("../config/db");
const Vendor = require("../models/Vendor");
const Category = require("../models/Category");
const Product = require("../models/Product");
const MenuIndex = require("../models/MenuIndex");
const { vendor, categories, products } = require("./seedData");

const buildSearchableText = (product, categoryName) => {
  return [
    product.name,
    product.description,
    categoryName,
    product.tags.join(" "),
    product.spiceLevel,
    product.isVeg ? "veg vegetarian" : "",
    product.isNonVeg ? "non veg meat" : "",
    product.mealType.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const seed = async () => {
  await connectDB();

  console.log("🗑️  Clearing existing data...");
  await Vendor.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await MenuIndex.deleteMany({});

  console.log("🏪 Inserting vendor...");
  const savedVendor = await Vendor.create(vendor);
  const vendorId = savedVendor._id;

  console.log("📂 Inserting categories...");
  const categoryRefMap = {};

  for (const cat of categories) {
    if (!cat._parentRef) {
      const { _ref, _parentRef, ...catData } = cat;
      const saved = await Category.create({ ...catData, vendorId });
      categoryRefMap[_ref] = saved._id;
    }
  }

  for (const cat of categories) {
    if (cat._parentRef) {
      const { _ref, _parentRef, ...catData } = cat;
      const saved = await Category.create({
        ...catData,
        vendorId,
        parentId: categoryRefMap[_parentRef],
      });
      categoryRefMap[_ref] = saved._id;
    }
  }

  console.log("🍽️  Inserting products and building NLP index...");
  const categoryDocs = await Category.find({ vendorId });
  const categoryNameMap = {};
  categoryDocs.forEach((c) => (categoryNameMap[c._id.toString()] = c.name));

  for (const product of products) {
    const { _categoryRef, ...productData } = product;
    const categoryId = categoryRefMap[_categoryRef];

    const savedProduct = await Product.create({ ...productData, vendorId, categoryId });

    const categoryName = categoryNameMap[categoryId.toString()] || "";
    const searchableText = buildSearchableText(product, categoryName);

    await MenuIndex.create({
      vendorId,
      productId: savedProduct._id,
      categoryId,
      productName: product.name,
      categoryName,
      price: product.priceDiscounted || product.price,
      isVeg: product.isVeg,
      isNonVeg: product.isNonVeg,
      spiceLevel: product.spiceLevel,
      mealType: product.mealType,
      inStock: product.currentStock > 0,
      searchableText,
      keywords: searchableText.split(" ").filter((w) => w.length > 2),
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   Vendor:     1`);
  console.log(`   Categories: ${await Category.countDocuments()}`);
  console.log(`   Products:   ${await Product.countDocuments()}`);
  console.log(`   MenuIndex:  ${await MenuIndex.countDocuments()}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});