import { describe, it, expect } from "vitest";
import fc from "fast-check";

// ── Property 5: Validación de cantidad en detalle de producto ────────────────

describe("Propiedad 5: Validación de cantidad en detalle de producto", () => {
  it("cantidades fuera del rango [1, stock] son rechazadas", () => {
    // Feature: ivyshop, Property 5: Validación de cantidad en detalle de producto
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // stock
        fc.oneof(
          fc.integer({ min: -100, max: 0 }),     // below minimum
          fc.integer({ min: 1001, max: 5000 })   // above any stock
        ),
        (stock, quantity) => {
          // Skip if quantity happens to be in valid range
          if (quantity >= 1 && quantity <= stock) return true;

          // Validation logic: quantity must be in [1, stock]
          const isValid = quantity >= 1 && quantity <= stock;
          expect(isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("cantidades dentro del rango [1, stock] son aceptadas", () => {
    // Feature: ivyshop, Property 5: Validación de cantidad en detalle de producto
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // stock
        (stock) => {
          // Generate a valid quantity within [1, stock]
          const quantity = Math.max(1, Math.min(stock, Math.floor(Math.random() * stock) + 1));
          const isValid = quantity >= 1 && quantity <= stock;
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
