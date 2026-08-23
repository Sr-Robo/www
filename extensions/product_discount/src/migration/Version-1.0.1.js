import { execute } from '@evershop/postgres-query-builder';

export default async (connection) => {
  // Dado de demonstração pedido pelo fxlip: 25% na "Caneca GTA".
  // Idempotente: no-op se o produto não existir e ON CONFLICT segura re-run.
  await execute(
    connection,
    `INSERT INTO "product_discount" ("uuid", "status", "product_id", "discount_percent")
    SELECT gen_random_uuid(), true, p."product_id", 25
    FROM "product" p
    WHERE p."uuid" = 'e9541d6d-1454-4b4d-a3a1-acec774d583a'
    ON CONFLICT ("product_id") DO NOTHING`
  );
};
