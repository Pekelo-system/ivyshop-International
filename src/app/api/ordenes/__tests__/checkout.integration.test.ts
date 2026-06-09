import { describe, it, expect, vi, beforeEach } from "vitest";
import { type CartItem, type OrderItem } from "@/types";

// Mock the DynamoDB client module to prevent real client instantiation
vi.mock("@/lib/dynamo/client", () => ({
  IVYSHOP_TABLE: "ivyshop",
  docClient: { send: vi.fn() },
}));

// Mock DynamoDB operations
vi.mock("@/lib/dynamo/helpers", () => ({
  getItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
  queryItems: vi.fn(),
  scanItems: vi.fn(),
  transactWrite: vi.fn(),
}));

// Mock @aws-sdk/client-dynamodb to provide TransactionCanceledException as a proper class
vi.mock("@aws-sdk/client-dynamodb", () => {
  class TransactionCanceledException extends Error {
    $metadata: Record<string, unknown>;
    CancellationReasons: unknown[];
    constructor({ message, $metadata, CancellationReasons }: { message?: string; $metadata?: Record<string, unknown>; CancellationReasons?: unknown[] } = {}) {
      super(message ?? "Transaction cancelled");
      this.name = "TransactionCanceledException";
      this.$metadata = $metadata ?? {};
      this.CancellationReasons = CancellationReasons ?? [];
    }
  }
  return {
    DynamoDBClient: vi.fn().mockImplementation(() => ({ send: vi.fn() })),
    TransactWriteItemsCommand: vi.fn(),
    TransactionCanceledException,
  };
});

const mockHelpers = await import("@/lib/dynamo/helpers");
const { createOrder, StockInsufficientError } = await import("@/lib/dynamo/orders");
const { calculateCartTotal } = await import("@/lib/dynamo/carts");

describe("Flujo de checkout — integración", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCartItems: CartItem[] = [
    {
      PK: "CART#user-123",
      SK: "ITEM#PRODUCT#prod-1",
      entityType: "CART_ITEM",
      userId: "user-123",
      productId: "prod-1",
      quantity: 2,
      unitPrice: 49.99,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      PK: "CART#user-123",
      SK: "ITEM#PRODUCT#prod-2",
      entityType: "CART_ITEM",
      userId: "user-123",
      productId: "prod-2",
      quantity: 1,
      unitPrice: 29.99,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];

  it("calcula el total del carrito correctamente", () => {
    const total = calculateCartTotal(mockCartItems);
    expect(total).toBeCloseTo(129.97); // (49.99 * 2) + (29.99 * 1)
  });

  it("crea una orden exitosamente cuando hay stock suficiente", async () => {
    // Mock transactWrite to succeed
    vi.mocked(mockHelpers.transactWrite).mockResolvedValueOnce(undefined);
    // Mock queryItems for clearCart (returns items then we delete them)
    vi.mocked(mockHelpers.queryItems).mockResolvedValueOnce({ items: mockCartItems, lastEvaluatedKey: undefined });
    // Mock deleteItem for clearCart
    vi.mocked(mockHelpers.deleteItem).mockResolvedValue(undefined);

    const orderItems: OrderItem[] = mockCartItems.map((item) => ({
      productId: item.productId,
      productName: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const order = await createOrder(
      {
        id: "order-123",
        userId: "user-123",
        items: orderItems,
        totalAmount: calculateCartTotal(mockCartItems),
        shippingAddress: {
          fullName: "Juan Pérez",
          street: "Calle 123",
          city: "Bogotá",
          stateOrProvince: "Cundinamarca",
          postalCode: "110111",
          country: "Colombia",
        },
        status: "CONFIRMED",
      },
      mockCartItems
    );

    expect(order.PK).toBe("ORDER#order-123");
    expect(order.entityType).toBe("ORDER");
    expect(order.items).toHaveLength(2);
    expect(order.totalAmount).toBeCloseTo(129.97);
    expect(mockHelpers.transactWrite).toHaveBeenCalledOnce();
  });

  it("lanza StockInsufficientError cuando el stock es insuficiente", async () => {
    const { TransactionCanceledException } = await import("@aws-sdk/client-dynamodb");
    vi.mocked(mockHelpers.transactWrite).mockRejectedValueOnce(
      new TransactionCanceledException({ $metadata: {}, message: "Transaction cancelled", CancellationReasons: [] })
    );

    const orderItems: OrderItem[] = mockCartItems.map((item) => ({
      productId: item.productId,
      productName: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    await expect(
      createOrder(
        {
          id: "order-456",
          userId: "user-123",
          items: orderItems,
          totalAmount: calculateCartTotal(mockCartItems),
          shippingAddress: {
            fullName: "Juan Pérez",
            street: "Calle 123",
            city: "Bogotá",
            stateOrProvince: "Cundinamarca",
            postalCode: "110111",
            country: "Colombia",
          },
          status: "CONFIRMED",
        },
        mockCartItems
      )
    ).rejects.toThrow(StockInsufficientError);
  });

  it("no modifica el carrito cuando la creación de orden falla", async () => {
    const { TransactionCanceledException } = await import("@aws-sdk/client-dynamodb");
    vi.mocked(mockHelpers.transactWrite).mockRejectedValueOnce(
      new TransactionCanceledException({ $metadata: {}, message: "Transaction cancelled", CancellationReasons: [] })
    );

    const orderItems: OrderItem[] = mockCartItems.map((item) => ({
      productId: item.productId,
      productName: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    try {
      await createOrder(
        {
          id: "order-789",
          userId: "user-123",
          items: orderItems,
          totalAmount: 129.97,
          shippingAddress: {
            fullName: "Juan",
            street: "Calle",
            city: "Ciudad",
            stateOrProvince: "Estado",
            postalCode: "12345",
            country: "CO",
          },
          status: "CONFIRMED",
        },
        mockCartItems
      );
    } catch {
      // Expected to throw
    }

    // clearCart should NOT have been called since order creation failed
    expect(mockHelpers.queryItems).not.toHaveBeenCalled();
  });
});
