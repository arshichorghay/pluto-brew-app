
import { getOrderById, getOrders } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderStatusBadge } from '@/components/order-status-badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '@/lib/types';
import { notFound } from 'next/navigation';


export async function generateStaticParams() {
    const orders = await getOrders();
    return orders.map((order) => ({
      id: order.id,
    }));
}

export default async function CustomerOrderDetailsPage({ params }: { params: { id: string } }) {
    const order: Order | null = await getOrderById(params.id);

    if (!order) {
        notFound();
    }
    
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/orders"><ArrowLeft /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-headline">Order Details</h1>
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
                                        <TableHead className="text-center">Quantity</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">€{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-medium">€{(item.price * item.quantity).toFixed(2)}</TableCell>
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
                        <CardContent className="grid gap-4">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Date</span>
                                <span>{order.orderDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Paid</span>
                                <span>€{order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{order.deliveryAddress}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
