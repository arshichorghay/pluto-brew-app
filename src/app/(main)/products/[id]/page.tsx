
"use client";

import { useEffect, useState } from 'react';
import { getProductById } from "@/lib/storage";
import { ProductDetailView } from "@/components/product-detail-view";
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const fetchedProduct = await getProductById(params.id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div className="grid gap-4 items-start">
                    <Skeleton className="aspect-square w-full max-w-[480px] rounded-lg" />
                </div>
                <div className="grid gap-4 md:gap-6">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-8 w-1/4" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-1/2" />
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
     return (
        <div className="container mx-auto py-8 text-center">
            <h2 className="text-2xl font-bold font-headline mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
    );
  }

  return <ProductDetailView product={product} />;
}
