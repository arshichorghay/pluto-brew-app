
"use client";

import Link from "next/link";
import dynamic from 'next/dynamic';
import { Icons } from "./icons";
import { MainNav } from "./main-nav";
import { HeaderActions } from "./header-actions";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

function SearchSkeleton() {
  return (
    <div className="relative ml-auto flex-1 sm:flex-initial">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          disabled
        />
    </div>
  )
}

const HeaderSearch = dynamic(() => import('./header-search').then(mod => mod.HeaderSearch), {
  ssr: false,
  loading: () => <SearchSkeleton />
});


export function Header() {

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
        <HeaderSearch />
        <HeaderActions />
      </div>
    </header>
  );
}
