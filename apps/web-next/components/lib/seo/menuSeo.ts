export interface SeoOutput {
  title: string;
  description: string;
  canonicalUrl: string;
  openGraph: Record<string, string>;
  jsonLd: object;
}

export const generateMenuSEO = (
  vendor: any,
  activeCategory: any = null,
  products: any[] = []
): SeoOutput => {
  const categoryName = activeCategory?.name || "Full Menu";
  const domain = vendor.domain || "datumart.co.uk";
  const title = `${vendor.name} Menu - ${categoryName}`;
  const topItems = products.slice(0, 3).map((p: any) => p.name).join(", ");
  const description = topItems
    ? `Explore ${categoryName} at ${vendor.name}. Try our ${topItems} and more.`
    : `${vendor.name} — Full Online Menu`;

  const canonicalUrl = `https://${domain}/menu/${vendor.slug}${activeCategory?.slug ? `/${activeCategory.slug}` : ""}`;
  const ogImage = products[0]?.image || "default-og.jpg";
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `https://${domain}/images/${ogImage}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${vendor.name} Digital Menu`,
    url: canonicalUrl,
    provider: {
      "@type": "Restaurant",
      name: vendor.name,
      address: vendor.address || "",
      servesCuisine: vendor.cuisine || [],
    },
    ...(activeCategory && products.length > 0 && {
      hasMenuSection: [{
        "@type": "MenuSection",
        name: activeCategory.name,
        hasMenuItem: products.map((p: any) => ({
          "@type": "MenuItem",
          name: p.name,
          description: p.description || "",
          offers: {
            "@type": "Offer",
            price: p.priceDiscounted?.toFixed(2) || p.price?.toFixed(2),
            priceCurrency: vendor.currency || "GBP",
          },
        })),
      }],
    }),
  };

  return {
    title,
    description,
    canonicalUrl,
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:image": ogImageUrl,
      "og:url": canonicalUrl,
      "og:type": "website",
    },
    jsonLd,
  };
};