import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { getCart, calculateCartTotal } from "@/lib/dynamo/carts";
import { createOrder, StockInsufficientError } from "@/lib/dynamo/orders";
import { shippingAddressSchema } from "@/lib/validations/checkout";
import { type ApiResponse, type Order, type OrderItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: (ctx) => fetchAuthSession(ctx),
    });
    return (session.tokens?.accessToken?.payload?.sub as string) ?? null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para realizar un pedido" } },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await request.json();

    // Validate shipping address
    const parsed = shippingAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Datos de envío inválidos" } },
        { status: 400 }
      );
    }

    // Get user's cart
    const cartItems = await getCart(userId);
    if (cartItems.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "VALIDATION_ERROR", message: "El carrito está vacío. Agrega productos antes de continuar." } },
        { status: 400 }
      );
    }

    // Build order items
    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productId, // In production, fetch product name
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const totalAmount = calculateCartTotal(cartItems);
    const orderId = uuidv4();

    // Create order atomically (stock decrement + order creation)
    const order = await createOrder(
      {
        id: orderId,
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress: parsed.data,
        status: "CONFIRMED",
      },
      cartItems
    );

    return NextResponse.json<ApiResponse<Order>>(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof StockInsufficientError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "STOCK_INSUFFICIENT", message: "Stock insuficiente para uno o más productos. Ajusta las cantidades." } },
        { status: 409 }
      );
    }
    console.error("[POST /api/ordenes] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Error al crear la orden" } },
      { status: 500 }
    );
  }
}
