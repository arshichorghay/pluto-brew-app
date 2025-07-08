"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockProducts } from "@/lib/mock-data";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { useState } from "react";
import { LocationSelector } from "@/components/location-selector";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const initialCartItems: CartItem[] = [
  { ...mockProducts[0], quantity: 1 },
  { ...mockProducts[4], quantity: 2 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const { toast } = useToast();
  const router = useRouter();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 5.0;
  const total = subtotal + shippingFee;

  const handleDemoOrder = () => {
    toast({
        title: "Demo Order Placed!",
        description: "Your demo order has been successfully placed.",
    });
    router.push('/orders');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-headline mb-8">Your Cart</h1>
      <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="grid gap-6">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <Image
                  alt={item.name}
                  className="aspect-square rounded-md object-cover"
                  height={100}
                  src={item.imageUrl}
                  width={100}
                  data-ai-hint={item['data-ai-hint']}
                />
                <div className="grid gap-1.5 flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold w-4 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-semibold text-lg ml-auto">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <p>Subtotal</p>
                        <p className="font-medium">${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>Shipping</p>
                        <p className="font-medium">${shippingFee.toFixed(2)}</p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>${total.toFixed(2)}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button size="lg" className="w-full">Proceed to Checkout</Button>
                    <Button size="lg" variant="secondary" className="w-full" onClick={handleDemoOrder}>Place Demo Order</Button>
                </CardFooter>
            </Card>
            <LocationSelector />
        </div>
      </div>
    </div>
  );
}
