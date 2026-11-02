"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

export function CartSummary() {
  const total = useCart((s) => s.getTotal());
  const totalItems = useCart((s) => s.getTotalItems());

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-slate-700 pt-4 mt-4 space-y-3">
      <div className="flex justify-between text-base font-semibold text-white">
        <span>Total ({totalItems} artículo{totalItems !== 1 ? "s" : ""})</span>
        <span className="text-violet-400">${total.toFixed(2)}</span>
      </div>
      <Link href="/checkout">
        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
          Proceder al checkout
        </Button>
      </Link>
      <Link href="/" className="block text-center text-sm text-violet-400 hover:text-violet-300 underline">
        Continuar comprando
      </Link>
    </div>
  );
}
