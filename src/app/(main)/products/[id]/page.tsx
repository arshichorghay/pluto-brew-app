
import { getProductById } from "@/lib/storage";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product-detail-view";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
