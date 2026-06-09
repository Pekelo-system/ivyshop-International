import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { getCart, upsertCartItem, calculateCartTotal } from "@/lib/dynamo/carts";
import { type ApiResponse, type CartItem } from "@/types";
import { z } from "zod";

const addItemSchema = z.object({
  productId: z.string().min(1, "El ID del producto es requerido"),
  quantity: z.number().int().min(1, "La cantidad mínima es 1"),
  unitPrice: z.number().min(0.01, "El precio debe ser mayor a 0"),
});

async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: (ctx) => fetchAuthSession(ctx),
    });
    return (session.tokens?.accessToken?.payload?.sub as string) ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para ver tu carrito" } },
      { status: 401 }
    );
  }

  try {
    const items = await getCart(userId);
    const total = calculateCartTotal(items);
    return NextResponse.json<ApiResponse<{ items: CartItem[]; total: number }>>({
      success: true,
      data: { items, total },
    });
  } catch (error) {
    console.error("[GET /api/carrito] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Error al obtener el carrito" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para modificar tu carrito" } },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Datos inválidos" } },
        { status: 400 }
      );
    }

    const { productId, quantity, unitPrice } = parsed.data;
    const item = await upsertCartItem(userId, productId, quantity, unitPrice);

    return NextResponse.json<ApiResponse<CartItem>>({ success: true, data: item });
  } catch (error) {
    console.error("[PUT /api/carrito] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Error al actualizar el carrito" } },
      { status: 500 }
    );
  }
}
