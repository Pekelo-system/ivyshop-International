import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { SEED_PRODUCTS } from "../data";

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
const { runSeed } = await import("../seeder");

// ── Property 12: Seed data es idempotente ────────────────────────────────────

describe("Propiedad 12: Seed data es idempotente", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("N ejecuciones del seed producen el mismo conteo que una sola ejecución", async () => {
    // Feature: ivyshop, Property 12: Seed data es idempotente
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // number of executions
        async (n) => {
          vi.clearAllMocks();

          // First call: no flag exists, seed runs
          vi.mocked(mockHelpers.getItem).mockResolvedValueOnce(null);
          vi.mocked(mockHelpers.putItem).mockResolvedValue(undefined);

          const firstResult = await runSeed();
          expect(firstResult.seeded).toBe(true);
          expect(firstResult.productCount).toBe(SEED_PRODUCTS.length);

          const putCallsAfterFirst = vi.mocked(mockHelpers.putItem).mock.calls.length;

          // Subsequent calls: flag exists, seed skips
          for (let i = 1; i < n; i++) {
            vi.mocked(mockHelpers.getItem).mockResolvedValueOnce({
              PK: "SEED#METADATA",
              SK: "v1",
              entityType: "SEED_FLAG",
              seededAt: "2024-01-01T00:00:00Z",
              productCount: SEED_PRODUCTS.length,
            });

            const subsequentResult = await runSeed();
            expect(subsequentResult.seeded).toBe(false);
            expect(subsequentResult.productCount).toBe(0);
          }

          // Total putItem calls should not increase after first run
          const putCallsAfterAll = vi.mocked(mockHelpers.putItem).mock.calls.length;
          expect(putCallsAfterAll).toBe(putCallsAfterFirst);
        }
      ),
      { numRuns: 20 }
    );
  });
});
