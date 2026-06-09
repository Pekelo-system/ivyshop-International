import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

/**
 * Amazon Bedrock Runtime client for ivyshop International.
 * Used for AI generation of product descriptions (Nova Lite) and images (Nova Canvas).
 * Requires IAM role with bedrock:InvokeModel permission.
 */
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
