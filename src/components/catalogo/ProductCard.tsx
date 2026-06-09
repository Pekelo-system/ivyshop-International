import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const categoryLabels: Record<string, string> = {
  zapatos: "Zapatos",
  ropa: "Ropa",
  "electrónicos": "Electrónicos",
  libros: "Libros",
  otros: "Otros",
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link
        href={`/productos/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <svg
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="destructive" className="text-sm font-semibold">
              Agotado
            </Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-1 p-4">
        <Badge variant="secondary" className="w-fit text-xs">
          {categoryLabels[product.category] ?? product.category}
        </Badge>
        <Link href={`/productos/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 transition-colors hover:text-green-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-auto pt-2 text-lg font-bold text-green-700">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={isOutOfStock}
          onClick={() => onAddToCart?.(product)}
          style={
            isOutOfStock ? {} : { backgroundColor: "#ea580c", color: "white" }
          }
          aria-label={
            isOutOfStock
              ? `${product.name} - Agotado`
              : `Agregar ${product.name} al carrito`
          }
        >
          {isOutOfStock ? "Agotado" : "Agregar al carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
}
