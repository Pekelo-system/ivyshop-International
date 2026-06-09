import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDB client for ivyshop International.
 * Uses environment variables for configuration — populated by Amplify Gen2.
 *
 * Environment variables set by Amplify:
 *   AWS_REGION            - AWS region
 *   AWS_ACCESS_KEY_ID     - Access key (in Lambda/Amplify env)
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_SESSION_TOKEN     (optional)
 *   DYNAMODB_TABLE_NAME   - Table name override (defaults to "ivyshop")
 */

export const IVYSHOP_TABLE = process.env.DYNAMODB_TABLE_NAME ?? "ivyshop";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});
