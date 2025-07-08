import { getProducts } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';

function MarketplaceSkeleton() {
  return (
      <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-24 mt-2 md:mt-0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="space-y-2 pt-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
              </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-28" />
              </div>
          </div>
          ))}
      </div>
      </div>
  );
}

const MarketplaceClientView = dynamic(
  () => import('@/components/marketplace-client-view').then((mod) => mod.MarketplaceClientView),
  {
    loading: () => <MarketplaceSkeleton />,
    ssr: false,
  }
);


export default async function MarketplacePage() {
  const allProducts = await getProducts();

  return (
    <MarketplaceClientView allProducts={allProducts} />
  );
}
