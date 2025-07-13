
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

function CartSkeleton() {
    return (
        <div className="container mx-auto py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start">
                <div className="grid gap-6">
                    <Skeleton className="h-[134px] w-full" />
                    <Skeleton className="h-[134px] w-full" />
                </div>
                <div className="grid gap-6">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[480px] w-full" />
                </div>
            </div>
        </div>
    );
}

const CartView = dynamic(
  () => import('@/components/cart-view').then((mod) => mod.CartView),
  {
    loading: () => <CartSkeleton />,
    ssr: false,
  }
);


export default function CartPage() {
    return (
        <CartView />
    );
}
