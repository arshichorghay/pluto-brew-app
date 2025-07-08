
"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { Badge } from "./ui/badge";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6 flex-grow flex flex-col items-center">
        <div className="w-40 h-40 mb-4">
          <Link href={`/products/${product.id}`}>
            <Image
              alt={product.name}
              className="aspect-square w-full h-full object-cover rounded-full"
              height={160}
              src={product.imageUrl || 'https://placehold.co/160x160.png'}
              width={160}
              data-ai-hint={product['data-ai-hint']}
            />
          </Link>
        </div>
        <Badge variant="secondary" className="mb-2">{product.category}</Badge>
        <CardTitle className="text-xl font-headline mb-2 text-center">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-center flex-grow">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-lg font-semibold">${product.price.toFixed(2)}</div>
        <Button size="sm" onClick={() => addToCart(product)}>
          <Plus className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
