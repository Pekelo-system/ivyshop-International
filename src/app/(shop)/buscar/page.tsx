import { Suspense } from "react";
import { ProductGrid } from "@/components/catalogo/ProductGrid";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { listProducts } from "@/lib/dynamo/products";
import { filterProducts } from "@/lib/search/filter";
import { type Product } from "@/types";

interface BuscarPageProps {
  searchParams: Promise<{ q?: string; categoria?: string; precioMin?: string; precioMax?: string }>;
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const params = await searchParams;
  const { q, categoria, precioMin, precioMax } = params;

  let products: Product[] = [];
  try {
    const result = await listProducts({ limit: 1000 });
    products = filterProducts(result.items, {
      q: q ?? undefined,
      categoria: categoria ?? undefined,
      precioMin: precioMin ? parseFloat(precioMin) : undefined,
      precioMax: precioMax ? parseFloat(precioMax) : undefined,
    });
  } catch (error) {
    console.error("Error searching products:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Resultados para "${q}"` : "Buscar productos"}
        </h1>
        {products.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">{products.length} producto{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense fallback={<div className="w-64" />}>
          <FilterPanel />
        </Suspense>
        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
