import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, confirmCodeSchema } from "../auth";

describe("loginSchema", () => {
  it("acepta email y contraseña válidos", () => {
    const result = loginSchema.safeParse({ email: "user@test.com", password: "Abc12345" });
    expect(result.success).toBe(true);
  });

  it("rechaza email vacío", () => {
    const result = loginSchema.safeParse({ email: "", password: "Abc12345" });
    expect(result.success).toBe(false);
  });

  it("rechaza email inválido", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "Abc12345" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "user@test.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = { email: "user@test.com", password: "Abcdef1!", confirmPassword: "Abcdef1!" };

  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rechaza contraseña corta (< 8 chars)", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Ab1!", confirmPassword: "Ab1!" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña sin mayúscula", () => {
    const result = registerSchema.safeParse({ ...validData, password: "abcdef12", confirmPassword: "abcdef12" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña sin minúscula", () => {
    const result = registerSchema.safeParse({ ...validData, password: "ABCDEF12", confirmPassword: "ABCDEF12" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña sin número", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Abcdefgh", confirmPassword: "Abcdefgh" });
    expect(result.success).toBe(false);
  });

  it("rechaza confirmPassword que no coincide", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
  });
});

describe("confirmCodeSchema", () => {
  it("acepta código de 6 dígitos", () => {
    const result = confirmCodeSchema.safeParse({ code: "123456" });
    expect(result.success).toBe(true);
  });

  it("rechaza código con letras", () => {
    const result = confirmCodeSchema.safeParse({ code: "12abc6" });
    expect(result.success).toBe(false);
  });

  it("rechaza código de menos de 6 dígitos", () => {
    const result = confirmCodeSchema.safeParse({ code: "1234" });
    expect(result.success).toBe(false);
  });

  it("rechaza código de más de 6 dígitos", () => {
    const result = confirmCodeSchema.safeParse({ code: "1234567" });
    expect(result.success).toBe(false);
  });
});
