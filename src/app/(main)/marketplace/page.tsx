
import { getProducts } from "@/lib/storage";
import { MarketplaceClientView } from "@/components/marketplace-client-view";

export default async function MarketplacePage() {
  const allProducts = await getProducts();

  return <MarketplaceClientView allProducts={allProducts} />;
}
