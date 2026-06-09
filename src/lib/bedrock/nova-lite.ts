import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient } from "./client";

/**
 * Generate a product description using Amazon Nova Lite via Bedrock.
 * Timeout: 30 seconds.
 */
export async function generateDescription(
  name: string,
  category: string
): Promise<string> {
  const prompt = `Genera una descripción comercial atractiva en español para un producto de ecommerce.
Producto: "${name}"
Categoría: "${category}"
La descripción debe ser de 2-3 oraciones, destacando características principales y beneficios.
Solo responde con la descripción, sin comillas ni texto adicional.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const command = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 300,
          temperature: 0.7,
          topP: 0.9,
        },
      }),
    });

    const response = await bedrockClient.send(command, {
      abortSignal: controller.signal,
    });

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.results?.[0]?.outputText ?? responseBody.outputText ?? "";
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
