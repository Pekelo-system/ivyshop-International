import { type Product } from "@/types";
import { IVYSHOP_TABLE } from "./client";
import { getItem, putItem, deleteItem, queryItems, scanItems } from "./helpers";

// ─── Format price for GSI1SK ──────────────────────────────────────────────────
// Produces a zero-padded 10-character price string, e.g. 99.99 → "0000099.99"

export function formatPriceKey(price: number): string {
  const intPart = Math.floor(price).toString().padStart(7, "0");
  const decPart = Math.round((price % 1) * 100)
    .toString()
    .padStart(2, "0");
  return `${intPart}.${decPart}`;
}

// ─── Build product DynamoDB keys ──────────────────────────────────────────────

export function buildProductKeys(id: string, category: string, price: number) {
  return {
    PK: `PRODUCT#${id}` as const,
    SK: "METADATA" as const,
    GSI1PK: `CATEGORY#${category}`,
    GSI1SK: `PRICE#${formatPriceKey(price)}`,
  };
}

// ─── Get product by ID ───────────────────────────────────────────────────────

export async function getProductById(id: string): Promise<Product | null> {
  return getItem<Product>({
    Key: { PK: `PRODUCT#${id}`, SK: "METADATA" },
  });
}

// ─── List products (paginated scan) ─────────────────────────────────────────

export async function listProducts(options?: {
  limit?: number;
  lastEvaluatedKey?: string;
}): Promise<{ items: Product[]; lastEvaluatedKey?: string }> {
  const limit = options?.limit ?? 20;
  const exclusiveStartKey = options?.lastEvaluatedKey
    ? (JSON.parse(options.lastEvaluatedKey) as Record<string, unknown>)
    : undefined;

  const result = await scanItems<Product>({
    FilterExpression: "entityType = :et",
    ExpressionAttributeValues: { ":et": "PRODUCT" },
    Limit: limit,
    ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
  });

  return {
    items: result.items,
    lastEvaluatedKey: result.lastEvaluatedKey
      ? JSON.stringify(result.lastEvaluatedKey)
      : undefined,
  };
}

// ─── List products by category (GSI1) ────────────────────────────────────────

export async function listProductsByCategory(
  category: string,
  options?: {
    limit?: number;
    lastEvaluatedKey?: string;
  }
): Promise<{ items: Product[]; lastEvaluatedKey?: string }> {
  const limit = options?.limit ?? 20;
  const exclusiveStartKey = options?.lastEvaluatedKey
    ? (JSON.parse(options.lastEvaluatedKey) as Record<string, unknown>)
    : undefined;

  const result = await queryItems<Product>({
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk",
    ExpressionAttributeValues: { ":gsi1pk": `CATEGORY#${category}` },
    Limit: limit,
    ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
  });

  return {
    items: result.items,
    lastEvaluatedKey: result.lastEvaluatedKey
      ? JSON.stringify(result.lastEvaluatedKey)
      : undefined,
  };
}

// ─── Create product ──────────────────────────────────────────────────────────

export async function createProduct(
  input: Omit<
    Product,
    "PK" | "SK" | "GSI1PK" | "GSI1SK" | "entityType" | "createdAt" | "updatedAt"
  >
): Promise<Product> {
  const now = new Date().toISOString();
  const keys = buildProductKeys(input.id, input.category, input.price);

  const product: Product = {
    ...keys,
    entityType: "PRODUCT",
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  await putItem({
    Item: product as unknown as Record<string, unknown>,
    ConditionExpression: "attribute_not_exists(PK)",
  });

  return product;
}

// ─── Update product ──────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  // Recalculate GSI keys if category or price changed
  const category = updates.category ?? existing.category;
  const price = updates.price ?? existing.price;
  const keys = buildProductKeys(id, category, price);

  const updated: Product = {
    ...existing,
    ...updates,
    ...keys,
    updatedAt: now,
  };

  await putItem({
    Item: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

// ─── Delete product ──────────────────────────────────────────────────────────

export async function deleteProduct(id: string): Promise<void> {
  await deleteItem({
    Key: { PK: `PRODUCT#${id}`, SK: "METADATA" },
  });
}

// ─── Search products by name (scan with filter) ───────────────────────────────

export async function searchProductsByName(
  term: string,
  options?: {
    limit?: number;
    lastEvaluatedKey?: string;
  }
): Promise<{ items: Product[]; lastEvaluatedKey?: string }> {
  const limit = options?.limit ?? 20;
  const exclusiveStartKey = options?.lastEvaluatedKey
    ? (JSON.parse(options.lastEvaluatedKey) as Record<string, unknown>)
    : undefined;

  const result = await scanItems<Product>({
    FilterExpression: "entityType = :et AND contains(#nm, :term)",
    ExpressionAttributeNames: { "#nm": "name" },
    ExpressionAttributeValues: {
      ":et": "PRODUCT",
      ":term": term.toLowerCase(),
    },
    Limit: limit,
    ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
  });

  return {
    items: result.items,
    lastEvaluatedKey: result.lastEvaluatedKey
      ? JSON.stringify(result.lastEvaluatedKey)
      : undefined,
  };
}

export { IVYSHOP_TABLE };
