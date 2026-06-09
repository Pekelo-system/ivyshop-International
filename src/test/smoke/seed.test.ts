import { describe, it, expect, vi } from "vitest";
import { checkSeedFlag, runSeed } from "@/lib/seed/seeder";
import { SEED_PRODUCTS } from "@/lib/seed/data";

vi.mock("@/lib/dynamo/helpers", () => ({
  getItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
  queryItems: vi.fn(),
  scanItems: vi.fn(),
  transactWrite: vi.fn(),
}));

const mockHelpers = await import("@/lib/dynamo/helpers");

describe("Smoke: Seed Data", () => {
  it("contiene al menos 20 productos distribuidos en 5 categorías", () => {
    expect(SEED_PRODUCTS.length).toBeGreaterThanOrEqual(20);

    const categories = new Set(SEED_PRODUCTS.map((p) => p.category));
    expect(categories.size).toBe(5);
    expect(categories).toContain("zapatos");
    expect(categories).toContain("ropa");
    expect(categories).toContain("electrónicos");
    expect(categories).toContain("libros");
    expect(categories).toContain("otros");
  });

  it("cada producto tiene los campos obligatorios", () => {
    SEED_PRODUCTS.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.stock).toBeGreaterThanOrEqual(0);
      expect(p.PK).toMatch(/^PRODUCT#/);
      expect(p.SK).toBe("METADATA");
      expect(p.GSI1PK).toMatch(/^CATEGORY#/);
      expect(p.GSI1SK).toMatch(/^PRICE#/);
    });
  });

  it("seed es idempotente — no inserta si ya existe el flag", async () => {
    vi.mocked(mockHelpers.getItem).mockResolvedValueOnce({
      PK: "SEED#METADATA",
      SK: "v1",
      entityType: "SEED_FLAG",
      seededAt: "2024-01-01T00:00:00Z",
      productCount: 22,
    });

    const result = await runSeed();
    expect(result.seeded).toBe(false);
    expect(result.productCount).toBe(0);
    expect(mockHelpers.putItem).not.toHaveBeenCalled();
  });

  it("seed inserta productos cuando no existe el flag", async () => {
    vi.mocked(mockHelpers.getItem).mockResolvedValueOnce(null);
    vi.mocked(mockHelpers.putItem).mockResolvedValue(undefined);

    const result = await runSeed();
    expect(result.seeded).toBe(true);
    expect(result.productCount).toBe(SEED_PRODUCTS.length);
    // Products + 1 seed flag
    expect(mockHelpers.putItem).toHaveBeenCalledTimes(SEED_PRODUCTS.length + 1);
  });
});
