import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawer } from "../CartDrawer";

// Mock useCart Zustand store
const mockItems: unknown[] = [];
const mockUpdateQuantity = vi.fn();
const mockRemoveItem = vi.fn();
const mockGetTotal = vi.fn(() => 0);
const mockGetTotalItems = vi.fn(() => 0);

vi.mock("@/hooks/useCart", () => ({
  useCart: (selector: unknown) => {
    const state = {
      items: mockItems,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      getTotal: () => mockGetTotal(),
      getTotalItems: () => mockGetTotalItems(),
    };
    return typeof selector === "function"
      ? (selector as (s: typeof state) => unknown)(state)
      : state;
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockItems.length = 0;
    mockGetTotal.mockReturnValue(0);
    mockGetTotalItems.mockReturnValue(0);
  });

  it("no renderiza cuando open es false", () => {
    const { container } = render(<CartDrawer open={false} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("muestra mensaje de carrito vacío cuando no hay ítems", () => {
    render(<CartDrawer open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("muestra ítems cuando el carrito tiene productos", () => {
    mockItems.push({
      productId: "prod-1",
      quantity: 2,
      unitPrice: 25.0,
      PK: "CART#u",
      SK: "ITEM#PRODUCT#prod-1",
      entityType: "CART_ITEM",
      userId: "u",
      createdAt: "",
      updatedAt: "",
    });
    mockGetTotal.mockReturnValue(50.0);
    mockGetTotalItems.mockReturnValue(2);

    render(<CartDrawer open={true} onClose={vi.fn()} />);
    expect(screen.getByText("$25.00 c/u")).toBeInTheDocument();
  });

  it("llama onClose al hacer clic en el botón cerrar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CartDrawer open={true} onClose={onClose} />);
    const closeBtn = screen.getByLabelText("Cerrar carrito");
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
