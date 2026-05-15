import { Metadata } from "next";
import MenuWidget from "../../../components/MenuWidget";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getMenuData(vendorSlug: string) {
  try {
    const res = await fetch(`${API}/api/menu/slug/${vendorSlug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ vendorSlug: string }> }
): Promise<Metadata> {
  const { vendorSlug } = await params;
  const data = await getMenuData(vendorSlug);
  if (!data) return { title: "Menu Not Found" };

  const { vendor, categories } = data;
  const topProducts = categories?.[0]?.products?.slice(0, 3).map((p: any) => p.name).join(", ") || "";

  return {
    title: `${vendor.name} Menu - Online Food Menu`,
    description: topProducts
      ? `Explore ${vendor.name} menu. Try our ${topProducts} and more.`
      : `${vendor.name} — Full Online Menu`,
    openGraph: {
      title: `${vendor.name} Digital Menu`,
      description: `Discover dishes at ${vendor.name}`,
      type: "website",
    },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ vendorSlug: string }>;
}) {
  const { vendorSlug } = await params;
  const data = await getMenuData(vendorSlug);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Menu not found</h1>
          <p className="text-gray-500 mt-2">Check the vendor URL and try again.</p>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${data.vendor.name} Digital Menu`,
    provider: {
      "@type": "Restaurant",
      name: data.vendor.name,
      address: data.vendor.address,
      servesCuisine: data.vendor.cuisine,
    },
    hasMenuSection: data.categories.map((cat: any) => ({
      "@type": "MenuSection",
      name: cat.name,
      hasMenuItem: cat.products.map((p: any) => ({
        "@type": "MenuItem",
        name: p.name,
        description: p.description,
        offers: {
          "@type": "Offer",
          price: p.priceDiscounted?.toFixed(2),
          priceCurrency: data.vendor.currency || "GBP",
        },
      })),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MenuWidget initialData={data} vendorSlug={vendorSlug} />
    </>
  );
}