import { NextRequest, NextResponse } from "next/server";
import { runSeed } from "@/lib/seed/seeder";
import { type ApiResponse } from "@/types";

/**
 * POST /api/seed
 * Loads seed data idempotently. Protected by a shared secret or Admin token.
 * Only runs if seed has not been executed before.
 */
export async function POST(request: NextRequest) {
  // Basic protection: require a secret header matching the env var
  const authHeader = request.headers.get("x-seed-secret");
  const seedSecret = process.env.SEED_SECRET;

  if (seedSecret && authHeader !== seedSecret) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "No autorizado" },
      },
      { status: 401 }
    );
  }

  try {
    const result = await runSeed();

    if (!result.seeded) {
      return NextResponse.json<ApiResponse<{ message: string }>>({
        success: true,
        data: {
          message:
            "El seed ya fue ejecutado anteriormente. No se realizaron cambios.",
        },
      });
    }

    return NextResponse.json<ApiResponse<{ productCount: number }>>(
      {
        success: true,
        data: { productCount: result.productCount },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[seed] Error ejecutando seed:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Error al cargar los datos iniciales",
          details:
            process.env.NODE_ENV === "development" ? error : undefined,
        },
      },
      { status: 500 }
    );
  }
}
