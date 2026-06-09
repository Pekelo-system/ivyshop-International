"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/types";
import { useCart } from "@/hooks/useCart";

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCart((state) => state.addItem);

  // When stock is 0, render nothing — caller also guards this, but double-check here
  if (product.stock === 0) return null;

  function handleQuantityChange(val: number) {
    setError(null);
    if (val < 1) {
      setError("La cantidad mínima es 1");
      return;
    }
    if (val > product.stock) {
      setError(`La cantidad máxima es ${product.stock} (stock disponible)`);
      return;
    }
    setQuantity(val);
  }

  function handleAddToCart() {
    if (quantity < 1 || quantity > product.stock) return;
    const now = new Date().toISOString();
    addItem({
      PK: `CART#local`,
      SK: `ITEM#PRODUCT#${product.id}`,
      entityType: "CART_ITEM",
      userId: "local",
      productId: product.id,
      quantity,
      unitPrice: product.price,
      createdAt: now,
      updatedAt: now,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          Cantidad
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Reducir cantidad"
          >
            −
          </Button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Cantidad"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.stock}
            aria-label="Aumentar cantidad"
          >
            +
          </Button>
        </div>
        <span className="text-sm text-gray-500">{product.stock} disponibles</span>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button
        className="w-full sm:w-auto px-8"
        style={{ backgroundColor: "#ea580c", color: "white" }}
        onClick={handleAddToCart}
        disabled={!!error}
        aria-label={`Agregar ${quantity} unidad${quantity > 1 ? "es" : ""} al carrito`}
      >
        {added ? "¡Agregado!" : "Agregar al carrito"}
      </Button>
    </div>
  );
}
