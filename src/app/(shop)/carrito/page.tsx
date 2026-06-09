"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CartItemRow } from "@/components/carrito/CartItem";
import { CartSummary } from "@/components/carrito/CartSummary";

export default function CarritoPage() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Tu carrito está vacío</h1>
        <p className="mt-2 text-gray-500">Agrega productos para comenzar tu compra</p>
        <Link href="/">
          <Button className="mt-6 bg-green-600 hover:bg-green-700 text-white">
            Explorar catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrito de compras</h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={clearCart}
          aria-label="Vaciar carrito"
        >
          Vaciar carrito
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        {items.map((item) => (
          <CartItemRow
            key={item.productId}
            productId={item.productId}
            quantity={item.quantity}
            unitPrice={item.unitPrice}
          />
        ))}
      </div>

      <CartSummary />
    </div>
  );
}
