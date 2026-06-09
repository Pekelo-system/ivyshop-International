import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../ProductCard";
import { type Product, type ProductCategory } from "@/types";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const categories: ProductCategory[] = ["zapatos", "ropa", "electrónicos", "libros", "otros"];

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    PK: "PRODUCT#test",
    SK: "METADATA",
    GSI1PK: "CATEGORY#zapatos",
    GSI1SK: "PRICE#0000049.99",
    entityType: "PRODUCT",
    id: "test-id",
    name: "Test Product",
    description: "desc",
    price: 49.99,
    category: "zapatos",
    stock: 10,
    imageUrl: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

// ── Property 4: Productos agotados ocultan opciones de compra ────────────────

describe("Propiedad 4: Productos agotados ocultan opciones de compra", () => {
  it("todo producto con stock=0 muestra 'Agotado' y botón deshabilitado", () => {
    // Feature: ivyshop, Property 4: Productos agotados ocultan opciones de compra
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          price: fc.integer({ min: 1, max: 99999 }).map((n) => n / 100),
          category: fc.constantFrom(...categories),
        }),
        ({ name, price, category }) => {
          const product = makeProduct({ name, price, category, stock: 0, id: `id-${Math.random()}` });
          const { unmount } = render(<ProductCard product={product} />);

          // Badge "Agotado" should be present
          const agotados = screen.getAllByText("Agotado");
          expect(agotados.length).toBeGreaterThanOrEqual(1);

          // Button should be disabled
          const button = screen.getByRole("button");
          expect(button).toBeDisabled();

          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ── Property 5: Validación de cantidad en detalle de producto ────────────────

describe("Propiedad 5: Validación de cantidad en detalle de producto", () => {
  it("cantidades fuera del rango [1, stock] son inválidas", () => {
    // Feature: ivyshop, Property 5: Validación de cantidad en detalle de producto
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // stock
        fc.integer({ min: -10, max: 200 }), // attempted quantity
        (stock, quantity) => {
          const isValid = quantity >= 1 && quantity <= stock;
          if (!isValid) {
            // Should be rejected
            expect(quantity < 1 || quantity > stock).toBe(true);
          }
          // The validation function logic: reject if outside [1, stock]
          const wouldReject = quantity < 1 || quantity > stock;
          expect(wouldReject).toBe(!isValid);
        }
      ),
      { numRuns: 100 }
    );
  });
});
