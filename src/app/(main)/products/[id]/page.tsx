
import { getProductById, getProducts } from "@/lib/storage";
import { ProductDetailView } from "@/components/product-detail-view";

export async function generateStaticParams() {
  const products = await getProducts();
 
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
     return (
        <div className="container mx-auto py-8 text-center">
            <h2 className="text-2xl font-bold font-headline mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
    );
  }

  return <ProductDetailView product={product} />;
}
