
"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { Badge } from "./ui/badge";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`}>
          <Image
            alt={product.name}
            className="aspect-square w-full object-cover"
            height={400}
            src={product.imageUrl || 'https://placehold.co/400x400.png'}
            width={400}
            data-ai-hint={product['data-ai-hint']}
          />
        </Link>
        <Badge variant="secondary" className="absolute top-3 right-3">{product.category}</Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <CardDescription className="text-sm">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-lg font-semibold">€{product.price.toFixed(2)}</div>
        {quantityInCart > 0 ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantityInCart - 1)}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-semibold w-4 text-center">{quantityInCart}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantityInCart + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => addToCart(product)}>
            <Plus className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
