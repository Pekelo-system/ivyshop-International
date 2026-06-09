import { ProductGrid } from "@/components/catalogo/ProductGrid";
import { listProducts } from "@/lib/dynamo/products";

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
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de productos</h1>
        <p className="mt-2 text-gray-500">Explora nuestra selección de productos exclusivos</p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
