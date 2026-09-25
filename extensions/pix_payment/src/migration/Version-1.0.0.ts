import { execute } from '@evershop/postgres-query-builder';

export default async (connection: any) => {
  await execute(connection, `
    CREATE TABLE IF NOT EXISTS "pix_payment_attempt" (
      "pix_payment_attempt_id" BIGSERIAL PRIMARY KEY,
      "uuid" UUID NOT NULL UNIQUE,
      "order_id" INTEGER NOT NULL REFERENCES "order" ("order_id") ON DELETE CASCADE,
      "provider_reference" VARCHAR(80) NOT NULL UNIQUE,
      "amount" NUMERIC(18,2) NOT NULL CHECK ("amount" >= 0),
      "currency" VARCHAR(3) NOT NULL,
      "status" VARCHAR(20) NOT NULL DEFAULT 'waiting',
      "qr_code" TEXT NOT NULL,
      "copy_paste" TEXT NOT NULL,
      "expires_at" TIMESTAMPTZ NOT NULL,
      "end_to_end_id" VARCHAR(100),
      "paid_at" TIMESTAMPTZ,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "unq_pix_attempt_order" UNIQUE ("order_id")
    )
  `);
  await execute(connection, `CREATE INDEX IF NOT EXISTS "idx_pix_attempt_status_expiry" ON "pix_payment_attempt" ("status", "expires_at")`);
};
