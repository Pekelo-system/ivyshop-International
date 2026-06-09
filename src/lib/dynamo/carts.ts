import { type CartItem } from "@/types";
import { getItem, putItem, deleteItem, queryItems } from "./helpers";

// ─── Get all cart items for a user ───────────────────────────────────────────

export async function getCart(userId: string): Promise<CartItem[]> {
  const result = await queryItems<CartItem>({
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":pk": `CART#${userId}`,
      ":prefix": "ITEM#",
    },
  });
  return result.items;
}

// ─── Get a single cart item ───────────────────────────────────────────────────

export async function getCartItem(
  userId: string,
  productId: string
): Promise<CartItem | null> {
  return getItem<CartItem>({
    Key: {
      PK: `CART#${userId}`,
      SK: `ITEM#PRODUCT#${productId}`,
    },
  });
}

// ─── Upsert cart item ─────────────────────────────────────────────────────────
// If item exists, increment quantity; otherwise create new.

export async function upsertCartItem(
  userId: string,
  productId: string,
  quantity: number,
  unitPrice: number
): Promise<CartItem> {
  const now = new Date().toISOString();
  const existing = await getCartItem(userId, productId);

  const item: CartItem = existing
    ? {
        ...existing,
        quantity: existing.quantity + quantity,
        unitPrice,
        updatedAt: now,
      }
    : {
        PK: `CART#${userId}`,
        SK: `ITEM#PRODUCT#${productId}`,
        entityType: "CART_ITEM",
        userId,
        productId,
        quantity,
        unitPrice,
        createdAt: now,
        updatedAt: now,
      };

  await putItem({ Item: item as unknown as Record<string, unknown> });

  return item;
}

// ─── Remove cart item ─────────────────────────────────────────────────────────

export async function removeCartItem(
  userId: string,
  productId: string
): Promise<void> {
  await deleteItem({
    Key: {
      PK: `CART#${userId}`,
      SK: `ITEM#PRODUCT#${productId}`,
    },
  });
}

// ─── Clear all cart items for a user ─────────────────────────────────────────

export async function clearCart(userId: string): Promise<void> {
  const items = await getCart(userId);
  // Delete each item individually (for production, prefer BatchWriteItem)
  await Promise.all(
    items.map((item) =>
      deleteItem({ Key: { PK: item.PK, SK: item.SK } })
    )
  );
}

// ─── Calculate cart total ─────────────────────────────────────────────────────

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
}
