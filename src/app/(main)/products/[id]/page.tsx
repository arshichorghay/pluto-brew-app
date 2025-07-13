
import { getProductById, getProducts } from "@/lib/storage";
import { ProductDetailView } from "@/components/product-detail-view";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div className="grid gap-4 items-start">
                    <Skeleton className="aspect-square w-full rounded-lg overflow-hidden" />
                </div>
                <div className="grid gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-3/4" />
                        <div className="flex items-center gap-4">
                           <Skeleton className="h-5 w-28" />
                           <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-8 w-24 mt-2" />
                    </div>
                    <div className="space-y-2 mt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Skeleton className="h-px w-full my-4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-12 w-full mt-2" />
                </div>
            </div>
        </div>
    );
}

export async function generateStaticParams() {
  const products = await getProducts();
 
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
     return (
        <div className="container mx-auto py-8 text-center">
            <h2 className="text-2xl font-bold font-headline mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
    );
  }

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailView product={product} />
    </Suspense>
  );
}
