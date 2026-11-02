import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { type CartItem, type OrderItem, type ShippingAddress } from "@/types";
import { calculateCartTotal } from "../carts";

// Mock DynamoDB
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

vi.mock("@aws-sdk/client-dynamodb", () => {
  class TransactionCanceledException extends Error {
    $metadata: Record<string, unknown>;
    CancellationReasons: unknown[];
    constructor(opts: { message?: string; $metadata?: Record<string, unknown>; CancellationReasons?: unknown[] } = {}) {
      super(opts.message ?? "Transaction cancelled");
      this.name = "TransactionCanceledException";
      this.$metadata = opts.$metadata ?? {};
      this.CancellationReasons = opts.CancellationReasons ?? [];
    }
  }
  return { DynamoDBClient: vi.fn(), TransactWriteItemsCommand: vi.fn(), TransactionCanceledException };
});

const mockHelpers = await import("@/lib/dynamo/helpers");
const { createOrder, StockInsufficientError } = await import("../orders");

function arbitraryAddress(): fc.Arbitrary<ShippingAddress> {
  return fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 100 }),
    street: fc.string({ minLength: 1, maxLength: 100 }),
    city: fc.string({ minLength: 1, maxLength: 50 }),
    stateOrProvince: fc.string({ minLength: 1, maxLength: 50 }),
    postalCode: fc.string({ minLength: 1, maxLength: 10 }),
    country: fc.string({ minLength: 1, maxLength: 50 }),
  });
}

function arbitraryCartItems(): fc.Arbitrary<CartItem[]> {
  return fc.array(
    fc.record({
      productId: fc.uuid(),
      quantity: fc.integer({ min: 1, max: 10 }),
      unitPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }),
    }).map((item) => ({
      PK: `CART#user-123`,
      SK: `ITEM#PRODUCT#${item.productId}`,
      entityType: "CART_ITEM" as const,
      userId: "user-123",
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    })),
    { minLength: 1, maxLength: 5 }
  );
}

// ── Property 8: Checkout preserva datos de la orden ──────────────────────────

describe("Propiedad 8: Checkout preserva datos de la orden", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("la orden contiene los mismos productos, cantidades y precios del carrito", async () => {
    // Feature: ivyshop, Property 8: Checkout preserva datos de la orden
    await fc.assert(
      fc.asyncProperty(
        arbitraryCartItems(),
        arbitraryAddress(),
        async (cartItems, address) => {
          vi.mocked(mockHelpers.transactWrite).mockReset();
          vi.mocked(mockHelpers.queryItems).mockReset();
          vi.mocked(mockHelpers.deleteItem).mockReset();

          vi.mocked(mockHelpers.transactWrite).mockResolvedValue(undefined);
          vi.mocked(mockHelpers.queryItems).mockResolvedValue({ items: cartItems, lastEvaluatedKey: undefined });
          vi.mocked(mockHelpers.deleteItem).mockResolvedValue(undefined);

          const orderItems: OrderItem[] = cartItems.map((i) => ({
            productId: i.productId,
            productName: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          }));
          const total = calculateCartTotal(cartItems);

          const order = await createOrder(
            { id: "test-order", userId: "user-123", items: orderItems, totalAmount: total, shippingAddress: address, status: "CONFIRMED" },
            cartItems
          );

          expect(order.items).toHaveLength(cartItems.length);
          expect(order.totalAmount).toBeCloseTo(total, 2);
          expect(order.shippingAddress).toEqual(address);
          order.items.forEach((item, idx) => {
            expect(item.productId).toBe(cartItems[idx].productId);
            expect(item.quantity).toBe(cartItems[idx].quantity);
            expect(item.unitPrice).toBe(cartItems[idx].unitPrice);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ── Property 9: Checkout es atómico respecto al stock ────────────────────────

describe("Propiedad 9: Checkout es atómico respecto al stock", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("si stock insuficiente, la orden no se crea y el stock no se modifica", async () => {
    // Feature: ivyshop, Property 9: Checkout es atómico respecto al stock
    const { TransactionCanceledException } = await import("@aws-sdk/client-dynamodb");

    await fc.assert(
      fc.asyncProperty(
        arbitraryCartItems(),
        arbitraryAddress(),
        async (cartItems, address) => {
          vi.mocked(mockHelpers.transactWrite).mockReset();
          vi.mocked(mockHelpers.queryItems).mockReset();
          vi.mocked(mockHelpers.deleteItem).mockReset();

          vi.mocked(mockHelpers.transactWrite).mockRejectedValue(
            new TransactionCanceledException({ message: "Stock insufficient", $metadata: {} })
          );
          // queryItems should never be called, but provide a default just in case
          vi.mocked(mockHelpers.queryItems).mockResolvedValue({ items: [], lastEvaluatedKey: undefined });

          const orderItems: OrderItem[] = cartItems.map((i) => ({
            productId: i.productId, productName: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
          }));

          let threw = false;
          try {
            await createOrder(
              { id: "fail-order", userId: "user-123", items: orderItems, totalAmount: calculateCartTotal(cartItems), shippingAddress: address, status: "CONFIRMED" },
              cartItems
            );
          } catch (err) {
            threw = true;
            expect(err).toBeInstanceOf(StockInsufficientError);
          }

          // Must have thrown
          expect(threw).toBe(true);
          // clearCart should NOT be called when transaction fails
          expect(mockHelpers.queryItems).not.toHaveBeenCalled();
          expect(mockHelpers.deleteItem).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ── Property 10: Checkout vacía el carrito tras éxito ────────────────────────

describe("Propiedad 10: Checkout vacía el carrito tras éxito", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("tras checkout exitoso, clearCart se ejecuta (queryItems + deleteItem por cada item)", async () => {
    // Feature: ivyshop, Property 10: Checkout vacía el carrito tras éxito
    await fc.assert(
      fc.asyncProperty(
        arbitraryCartItems(),
        arbitraryAddress(),
        async (cartItems, address) => {
          vi.mocked(mockHelpers.transactWrite).mockReset();
          vi.mocked(mockHelpers.queryItems).mockReset();
          vi.mocked(mockHelpers.deleteItem).mockReset();

          vi.mocked(mockHelpers.transactWrite).mockResolvedValue(undefined);
          vi.mocked(mockHelpers.queryItems).mockResolvedValue({ items: cartItems, lastEvaluatedKey: undefined });
          vi.mocked(mockHelpers.deleteItem).mockResolvedValue(undefined);

          const orderItems: OrderItem[] = cartItems.map((i) => ({
            productId: i.productId, productName: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
          }));

          await createOrder(
            { id: "success-order", userId: "user-123", items: orderItems, totalAmount: calculateCartTotal(cartItems), shippingAddress: address, status: "CONFIRMED" },
            cartItems
          );

          // clearCart queries the cart and deletes each item
          expect(mockHelpers.queryItems).toHaveBeenCalledTimes(1);
          expect(mockHelpers.deleteItem).toHaveBeenCalledTimes(cartItems.length);
        }
      ),
      { numRuns: 50 }
    );
  });
});
