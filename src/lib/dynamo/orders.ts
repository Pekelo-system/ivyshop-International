import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { type Order, type CartItem } from "@/types";
import { IVYSHOP_TABLE } from "./client";
import { getItem, queryItems, transactWrite } from "./helpers";
import { clearCart } from "./carts";

// ─── Structured error for insufficient stock ──────────────────────────────────

export class StockInsufficientError extends Error {
  readonly code = "STOCK_INSUFFICIENT";

  constructor(message = "Stock insuficiente para uno o más productos") {
    super(message);
    this.name = "StockInsufficientError";
  }
}

// ─── Create order with atomic stock decrement ─────────────────────────────────
// Uses TransactWriteItems to atomically:
//   1. Create the order record
//   2. Decrement stock for each cart item (condition: stock >= quantity)
// Clears the cart on success.
// Throws StockInsufficientError if any stock condition fails.

export async function createOrder(
  order: Omit<
    Order,
    "PK" | "SK" | "GSI1PK" | "GSI1SK" | "entityType" | "createdAt"
  >,
  cartItems: CartItem[]
): Promise<Order> {
  const now = new Date().toISOString();

  const fullOrder: Order = {
    PK: `ORDER#${order.id}`,
    SK: "METADATA",
    GSI1PK: `USER#${order.userId}`,
    GSI1SK: `ORDER#${order.id}`,
    entityType: "ORDER",
    createdAt: now,
    ...order,
  };

  try {
    await transactWrite({
      TransactItems: [
        // 1. Put the new order (fail if it already exists)
        {
          Put: {
            TableName: IVYSHOP_TABLE,
            Item: fullOrder as unknown as Record<string, unknown>,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },
        // 2. Decrement stock for each cart item (fail if stock insufficient)
        ...cartItems.map((item) => ({
          Update: {
            TableName: IVYSHOP_TABLE,
            Key: {
              PK: `PRODUCT#${item.productId}`,
              SK: "METADATA",
            },
            UpdateExpression: "SET stock = stock - :qty, updatedAt = :now",
            ConditionExpression: "stock >= :qty",
            ExpressionAttributeValues: {
              ":qty": item.quantity,
              ":now": now,
            },
          },
        })),
      ],
    });
  } catch (err) {
    if (err instanceof TransactionCanceledException) {
      throw new StockInsufficientError();
    }
    throw err;
  }

  // Clear cart after successful order creation
  await clearCart(order.userId);

  return fullOrder;
}

// ─── Get order by ID ──────────────────────────────────────────────────────────

export async function getOrderById(orderId: string): Promise<Order | null> {
  return getItem<Order>({
    Key: { PK: `ORDER#${orderId}`, SK: "METADATA" },
  });
}

// ─── List orders by user (GSI1) ───────────────────────────────────────────────

export async function listOrdersByUser(userId: string): Promise<Order[]> {
  const result = await queryItems<Order>({
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk AND begins_with(GSI1SK, :prefix)",
    ExpressionAttributeValues: {
      ":gsi1pk": `USER#${userId}`,
      ":prefix": "ORDER#",
    },
    ScanIndexForward: false, // newest first
  });
  return result.items;
}
