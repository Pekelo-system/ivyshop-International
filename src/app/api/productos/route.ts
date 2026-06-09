import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { listProducts, createProduct } from "@/lib/dynamo/products";
import { filterProducts } from "@/lib/search/filter";
import { searchFiltersSchema } from "@/lib/validations/search";
import { createProductSchema } from "@/lib/validations/product";
import { type ApiResponse, type PaginatedResponse, type Product } from "@/types";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/productos
 * Returns a paginated list of products with optional search/filter support.
 * Query params:
 *   ?limit=20           — items per page (default 20, max 100)
 *   ?cursor=<key>       — pagination cursor (lastEvaluatedKey from previous response)
 *   ?q=<term>           — case-insensitive text search on product name
 *   ?categoria=<cat>    — filter by category
 *   ?precioMin=<n>      — minimum price (inclusive)
 *   ?precioMax=<n>      — maximum price (inclusive)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") ?? undefined;

    const limit = Math.min(
      Math.max(1, parseInt(limitParam ?? "20", 10) || 20),
      100
    );

    // Parse and validate search/filter params
    const rawFilters = {
      q: searchParams.get("q") ?? undefined,
      categoria: searchParams.get("categoria") ?? undefined,
      precioMin: searchParams.get("precioMin") ?? undefined,
      precioMax: searchParams.get("precioMax") ?? undefined,
    };

    const parsed = searchFiltersSchema.safeParse(rawFilters);
    if (!parsed.success) {
      return NextResponse.json<PaginatedResponse<Product>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              parsed.error.issues[0]?.message ??
              "Parámetros de búsqueda inválidos",
          },
        },
        { status: 400 }
      );
    }

    const filters = parsed.data;
    const hasFilters =
      filters.q ||
      filters.categoria ||
      filters.precioMin !== undefined ||
      filters.precioMax !== undefined;

    // When filters are active, scan a large page then filter in-memory.
    // For production, push filters to DynamoDB FilterExpression or GSI queries.
    const result = await listProducts({
      limit: hasFilters ? 1000 : limit,
      lastEvaluatedKey: cursor,
    });

    const filtered = hasFilters
      ? filterProducts(result.items, filters)
      : result.items;

    const paginatedItems = hasFilters ? filtered.slice(0, limit) : filtered;

    return NextResponse.json<PaginatedResponse<Product>>({
      success: true,
      data: paginatedItems,
      pagination: {
        page: 1,
        limit,
        lastEvaluatedKey: hasFilters ? undefined : result.lastEvaluatedKey,
      },
    });
  } catch (error) {
    console.error("[GET /api/productos] Error:", error);
    return NextResponse.json<PaginatedResponse<Product>>(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Error al obtener los productos",
        },
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

// ─── POST /api/productos ─────────────────────────────────────────────────────

/**
 * POST /api/productos
 * Creates a new product. Requires Administradores role.
 */
export async function POST(request: NextRequest) {
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
    const body: unknown = await request.json();
    const parsed = createProductSchema.safeParse(body);
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

    const product = await createProduct({
      id: uuidv4(),
      ...parsed.data,
      description: parsed.data.description ?? "",
      imageUrl: parsed.data.imageUrl ?? null,
    });

    return NextResponse.json<ApiResponse<Product>>(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/productos] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "DB_ERROR", message: "Error al crear el producto" },
      },
      { status: 500 }
    );
  }
}
