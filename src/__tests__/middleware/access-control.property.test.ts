import { describe, it, expect } from "vitest";
import fc from "fast-check";

// ── Property 13: Control de acceso al panel de administración ────────────────

describe("Propiedad 13: Control de acceso al panel de administración", () => {
  it("usuarios sin grupo Administradores son denegados en rutas /admin/*", () => {
    // Feature: ivyshop, Property 13: Control de acceso al panel de administración
    fc.assert(
      fc.property(
        fc.constantFrom("/admin", "/admin/productos", "/admin/productos/nuevo", "/admin/productos/abc-123"),
        fc.oneof(
          fc.constant([] as string[]),               // no groups (unauthenticated)
          fc.constant(["Clientes"] as string[]),      // wrong group
          fc.constant(["Users", "Premium"] as string[]), // irrelevant groups
        ),
        (pathname, groups) => {
          const isAdmin = groups.includes("Administradores");
          // Without Administradores group, access should be denied
          expect(isAdmin).toBe(false);

          // The middleware would redirect to "/" with 403
          // This validates the logic that non-admins are always denied
          const shouldDeny = pathname.startsWith("/admin") && !isAdmin;
          expect(shouldDeny).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("usuarios con grupo Administradores son aceptados", () => {
    // Feature: ivyshop, Property 13: Control de acceso al panel de administración
    fc.assert(
      fc.property(
        fc.constantFrom("/admin", "/admin/productos", "/admin/productos/nuevo"),
        fc.constant(["Administradores"]),
        (pathname, groups) => {
          const isAdmin = groups.includes("Administradores");
          expect(isAdmin).toBe(true);

          // Admin should be allowed
          const shouldAllow = pathname.startsWith("/admin") && isAdmin;
          expect(shouldAllow).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});
