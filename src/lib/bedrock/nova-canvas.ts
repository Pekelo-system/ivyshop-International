import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient } from "./client";

/**
 * Generate a product image using Amazon Nova Canvas via Bedrock.
 * Returns a base64-encoded image string.
 * In production, upload to S3 and return the URL.
 * Timeout: 30 seconds.
 */
export async function generateImage(
  name: string,
  category: string
): Promise<string> {
  const prompt = `Professional product photography of "${name}" (${category} category), white background, studio lighting, high quality, ecommerce product shot`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const command = new InvokeModelCommand({
      modelId: "amazon.nova-canvas-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        taskType: "TEXT_IMAGE",
        textToImageParams: {
          text: prompt,
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          width: 512,
          height: 512,
          quality: "standard",
        },
      }),
    });

    const response = await bedrockClient.send(command, {
      abortSignal: controller.signal,
    });

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const base64Image = responseBody.images?.[0] ?? "";

    // For the prototype, return as a data URL.
    // In production, upload to S3 via Amplify Storage and return the S3 URL.
    if (base64Image) {
      return `data:image/png;base64,${base64Image}`;
    }

    throw new Error("No image generated");
  } finally {
    clearTimeout(timeout);
  }
}
