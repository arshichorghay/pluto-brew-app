
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { Badge } from "./ui/badge";
import { useCart } from "@/context/cart-context";

export function HeaderActions() {
    const { cartCount } = useCart();

    return (
        <>
            <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1 text-xs" variant="destructive">{cartCount}</Badge>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                </Link>
            </Button>
            <UserNav />
        </>
    )
}
