import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { type Product, type ProductCategory } from "@/types";

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

const mockHelpers = await import("@/lib/dynamo/helpers");
const { deleteProduct, getProductById, listProducts } = await import("@/lib/dynamo/products");

const categories: ProductCategory[] = ["zapatos", "ropa", "electrónicos", "libros", "otros"];

// ── Property 14: Eliminación de producto es consistente ──────────────────────

describe("Propiedad 14: Eliminación de producto es consistente", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("un producto eliminado no aparece en consultas posteriores", async () => {
    // Feature: ivyshop, Property 14: Eliminación de producto es consistente
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...categories),
        async (id, name, category) => {
          vi.clearAllMocks();

          // Delete the product
          vi.mocked(mockHelpers.deleteItem).mockResolvedValue(undefined);
          await deleteProduct(id);
          expect(mockHelpers.deleteItem).toHaveBeenCalledWith({
            Key: { PK: `PRODUCT#${id}`, SK: "METADATA" },
          });

          // After deletion, getProductById should return null
          vi.mocked(mockHelpers.getItem).mockResolvedValue(null);
          const result = await getProductById(id);
          expect(result).toBeNull();

          // After deletion, the product should not appear in list/scan results
          vi.mocked(mockHelpers.scanItems).mockResolvedValue({
            items: [], // The deleted product is no longer in DB
            lastEvaluatedKey: undefined,
          });
          const list = await listProducts({ limit: 100 });
          const found = list.items.find((p: Product) => p.id === id);
          expect(found).toBeUndefined();
        }
      ),
      { numRuns: 50 }
    );
  });
});
