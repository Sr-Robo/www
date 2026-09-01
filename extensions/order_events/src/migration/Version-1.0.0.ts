import { execute } from '@evershop/postgres-query-builder';

export default async (connection: any) => {
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "event_outbox" (
      "outbox_id" SERIAL PRIMARY KEY,
      "event_id" UUID NOT NULL UNIQUE,
      "event_type" VARCHAR(100) NOT NULL,
      "event_version" INTEGER NOT NULL DEFAULT 1,
      "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "producer" VARCHAR(50) NOT NULL DEFAULT 'evershop',
      "business_key" JSONB NOT NULL,
      "payload" JSONB NOT NULL,
      "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
      "published_at" TIMESTAMPTZ,
      "error_message" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );

  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "idx_event_outbox_status_id" ON "event_outbox" ("status", "outbox_id")`
  );
};
