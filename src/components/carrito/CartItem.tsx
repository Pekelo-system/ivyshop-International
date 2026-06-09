"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface CartItemProps {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export function CartItemRow({ productId, productName, quantity, unitPrice }: CartItemProps) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {productName ?? productId}
        </p>
        <p className="text-sm text-gray-500">${unitPrice.toFixed(2)} c/u</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(productId, quantity - 1)} aria-label="Reducir cantidad">
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(productId, quantity + 1)} aria-label="Aumentar cantidad">
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <p className="text-sm font-semibold text-green-700 w-20 text-right">
        ${(unitPrice * quantity).toFixed(2)}
      </p>

      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => removeItem(productId)} aria-label="Eliminar del carrito">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
