import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { filterProducts, type SearchFilters } from "../filter";
import { type Product, type ProductCategory } from "@/types";
import { searchFiltersSchema } from "@/lib/validations/search";

// ── Arbitraries ──────────────────────────────────────────────────────────────

const categories: ProductCategory[] = ["zapatos", "ropa", "electrónicos", "libros", "otros"];

function arbitraryProduct(): fc.Arbitrary<Product> {
  return fc.record({
    PK: fc.string().map((s) => `PRODUCT#${s}` as string),
    SK: fc.constant("METADATA" as const),
    GSI1PK: fc.constantFrom(...categories).map((c) => `CATEGORY#${c}`),
    GSI1SK: fc.string().map((s) => `PRICE#${s}`),
    entityType: fc.constant("PRODUCT" as const),
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string(),
    price: fc.integer({ min: 1, max: 99999999 }).map((n) => n / 100),
    category: fc.constantFrom(...categories),
    stock: fc.integer({ min: 0, max: 1000 }),
    imageUrl: fc.option(fc.webUrl(), { nil: null }),
    createdAt: fc.integer({ min: 1577836800000, max: 1924905600000 }).map((ms) => new Date(ms).toISOString()),
    updatedAt: fc.integer({ min: 1577836800000, max: 1924905600000 }).map((ms) => new Date(ms).toISOString()),
  });
}

// ── Property 1: Búsqueda insensible a mayúsculas/minúsculas ──────────────────

describe("Propiedad 1: Búsqueda insensible a mayúsculas/minúsculas", () => {
  it("retorna los mismos resultados independientemente del case del término", () => {
    // Feature: ivyshop, Property 1: Búsqueda insensible a mayúsculas/minúsculas
    fc.assert(
      fc.property(
        fc.array(arbitraryProduct(), { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (products, term) => {
          const lower = filterProducts(products, { q: term.toLowerCase() });
          const upper = filterProducts(products, { q: term.toUpperCase() });
          const mixed = filterProducts(products, { q: term });

          // All case variants should return the same set of product IDs
          const lowerIds = lower.map((p) => p.id).sort();
          const upperIds = upper.map((p) => p.id).sort();
          const mixedIds = mixed.map((p) => p.id).sort();

          expect(lowerIds).toEqual(upperIds);
          expect(lowerIds).toEqual(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("todos los resultados contienen el término (case-insensitive)", () => {
    // Feature: ivyshop, Property 1: Búsqueda insensible a mayúsculas/minúsculas
    fc.assert(
      fc.property(
        fc.array(arbitraryProduct(), { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0),
        (products, term) => {
          const results = filterProducts(products, { q: term });
          return results.every((p) =>
            p.name.toLowerCase().includes(term.trim().toLowerCase())
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 2: Filtros combinados son conjuntivos ───────────────────────────

describe("Propiedad 2: Filtros combinados son conjuntivos", () => {
  it("todos los resultados satisfacen simultáneamente todos los criterios activos", () => {
    // Feature: ivyshop, Property 2: Filtros combinados son conjuntivos
    fc.assert(
      fc.property(
        fc.array(arbitraryProduct(), { minLength: 1, maxLength: 20 }),
        fc.record({
          q: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
          categoria: fc.option(fc.constantFrom(...categories), { nil: undefined }),
          precioMin: fc.option(fc.integer({ min: 0, max: 50000 }).map((n) => n / 100), { nil: undefined }),
          precioMax: fc.option(fc.integer({ min: 50000, max: 100000 }).map((n) => n / 100), { nil: undefined }),
        }),
        (products, filters) => {
          const results = filterProducts(products, filters as SearchFilters);

          return results.every((p) => {
            if (filters.q && !p.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
            if (filters.categoria && p.category !== filters.categoria) return false;
            if (filters.precioMin !== undefined && p.price < filters.precioMin) return false;
            if (filters.precioMax !== undefined && p.price > filters.precioMax) return false;
            return true;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("no omite ningún producto que cumpla todos los criterios", () => {
    // Feature: ivyshop, Property 2: Filtros combinados son conjuntivos
    fc.assert(
      fc.property(
        fc.array(arbitraryProduct(), { minLength: 1, maxLength: 20 }),
        fc.record({
          q: fc.option(fc.string({ minLength: 1, maxLength: 5 }), { nil: undefined }),
          categoria: fc.option(fc.constantFrom(...categories), { nil: undefined }),
        }),
        (products, filters) => {
          const results = filterProducts(products, filters as SearchFilters);
          const resultIds = new Set(results.map((p) => p.id));

          // Check no qualifying product is omitted
          products.forEach((p) => {
            let matches = true;
            if (filters.q && !p.name.toLowerCase().includes(filters.q.toLowerCase())) matches = false;
            if (filters.categoria && p.category !== filters.categoria) matches = false;
            if (matches) {
              expect(resultIds.has(p.id)).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 3: Validación de rango de precio ────────────────────────────────

describe("Propiedad 3: Validación de rango de precio", () => {
  it("rechaza consultas donde precioMin > precioMax", () => {
    // Feature: ivyshop, Property 3: Validación de rango de precio
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999999 }),
        fc.integer({ min: 0, max: 999998 }),
        (a, b) => {
          // Ensure precioMin is strictly greater than precioMax
          const min = Math.max(a, b) + 1;
          const max = Math.min(a, b);

          const result = searchFiltersSchema.safeParse({ precioMin: min, precioMax: max });

          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
