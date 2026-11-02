import { ProductGrid } from "@/components/catalogo/ProductGrid";
import { listProducts } from "@/lib/dynamo/products";
import { WelcomeBanner } from "@/components/shared/WelcomeBanner";

export default async function CatalogoPage() {
  let products: import("@/types").Product[] = [];
  try {
    const result = await listProducts({ limit: 20 });
    products = result.items;
  } catch (error) {
    console.error("Error loading products:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <WelcomeBanner />
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
