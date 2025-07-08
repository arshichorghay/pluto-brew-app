
import { ProductCard } from "@/components/product-card";
import { mockProducts } from "@/lib/mock-data-defaults";

export default function MarketplacePage() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-headline mb-6">Our Brews</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
