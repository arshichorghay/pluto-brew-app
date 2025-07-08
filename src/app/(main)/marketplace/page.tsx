import { getProducts } from "@/lib/storage";
import { MarketplaceViewLoader } from "@/components/marketplace-view-loader";

export default async function MarketplacePage() {
  const allProducts = await getProducts();

  return (
    <MarketplaceViewLoader allProducts={allProducts} />
  );
}
