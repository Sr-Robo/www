import { execute } from '@evershop/postgres-query-builder';

export default async (connection) => {
  // Desconto percentual por produto, sem cupom. 1 desconto por produto
  // (UNIQUE product_id — criar outro pro mesmo produto é erro de negócio,
  // traduzido no service createDiscount). Sem FK: nenhuma migration do core
  // usa FOREIGN KEY (convenção do módulo promotion). Status ativo controla a
  // vigência; datas de validade ficam fora do MVP.
  await execute(
    connection,
    `CREATE TABLE "product_discount" (
  "product_discount_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid (),
  "status" boolean NOT NULL DEFAULT FALSE,
  "product_id" INT NOT NULL,
  "discount_percent" decimal(5,2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PRODUCT_DISCOUNT_UUID_UNIQUE" UNIQUE ("uuid"),
  CONSTRAINT "PRODUCT_DISCOUNT_PRODUCT_UNIQUE" UNIQUE ("product_id"),
  CONSTRAINT "PRODUCT_DISCOUNT_PERCENT_RANGE" CHECK (discount_percent > 0 AND discount_percent <= 100)
)`
  );
  await execute(
    connection,
    `CREATE INDEX "PRODUCT_DISCOUNT_PRODUCT_IDX" ON "product_discount" ("product_id")`
  );
};
