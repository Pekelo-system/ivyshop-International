import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/dynamo/products";
import { updateProductSchema } from "@/lib/validations/product";
import { type ApiResponse, type Product } from "@/types";

/**
 * GET /api/productos/[id]
 * Returns a single product by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ApiResponse<Product>>(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "ID de producto requerido" },
        },
        { status: 400 }
      );
    }

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json<ApiResponse<Product>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Producto no encontrado" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Product>>({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("[GET /api/productos/[id]] Error:", error);
    return NextResponse.json<ApiResponse<Product>>(
      {
        success: false,
        error: { code: "DB_ERROR", message: "Error al obtener el producto" },
      },
      { status: 500 }
    );
  }
}

// ─── Admin helper ─────────────────────────────────────────────────────────────

async function getAdminUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: (ctx) => fetchAuthSession(ctx),
    });
    const groups =
      (session.tokens?.accessToken?.payload?.["cognito:groups"] as string[]) ??
      [];
    if (!groups.includes("Administradores")) return null;
    return (session.tokens?.accessToken?.payload?.sub as string) ?? null;
  } catch {
    return null;
  }
}

// ─── PUT /api/productos/[id] ─────────────────────────────────────────────────

/**
 * PUT /api/productos/[id]
 * Updates an existing product. Requires Administradores role.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId(request);
  if (!adminId) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Se requiere rol de Administrador",
        },
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Datos inválidos",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, parsed.data);
    if (!updated) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Producto no encontrado" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Product>>({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/productos/[id]] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Error al actualizar el producto",
        },
      },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/productos/[id] ───────────────────────────────────────────────

/**
 * DELETE /api/productos/[id]
 * Deletes a product by ID. Requires Administradores role.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId(request);
  if (!adminId) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Se requiere rol de Administrador",
        },
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Producto eliminado correctamente" },
    });
  } catch (error) {
    console.error("[DELETE /api/productos/[id]] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "DB_ERROR", message: "Error al eliminar el producto" },
      },
      { status: 500 }
    );
  }
}
