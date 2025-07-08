
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const routes = [
    { href: "/marketplace", label: "Marketplace", public: true },
    { href: "/orders", label: "My Orders", public: true },
    { href: "/admin/orders", label: "Admin", public: false, roles: ['admin'] },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => {
        if (!route.public && (isLoading || !user || (route.roles && !route.roles.includes(user.role)))) {
          return null;
        }
        
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith(route.href)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        )
      })}
    </nav>
  );
}
