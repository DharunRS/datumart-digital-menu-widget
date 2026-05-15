"use client";
import { useState } from "react";
import Image from "next/image"; // Import the optimized Image component

export default function ProductCard({ product, vendor, ctaLabel = "Order Now" }: {
  product: any;
  vendor: any;
  ctaLabel?: string;
}) {
  const symbol = vendor?.currencySymbol || "£";
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow ${!product.inStock ? "opacity-60" : ""}`}>
      
      {/* Product Image Container */}
      <div className="h-44 relative overflow-hidden bg-orange-50">
        {!imgError && product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill // This replaces w-full h-full
            className="object-cover transition-transform hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={product.isFeatured} // Boosts score: Loads featured items faster
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <span className="text-5xl">{getFoodEmoji(product.name)}</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {product.hasDiscount && (
          <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            -{symbol}{product.priceDiscount?.toFixed(2)} OFF
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 z-10 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Veg/Non-veg + Name */}
        <div className="flex items-start gap-2 mb-1">
          <span
            className={`mt-1 flex-shrink-0 w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${product.isVeg ? "border-green-600" : "border-red-600"}`}
            title={product.isVeg ? "Vegetarian" : "Non-Vegetarian"}
          >
            <span className={`w-2 h-2 rounded-sm ${product.isVeg ? "bg-green-600" : "bg-red-600"}`} />
          </span>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>

        {/* Spice level */}
        {product.spiceLevel && product.spiceLevel !== "none" && product.spiceLevel !== "" && (
          <span className="inline-block bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full mb-3 w-fit capitalize">
            🌶 {product.spiceLevel}
          </span>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              {symbol}{product.priceDiscounted?.toFixed(2)}
            </span>
            {product.hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {symbol}{product.price?.toFixed(2)}
              </span>
            )}
          </div>
          <button
            disabled={!product.inStock}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {product.inStock ? ctaLabel : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getFoodEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("samosa")) return "🥟";
  if (n.includes("paneer")) return "🧀";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("biryani")) return "🍚";
  if (n.includes("dosa")) return "🫓";
  if (n.includes("naan") || n.includes("bread") || n.includes("parotta")) return "🫓";
  if (n.includes("soup") || n.includes("dal")) return "🍲";
  if (n.includes("prawn") || n.includes("fish")) return "🦐";
  if (n.includes("kebab") || n.includes("seekh")) return "🍢";
  if (n.includes("lassi") || n.includes("drink") || n.includes("chai")) return "🥤";
  if (n.includes("gulab") || n.includes("rasmalai") || n.includes("dessert")) return "🍮";
  if (n.includes("idli")) return "🍥";
  if (n.includes("mushroom")) return "🍄";
  if (n.includes("gobi") || n.includes("cauliflower")) return "🥦";
  if (n.includes("onion")) return "🧅";
  return "🍽️";
}