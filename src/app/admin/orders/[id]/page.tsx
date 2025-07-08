
import { getOrderById, getOrders } from '@/lib/storage';
import { OrderDetailsView } from '@/components/admin/order-details-view';

export async function generateStaticParams() {
    const orders = await getOrders();
    return orders.map((order) => ({
      id: order.id,
    }));
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const order = await getOrderById(params.id);
    // The OrderDetailsView component will handle the case where the order is null.
    return <OrderDetailsView order={order} />;
}
