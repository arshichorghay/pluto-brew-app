
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/types";

export function ProductDetailView({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="grid gap-4 items-start">
          <div className="w-full max-w-[480px]">
            <Image
              alt={product.name}
              className="aspect-square object-cover border w-full rounded-lg overflow-hidden"
              height={600}
              src={product.imageUrl || 'https://placehold.co/600x600.png'}
              width={600}
              data-ai-hint={product['data-ai-hint']}
            />
          </div>
        </div>
        <div className="grid gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0.5">
                <Star className="w-5 h-5 fill-primary" />
                <Star className="w-5 h-5 fill-primary" />
                <Star className="w-5 h-5 fill-primary" />
                <Star className="w-5 h-5 fill-primary" />
                <Star className="w-5 h-5 fill-muted stroke-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">(34 reviews)</p>
            </div>
            <p className="text-2xl font-semibold">€{product.price.toFixed(2)}</p>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <Separator />

          <div className="flex items-center gap-4">
            <p>Quantity:</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button size="lg" onClick={() => addToCart(product, quantity)}>Add to Cart</Button>
        </div>
      </div>
    </div>
  );
}
