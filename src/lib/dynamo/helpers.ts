import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
  type GetCommandInput,
  type PutCommandInput,
  type DeleteCommandInput,
  type QueryCommandInput,
  type ScanCommandInput,
  type TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { docClient, IVYSHOP_TABLE } from "./client";

// ─── getItem ────────────────────────────────────────────────────────────────

export async function getItem<T>(
  params: Omit<GetCommandInput, "TableName">
): Promise<T | null> {
  const result = await docClient.send(
    new GetCommand({ TableName: IVYSHOP_TABLE, ...params })
  );
  return (result.Item as T) ?? null;
}

// ─── putItem ─────────────────────────────────────────────────────────────────

export async function putItem(
  params: Omit<PutCommandInput, "TableName">
): Promise<void> {
  await docClient.send(new PutCommand({ TableName: IVYSHOP_TABLE, ...params }));
}

// ─── deleteItem ──────────────────────────────────────────────────────────────

export async function deleteItem(
  params: Omit<DeleteCommandInput, "TableName">
): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: IVYSHOP_TABLE, ...params })
  );
}

// ─── queryItems ──────────────────────────────────────────────────────────────

export async function queryItems<T>(
  params: Omit<QueryCommandInput, "TableName">
): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const result = await docClient.send(
    new QueryCommand({ TableName: IVYSHOP_TABLE, ...params })
  );
  return {
    items: (result.Items as T[]) ?? [],
    lastEvaluatedKey: result.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined,
  };
}

// ─── scanItems ───────────────────────────────────────────────────────────────

export async function scanItems<T>(
  params: Omit<ScanCommandInput, "TableName">
): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const result = await docClient.send(
    new ScanCommand({ TableName: IVYSHOP_TABLE, ...params })
  );
  return {
    items: (result.Items as T[]) ?? [],
    lastEvaluatedKey: result.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined,
  };
}

// ─── transactWrite ───────────────────────────────────────────────────────────

export async function transactWrite(
  params: Omit<TransactWriteCommandInput, never>
): Promise<void> {
  await docClient.send(new TransactWriteCommand(params));
}
