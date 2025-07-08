
"use client";

import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "./icons";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { Badge } from "./ui/badge";
import { useCart } from "@/context/cart-context";
import { HeaderSearch } from "./header-search";

function SearchInputFallback() {
    return (
        <div className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                disabled
                />
            </div>
        </div>
    )
}

export function Header() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <Link href="/marketplace" className="flex items-center gap-2">
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold font-headline text-xl">Pluto Brew</span>
      </Link>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="hidden md:block">
            <MainNav />
        </div>
        <Suspense fallback={<SearchInputFallback />}>
          <HeaderSearch />
        </Suspense>
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
      </div>
    </header>
  );
}
