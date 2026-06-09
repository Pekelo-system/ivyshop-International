"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CartItemRow } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCart((s) => s.items);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-700" aria-hidden="true" />
            Carrito
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
              <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400 mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.productId}
                productId={item.productId}
                quantity={item.quantity}
                unitPrice={item.unitPrice}
              />
            ))
          )}
        </div>

        {/* Summary */}
        <div className="px-4 pb-4">
          <CartSummary />
        </div>
      </aside>
    </>
  );
}
