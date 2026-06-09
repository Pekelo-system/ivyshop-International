import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";
import { generateImage } from "@/lib/bedrock/nova-canvas";
import { type ApiResponse } from "@/types";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
});

async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: (ctx) => fetchAuthSession(ctx),
    });
    const groups = (session.tokens?.accessToken?.payload?.["cognito:groups"] as string[]) ?? [];
    return groups.includes("Administradores");
  } catch { return false; }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "FORBIDDEN", message: "Se requiere rol de Administrador" } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Se requiere nombre y categoría" } },
        { status: 400 }
      );
    }

    const imageUrl = await generateImage(parsed.data.name, parsed.data.category);
    return NextResponse.json<ApiResponse<{ imageUrl: string }>>({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    console.error("[POST /api/genai/imagen] Error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "GENAI_FAILURE", message: "Error al generar la imagen. Puedes subir una manualmente." } },
      { status: 503 }
    );
  }
}
