"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

export function CartSummary() {
  const total = useCart((s) => s.getTotal());
  const totalItems = useCart((s) => s.getTotalItems());

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
      <div className="flex justify-between text-base font-semibold text-gray-900">
        <span>Total ({totalItems} artículo{totalItems !== 1 ? "s" : ""})</span>
        <span className="text-green-700">${total.toFixed(2)}</span>
      </div>
      <Link href="/checkout">
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
          Proceder al checkout
        </Button>
      </Link>
      <Link href="/" className="block text-center text-sm text-green-700 hover:text-green-800 underline">
        Continuar comprando
      </Link>
    </div>
  );
}
