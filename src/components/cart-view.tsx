
"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { LocationSelector } from "@/components/location-selector";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LocationInfo, NewOrder } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { mockProducts } from "@/lib/mock-data-defaults";
import { addOrder } from "@/lib/storage";

export function CartView() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const shippingFee = (locationInfo?.type === 'delivery' && cartTotal > 0) ? 5.00 : 0;
  const total = cartTotal + shippingFee;

  const handleCheckout = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not logged in!",
            description: "You must be logged in to place an order.",
          });
        return;
    }
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Your cart is empty!",
        description: "Please add items to your cart before placing an order.",
      });
      return;
    }
    if (!locationInfo) {
      toast({
        variant: "destructive",
        title: "No location selected!",
        description: "Please select a pickup or delivery location.",
      });
      return;
    }

    const newOrder: NewOrder = {
        userId: user.id,
        items: cartItems,
        total: total,
        status: 'Pending',
        orderDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
        deliveryAddress: locationInfo.address,
        sourceStoreId: locationInfo.location.id,
    };

    await addOrder(newOrder);
    clearCart();
    setShowThankYouDialog(true);
  }

  const handleDemoOrder = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not logged in!",
            description: "You must be logged in to place a demo order.",
          });
        return;
    }
    const demoItems = [
        { ...mockProducts[1], quantity: 2 },
        { ...mockProducts[4], quantity: 1 },
    ];
    const demoTotal = demoItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const demoOrder: NewOrder = {
        userId: user.id,
        items: demoItems,
        total: demoTotal,
        status: 'Processing',
        orderDate: new Date().toLocaleDateString('en-CA'),
        deliveryAddress: '123 Demo Street, Suite 42, Faketopia',
        sourceStoreId: '1',
    };

    const placedOrder = await addOrder(demoOrder);
    toast({ title: "Demo Order Created!", description: `Order #${placedOrder.id} has been added to your orders.` });
    router.push('/orders');
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl md:text-4xl font-headline mb-8">Your Cart</h1>
        <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="grid gap-6">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-start gap-4">
                  <Image
                    alt={item.name}
                    className="aspect-square rounded-md object-cover"
                    height={100}
                    src={item.imageUrl || 'https://placehold.co/100x100.png'}
                    width={100}
                    data-ai-hint={item['data-ai-hint']}
                  />
                  <div className="grid gap-1.5 flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-semibold text-lg ml-auto">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
              ))
            ) : (
              <Card className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4"/>
                <h3 className="text-xl font-headline mb-2">Your Cart is Empty</h3>
                <p className="text-muted-foreground mb-4">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                  <Link href="/marketplace">Start Shopping</Link>
                </Button>
              </Card>
            )}
          </div>
          <div className="grid gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                      <div className="flex items-center justify-between">
                          <p>Subtotal</p>
                          <p className="font-medium">€{cartTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                          <p>Shipping</p>
                          <p className="font-medium">€{shippingFee.toFixed(2)}</p>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-bold text-lg">
                          <p>Total</p>
                          <p>€{total.toFixed(2)}</p>
                      </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                      <Button size="lg" className="w-full" onClick={handleCheckout}>Proceed to Checkout</Button>
                      <Button size="lg" variant="secondary" className="w-full" onClick={handleDemoOrder}>Place Demo Order</Button>
                  </CardFooter>
              </Card>
              <LocationSelector onLocationChange={setLocationInfo} />
          </div>
        </div>
      </div>
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Thank You for your Order!</DialogTitle>
            <DialogDescription>
              Your order has been placed successfully. You can view its status in your order history at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setShowThankYouDialog(false);
              router.push('/orders');
            }}>View My Orders</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
