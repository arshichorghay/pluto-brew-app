
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, getUserById } from '@/lib/storage';
import type { Order, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Separator } from '@/components/ui/separator';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    
    const [order, setOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        
        const fetchOrderDetails = async () => {
            setIsLoading(true);
            const fetchedOrder = await getOrderById(orderId);
            setOrder(fetchedOrder);
            if (fetchedOrder) {
                const fetchedUser = await getUserById(fetchedOrder.userId);
                setCustomer(fetchedUser);
            }
            setIsLoading(false);
        };
        
        fetchOrderDetails();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid gap-6">
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                            <CardContent> <Skeleton className="h-24 w-full" /></CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2" /> Back to Orders
                </Button>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold">Order Not Found</h2>
                    <p className="text-muted-foreground">The requested order could not be found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline">Order Details</h1>
                    <p className="text-muted-foreground">Order ID: {order.id}</p>
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>€{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">€{(item.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                             <div className="flex justify-between">
                                <span>Order Date</span>
                                <span>{order.orderDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status</span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>€{order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customer ? (
                                <>
                                    <p className="font-medium">{customer.name}</p>
                                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                                </>
                            ) : (
                                <p>Loading customer...</p>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{order.deliveryAddress}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
