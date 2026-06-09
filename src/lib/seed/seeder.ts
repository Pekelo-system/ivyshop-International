import { getItem, putItem } from "@/lib/dynamo/helpers";
import { type SeedFlag } from "@/types";
import { SEED_PRODUCTS } from "./data";

const SEED_FLAG_KEY = { PK: "SEED#METADATA" as const, SK: "v1" as const };

export async function checkSeedFlag(): Promise<boolean> {
  const flag = await getItem<SeedFlag>({ Key: SEED_FLAG_KEY });
  return flag !== null;
}

export async function runSeed(): Promise<{
  seeded: boolean;
  productCount: number;
}> {
  // Idempotency check — if already seeded, skip
  const alreadySeeded = await checkSeedFlag();
  if (alreadySeeded) {
    return { seeded: false, productCount: 0 };
  }

  // Insert all seed products
  await Promise.all(
    SEED_PRODUCTS.map((product) =>
      putItem({ Item: product as unknown as Record<string, unknown> })
    )
  );

  // Write seed flag
  const flag: SeedFlag = {
    ...SEED_FLAG_KEY,
    entityType: "SEED_FLAG",
    seededAt: new Date().toISOString(),
    productCount: SEED_PRODUCTS.length,
  };
  await putItem({ Item: flag as unknown as Record<string, unknown> });

  return { seeded: true, productCount: SEED_PRODUCTS.length };
}
