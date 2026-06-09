import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "../ProductCard";
import { type Product } from "@/types";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const baseProduct: Product = {
  PK: "PRODUCT#test-1",
  SK: "METADATA",
  GSI1PK: "CATEGORY#zapatos",
  GSI1SK: "PRICE#0000049.99",
  entityType: "PRODUCT",
  id: "test-1",
  name: "Zapatillas de Prueba",
  description: "Una descripción",
  price: 49.99,
  category: "zapatos",
  stock: 10,
  imageUrl: "https://example.com/img.jpg",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("ProductCard", () => {
  it("muestra nombre, precio y categoría", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Zapatillas de Prueba")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("Zapatos")).toBeInTheDocument();
  });

  it("muestra imagen del producto cuando imageUrl existe", () => {
    render(<ProductCard product={baseProduct} />);
    const img = screen.getByAltText("Zapatillas de Prueba");
    expect(img).toBeInTheDocument();
  });

  it("muestra placeholder cuando imageUrl es null", () => {
    const noImageProduct = { ...baseProduct, imageUrl: null };
    render(<ProductCard product={noImageProduct} />);
    expect(screen.queryByAltText("Zapatillas de Prueba")).not.toBeInTheDocument();
  });

  it("muestra badge 'Agotado' cuando stock es 0", () => {
    const outOfStock = { ...baseProduct, stock: 0 };
    render(<ProductCard product={outOfStock} />);
    const badges = screen.getAllByText("Agotado");
    // Badge overlay and button both show "Agotado"
    expect(badges.length).toBeGreaterThanOrEqual(1);
    // The badge element specifically has data-variant="destructive"
    const badge = badges.find((el) => el.getAttribute("data-variant") === "destructive");
    expect(badge).toBeInTheDocument();
  });

  it("deshabilita botón cuando stock es 0", () => {
    const outOfStock = { ...baseProduct, stock: 0 };
    render(<ProductCard product={outOfStock} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("habilita botón cuando stock > 0", () => {
    render(<ProductCard product={baseProduct} />);
    const button = screen.getByRole("button", { name: /agregar/i });
    expect(button).not.toBeDisabled();
  });

  it("llama onAddToCart al hacer clic en botón habilitado", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ProductCard product={baseProduct} onAddToCart={onAdd} />);
    const button = screen.getByRole("button", { name: /agregar/i });
    await user.click(button);
    expect(onAdd).toHaveBeenCalledWith(baseProduct);
  });

  it("no llama onAddToCart cuando está agotado", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const outOfStock = { ...baseProduct, stock: 0 };
    render(<ProductCard product={outOfStock} onAddToCart={onAdd} />);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
