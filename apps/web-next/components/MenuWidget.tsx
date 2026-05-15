"use client";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "./ProductCard";
import MenuSearch from "./MenuSearch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function MenuWidget({ initialData, vendorSlug }: { initialData: any; vendorSlug: string }) {
  const [data] = useState(initialData);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const vendor = data?.vendor;
  const categories = data?.categories || [];
  const widgetConfig = data?.widgetConfig || {};

  // Only top-level categories shown as main tabs
  const topLevel = categories.filter((c: any) => !c.parentId);

  useEffect(() => {
    if (topLevel.length > 0 && !activeCategory) {
      setActiveCategory(topLevel[0]._id);
    }
  }, [categories]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults(null); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`${API}/api/menu/${vendor._id}/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setSearchResults(json.data);
    } catch { setSearchResults(null); }
    finally { setIsSearching(false); }
  }, [vendor]);

  // Get products for active category — includes child category products
  const getDisplayProducts = () => {
    if (searchResults) return [];

    const activeCat = categories.find((c: any) => c._id === activeCategory);
    if (!activeCat) return [];

    // Check if this category has children
    const childCategories = categories.filter(
      (c: any) => c.parentId?.toString() === activeCat._id?.toString()
    );

    let products = [];

    if (childCategories.length > 0) {
      // Parent category — collect products from ALL child categories
      const childIds = childCategories.map((c: any) => c._id?.toString());
      products = categories
        .filter((c: any) => childIds.includes(c._id?.toString()))
        .flatMap((c: any) => c.products || []);
    } else {
      // Leaf category — show its own products directly
      products = activeCat.products || [];
    }

    if (vegOnly) products = products.filter((p: any) => p.isVeg);
    return products;
  };

  const displayProducts = getDisplayProducts();

  // Get sub-categories of currently active category
  const getSubCategories = () => {
    const activeCat = categories.find((c: any) => c._id === activeCategory);
    if (!activeCat) return [];
    return categories.filter(
      (c: any) => c.parentId?.toString() === activeCat._id?.toString()
    );
  };

  const subCategories = getSubCategories();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* ── Header ── */}
<div className="bg-emerald-800 rounded-2xl shadow-sm p-5 mb-4">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 className="text-2xl font-bold text-white">{vendor?.name}</h1>
      {vendor?.cuisine?.length > 0 && (
        <p className="text-sm text-emerald-200 mt-0.5">{vendor.cuisine.join(" · ")}</p>
      )}
    </div>

    <div className="flex items-center gap-3 flex-wrap">
      {/* Search bar */}
      <div className="relative">
        <MenuSearch onSearch={handleSearch} isSearching={isSearching} />
      </div>

      {/* Veg only toggle button */}
      {widgetConfig.showVegFilter && (
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors whitespace-nowrap
            ${vegOnly
              ? "bg-yellow-400 border-yellow-400 text-emerald-900"
              : "bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-emerald-900"
            }`}
        >
          Veg only
        </button>
      )}
    </div>
  </div>
</div>

      {/* ── Search Results ── */}
      {searchResults && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">
              {searchResults.fallback
                ? searchResults.fallbackMessage
                : `Results for "${searchQuery}"`}
            </h2>
            <button
              onClick={() => { setSearchResults(null); setSearchQuery(""); }}
              className="text-sm text-orange-600 hover:underline"
            >
              Clear search
            </button>
          </div>

          {/* Intent tags */}
          {searchResults.intentTags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {searchResults.intentTags.map((tag: string) => (
                <span key={tag} className="bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Search result cards */}
          {searchResults.results?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.results.map((result: any) => {
                const allProducts = categories.flatMap((c: any) => c.products || []);
                const product = allProducts.find(
                  (p: any) => p._id?.toString() === result.productId?.toString()
                );
                if (!product) return null;
                return (
                  <div key={result.productId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-3 h-3 rounded-full ${product.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                      <span className="text-xs text-gray-500">{result.categoryName}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    <p className="text-xs text-orange-600 mt-1 italic">{result.reason}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-gray-900">
                        {vendor.currencySymbol}{product.priceDiscounted?.toFixed(2)}
                      </span>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        {widgetConfig.ctaLabel || "Order Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No items found for "{searchQuery}"</p>
              <p className="text-sm text-gray-400 mt-1">Try "veg starter", "spicy chicken" or "dessert"</p>
            </div>
          )}

          {/* Recommendations */}
          {searchResults.recommendations?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3">You may also like</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {searchResults.recommendations.map((rec: any) => (
                  <div key={rec.productId} className="flex-shrink-0 bg-white border border-gray-100 rounded-xl p-3 w-52 shadow-sm">
                    <p className="font-medium text-sm text-gray-900">{rec.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                    <p className="text-orange-600 font-semibold text-sm mt-2">
                      {vendor.currencySymbol}{rec.price?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Category Tabs + Products ── */}
      {!searchResults && (
        <>
          {/* Main category tabs */}
<div className="flex gap-2 overflow-x-auto pb-1 mb-2">
  {topLevel.map((cat: any) => (
    <button
      key={cat._id}
      onClick={() => setActiveCategory(cat._id)}
      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors whitespace-nowrap
        ${activeCategory === cat._id
          ? "bg-emerald-700 border-emerald-700 text-white"
          : "bg-white border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white"
        }`}
    >
      {cat.name}
    </button>
  ))}
</div>

          {/* Sub-category labels — shown when active category has children */}
          {subCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
              {subCategories.map((sub: any) => (
                <span
                  key={sub._id}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 whitespace-nowrap"
                >
                  {sub.name} ({sub.products?.length || 0})
                </span>
              ))}
            </div>
          )}

          {/* Products grid */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {displayProducts.map((product: any) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  vendor={vendor}
                  ctaLabel={widgetConfig.ctaLabel || "Order Now"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl mt-4 border border-gray-100">
              <p className="text-gray-500">
                {vegOnly ? "No vegetarian items in this category." : "No items available."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}