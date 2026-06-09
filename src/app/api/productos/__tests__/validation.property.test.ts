import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createProductSchema } from "@/lib/validations/product";

// ── Property 11: Validación de campos de producto ────────────────────────────

describe("Propiedad 11: Validación de campos de producto (creación y modificación)", () => {
  it("rechaza productos con nombre vacío o > 200 chars", () => {
    // Feature: ivyshop, Property 11: Validación de campos de producto
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(""), // empty
          fc.string({ minLength: 201, maxLength: 300 }), // too long
        ),
        (name) => {
          const result = createProductSchema.safeParse({
            name,
            price: 10,
            category: "zapatos",
            stock: 5,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rechaza productos con precio fuera de [0.01, 999999.99]", () => {
    // Feature: ivyshop, Property 11: Validación de campos de producto
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ min: -1000, max: 0, noNaN: true }), // negative or zero
          fc.float({ min: 1000000, max: 9999999, noNaN: true }), // too high
        ),
        (price) => {
          const result = createProductSchema.safeParse({
            name: "Valid Name",
            price,
            category: "zapatos",
            stock: 5,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rechaza productos con stock negativo", () => {
    // Feature: ivyshop, Property 11: Validación de campos de producto
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: -1 }),
        (stock) => {
          const result = createProductSchema.safeParse({
            name: "Valid Name",
            price: 10,
            category: "zapatos",
            stock,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rechaza productos con categoría inválida", () => {
    // Feature: ivyshop, Property 11: Validación de campos de producto
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(
          (s) => !["zapatos", "ropa", "electrónicos", "libros", "otros"].includes(s)
        ),
        (category) => {
          const result = createProductSchema.safeParse({
            name: "Valid Name",
            price: 10,
            category,
            stock: 5,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("acepta productos válidos con todos los campos correctos", () => {
    // Feature: ivyshop, Property 11: Validación de campos de producto
    const categories = ["zapatos", "ropa", "electrónicos", "libros", "otros"] as const;
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.integer({ min: 1, max: 99999999 }).map((n) => n / 100),
        fc.constantFrom(...categories),
        fc.integer({ min: 0, max: 10000 }),
        (name, price, category, stock) => {
          const result = createProductSchema.safeParse({ name, price, category, stock });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
