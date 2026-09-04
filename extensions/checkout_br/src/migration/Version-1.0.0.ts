import { execute } from '@evershop/postgres-query-builder';

export default async (connection: any) => {
  // 1. Adiciona coluna tax_id na tabela cart_address se não existir
  await execute(
    connection,
    `ALTER TABLE "cart_address" ADD COLUMN IF NOT EXISTS "tax_id" VARCHAR(30)`
  );

  // 2. Adiciona coluna tax_id na tabela order_address se não existir
  await execute(
    connection,
    `ALTER TABLE "order_address" ADD COLUMN IF NOT EXISTS "tax_id" VARCHAR(30)`
  );

  // 3. Índice para consultas por documento fiscal
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "idx_order_address_tax_id" ON "order_address" ("tax_id")`
  );
};
