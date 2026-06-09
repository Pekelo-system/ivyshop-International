import { describe, it, expect } from "vitest";
import { shippingAddressSchema } from "../checkout";

describe("shippingAddressSchema", () => {
  const validAddress = {
    fullName: "Juan Pérez",
    street: "Calle Principal 123",
    city: "Bogotá",
    stateOrProvince: "Cundinamarca",
    postalCode: "110111",
    country: "Colombia",
  };

  it("acepta dirección completa válida", () => {
    const result = shippingAddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("rechaza fullName vacío", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza street vacío", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, street: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza city vacío", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, city: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza stateOrProvince vacío", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, stateOrProvince: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza postalCode vacío", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, postalCode: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza country vacío", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, country: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza fullName mayor a 200 chars", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, fullName: "a".repeat(201) });
    expect(result.success).toBe(false);
  });
});
