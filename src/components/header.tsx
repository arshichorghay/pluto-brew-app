
import Link from "next/link";
import { Icons } from "./icons";
import { MainNav } from "./main-nav";
import { HeaderSearch } from "./header-search";
import { HeaderActions } from "./header-actions";

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
