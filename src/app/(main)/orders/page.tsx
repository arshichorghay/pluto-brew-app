
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getOrders } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

function OrdersSkeleton() {
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-9 w-16" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default function OrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const router = useRouter();

  // Effect to handle redirection if user is not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/');
    }
  }, [isAuthLoading, user, router]);

  // Effect to fetch orders only when a user is confirmed
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        const orders = await getOrders();
        setUserOrders(orders.filter(order => order.userId === user.id));
        setIsLoadingOrders(false);
      };
      fetchOrders();
    }
  }, [user]); // This effect depends only on the user object

  // Show a skeleton while auth is loading or if there's no user (during redirect)
  if (isAuthLoading || !user) {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl md:text-4xl font-headline mb-8">Your Orders</h1>
            <OrdersSkeleton />
        </div>
    );
  }

  // Auth is complete, user is logged in. Render the orders.
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-headline mb-8">Your Orders</h1>
      <div className="border rounded-lg">
        <Table>
          {!isLoadingOrders && userOrders.length === 0 && (
            <TableCaption>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't placed any orders with us. Let's change that!</p>
                    <Button asChild>
                        <Link href="/marketplace">Browse Beers</Link>
                    </Button>
                </div>
            </TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingOrders ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-16" /></TableCell>
                    </TableRow>
                ))
            ) : (
                userOrders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>
                    <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                    €{order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/orders/${order.id}`}>View</Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
