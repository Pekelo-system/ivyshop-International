import { ProductGridSkeleton } from "@/components/catalogo/ProductCardSkeleton";

export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-96 animate-pulse rounded bg-gray-200" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
