import { describe, it, expect } from "vitest";
import { createProductSchema, updateProductSchema } from "../product";

describe("createProductSchema", () => {
  const validProduct = {
    name: "Producto de Prueba",
    price: 49.99,
    category: "zapatos",
    stock: 10,
  };

  it("acepta producto válido con campos mínimos", () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("acepta producto con todos los campos opcionales", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      description: "Una descripción",
      imageUrl: "https://example.com/image.png",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre mayor a 200 chars", () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rechaza precio menor a 0.01", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rechaza precio mayor a 999999.99", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 1000000 });
    expect(result.success).toBe(false);
  });

  it("rechaza stock negativo", () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock: -1 });
    expect(result.success).toBe(false);
  });

  it("rechaza categoría inválida", () => {
    const result = createProductSchema.safeParse({ ...validProduct, category: "invalida" });
    expect(result.success).toBe(false);
  });

  it("acepta las 5 categorías válidas", () => {
    const categories = ["zapatos", "ropa", "electrónicos", "libros", "otros"];
    categories.forEach((cat) => {
      const result = createProductSchema.safeParse({ ...validProduct, category: cat });
      expect(result.success).toBe(true);
    });
  });
});

describe("updateProductSchema", () => {
  it("acepta actualización parcial (solo nombre)", () => {
    const result = updateProductSchema.safeParse({ name: "Nuevo nombre" });
    expect(result.success).toBe(true);
  });

  it("acepta objeto vacío (todo opcional)", () => {
    const result = updateProductSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rechaza precio inválido en actualización parcial", () => {
    const result = updateProductSchema.safeParse({ price: -5 });
    expect(result.success).toBe(false);
  });
});
