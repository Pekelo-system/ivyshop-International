import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Smoke: Auth Configuration", () => {
  it("auth resource define el grupo Administradores", () => {
    const authContent = readFileSync(
      resolve(__dirname, "../../../amplify/auth/resource.ts"),
      "utf-8"
    );
    expect(authContent).toContain("Administradores");
    expect(authContent).toContain("groups");
  });

  it("backend aplica política de contraseñas (8 chars min)", () => {
    const backendContent = readFileSync(
      resolve(__dirname, "../../../amplify/backend.ts"),
      "utf-8"
    );
    expect(backendContent).toContain("minimumLength: 8");
    expect(backendContent).toContain("requireUppercase: true");
    expect(backendContent).toContain("requireLowercase: true");
    expect(backendContent).toContain("requireNumbers: true");
  });

  it("storage define bucket product-images con acceso de Administradores", () => {
    const storageContent = readFileSync(
      resolve(__dirname, "../../../amplify/storage/resource.ts"),
      "utf-8"
    );
    expect(storageContent).toContain("product-images");
    expect(storageContent).toContain("Administradores");
  });
});
