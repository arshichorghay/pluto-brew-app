
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";
import { Frown } from "lucide-react";

interface MarketplaceClientViewProps {
  allProducts: Product[];
}

export function MarketplaceClientView({ allProducts }: MarketplaceClientViewProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const filteredProducts = useMemo(() => {
    return searchQuery
      ? allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allProducts;
  }, [searchQuery, allProducts]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-headline">
          {searchQuery ? `Searching for "${searchQuery}"` : "Our Brews"}
        </h1>
        <p className="text-muted-foreground mt-2 md:mt-0">
          {filteredProducts.length} results found
        </p>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <Frown className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold font-headline mb-2">No Brews Found</h2>
          <p className="text-muted-foreground">
            We couldn't find any products matching your search. Try a different term!
          </p>
        </div>
      )}
    </div>
  );
}
