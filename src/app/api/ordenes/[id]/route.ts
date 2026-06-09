import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { getOrderById } from "@/lib/dynamo/orders";
import { type ApiResponse, type Order } from "@/types";

async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: (ctx) => fetchAuthSession(ctx),
    });
    return (session.tokens?.accessToken?.payload?.sub as string) ?? null;
  } catch { return null; }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "NOT_FOUND", message: "Orden no encontrada" } },
        { status: 404 }
      );
    }

    // Verify the order belongs to the authenticated user
    if (order.userId !== userId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes acceso a esta orden" } },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<Order>>({ success: true, data: order });
  } catch (error) {
    console.error("[GET /api/ordenes/[id]] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Error al obtener la orden" } },
      { status: 500 }
    );
  }
}
