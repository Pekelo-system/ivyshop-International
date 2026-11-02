"use client";

import { type Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/hooks/useCart";

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const addItem = useCart((s) => s.addItem);

  function handleAddToCart(product: Product) {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    const now = new Date().toISOString();
    addItem({
      PK: `CART#local`,
      SK: `ITEM#PRODUCT#${product.id}`,
      entityType: "CART_ITEM",
      userId: "local",
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="mb-4 h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-lg font-medium text-gray-500">
          No se encontraron productos
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Intenta con otros filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
