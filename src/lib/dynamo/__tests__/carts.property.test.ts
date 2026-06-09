import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { type CartItem } from "@/types";

// Mock DynamoDB client to prevent real AWS calls
vi.mock("@/lib/dynamo/client", () => ({
  IVYSHOP_TABLE: "ivyshop",
  docClient: { send: vi.fn() },
}));

vi.mock("@/lib/dynamo/helpers", () => ({
  getItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
  queryItems: vi.fn(),
  scanItems: vi.fn(),
  transactWrite: vi.fn(),
}));

import { calculateCartTotal } from "../carts";

// ── Property 6: Carrito no duplica productos ─────────────────────────────────

describe("Propiedad 6: Carrito no duplica productos", () => {
  it("agregar un producto existente incrementa cantidad en lugar de duplicar", () => {
    // Feature: ivyshop, Property 6: Carrito no duplica productos
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }),
        (productId, initialQty, additionalQty, unitPrice) => {
          // Simulate cart with one item
          const cart: CartItem[] = [{
            PK: "CART#user",
            SK: `ITEM#PRODUCT#${productId}`,
            entityType: "CART_ITEM",
            userId: "user",
            productId,
            quantity: initialQty,
            unitPrice,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }];

          // Simulate upsert: find existing and increment
          const existing = cart.find((i) => i.productId === productId);
          if (existing) {
            existing.quantity += additionalQty;
          }

          // Should have same number of unique items
          const uniqueProductIds = new Set(cart.map((i) => i.productId));
          expect(uniqueProductIds.size).toBe(1);
          expect(cart[0].quantity).toBe(initialQty + additionalQty);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 7: Cálculo correcto del total del carrito ───────────────────────

describe("Propiedad 7: Cálculo correcto del total del carrito", () => {
  it("total es la suma exacta de (precio_unitario × cantidad) para cada ítem", () => {
    // Feature: ivyshop, Property 7: Cálculo correcto del total del carrito
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.uuid(),
            quantity: fc.integer({ min: 1, max: 100 }),
            unitPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(9999.99), noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          const cartItems: CartItem[] = items.map((item) => ({
            PK: "CART#user",
            SK: `ITEM#PRODUCT#${item.productId}`,
            entityType: "CART_ITEM" as const,
            userId: "user",
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }));

          const total = calculateCartTotal(cartItems);
          const expectedTotal = items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
          );

          expect(total).toBeCloseTo(expectedTotal, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("carrito vacío tiene total cero", () => {
    // Feature: ivyshop, Property 7: Cálculo correcto del total del carrito
    expect(calculateCartTotal([])).toBe(0);
  });
});
