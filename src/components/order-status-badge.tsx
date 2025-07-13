
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const variant = {
    Pending: "default",
    Processing: "secondary",
    Shipped: "outline",
    Delivered: "default",
    Cancelled: "destructive",
  }[status] as "default" | "secondary" | "outline" | "destructive";
  
  const className = {
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  }[status];

  return <Badge variant={variant} className={cn('capitalize', className)}>{status.toLowerCase()}</Badge>;
}
