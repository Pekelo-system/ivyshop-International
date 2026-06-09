import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { removeCartItem } from "@/lib/dynamo/carts";
import { type ApiResponse } from "@/types";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 }
    );
  }

  try {
    const { itemId: productId } = await params;
    await removeCartItem(userId, productId);
    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Ítem eliminado del carrito" },
    });
  } catch (error) {
    console.error("[DELETE /api/carrito/[itemId]] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Error al eliminar el ítem del carrito" } },
      { status: 500 }
    );
  }
}
