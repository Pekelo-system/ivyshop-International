import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/types";
import { getProductById } from "@/lib/dynamo/products";
import { AddToCartSection } from "./_components/AddToCartSection";

const categoryLabels: Record<string, string> = {
  zapatos: "Zapatos",
  ropa: "Ropa",
  "electrónicos": "Electrónicos",
  libros: "Libros",
  otros: "Otros",
};

export default async function ProductoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product: Product | null = await getProductById(id);

  if (!product) notFound();

  const isOutOfStock = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Ruta de navegación">
        <Link href="/" className="hover:text-green-700">Catálogo</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div>
          <Badge variant="secondary" className="mb-3">{categoryLabels[product.category] ?? product.category}</Badge>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-green-700">${product.price.toFixed(2)}</p>

          {isOutOfStock ? (
            <div className="mt-4"><Badge variant="destructive" className="text-base px-4 py-1">Agotado</Badge></div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{product.stock} unidades en stock</p>
          )}

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Descripción</h2>
              <p className="mt-2 text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {!isOutOfStock && <AddToCartSection product={product} />}
        </div>
      </div>
    </div>
  );
}
