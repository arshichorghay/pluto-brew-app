
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"  
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { OrderStatus, Order, User } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { getOrders, getUsers, updateOrderStatus } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';

const orderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const fetchAllData = async () => {
        const [fetchedOrders, fetchedUsers] = await Promise.all([getOrders(), getUsers()]);
        setOrders(fetchedOrders);
        setUsers(fetchedUsers);
        setIsLoading(false);
    }

    useEffect(() => {
        setIsLoading(true);
        fetchAllData();
    }, []);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateOrderStatus(orderId, newStatus);
        const updatedOrders = await getOrders(); // Re-fetch orders to update state
        setOrders(updatedOrders);
        toast({
            title: "Order Status Updated",
            description: `Order ${orderId} is now ${newStatus}.`
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Orders</CardTitle>
        <CardDescription>View and manage customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-[120px]" />
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                orders.map((order) => (
                <TableRow key={order.id} onClick={() => router.push(`/admin/dashboard/orders/${order.id}`)} className="cursor-pointer">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{getUserName(order.userId)}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>€{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                        <OrderStatusBadge status={order.status}/>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select defaultValue={order.status} onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}>
                            <SelectTrigger className="w-[120px] h-9">
                                <SelectValue placeholder="Update..." />
                            </SelectTrigger>
                            <SelectContent>
                                {orderStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
