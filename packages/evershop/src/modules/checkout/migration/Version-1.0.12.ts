import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Stock-decrement guard (security review 2026-09-09, finding A3).
 *
 * `reduce_product_stock_when_order_placed` (Version-1.0.0) decremented
 * `product.qty` unconditionally: `qty = qty - NEW.qty`. Two concurrent
 * checkouts for the last unit of a product both passed the JS-side
 * check-then-act validation (`orderValidator` reads stock before the order
 * transaction starts), both order_item rows inserted, both triggers fired —
 * `qty` went negative and both orders were created as valid.
 *
 * Fix: fold the check into the same UPDATE that does the decrement, so
 * Postgres's row lock on `product` serializes concurrent inserts for the
 * same product_id. The second trigger to run sees the already-decremented
 * qty and — if insufficient — raises, which aborts the INSERT and rolls
 * back the whole order-creation transaction (`orderCreator.ts` wraps
 * insertion in startTransaction/commit/rollback). Products with
 * `manage_stock = FALSE`, or a `product_id` that doesn't match any managed
 * row, keep the original no-op behavior — only insufficient managed stock
 * raises.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `CREATE OR REPLACE FUNCTION reduce_product_stock_when_order_placed()
        RETURNS TRIGGER
        LANGUAGE PLPGSQL
        AS
      $$
      DECLARE
        updated_rows INTEGER;
      BEGIN
        UPDATE product
          SET qty = qty - NEW.qty
          WHERE product_id = NEW.product_id
            AND manage_stock = TRUE
            AND qty >= NEW.qty;
        GET DIAGNOSTICS updated_rows = ROW_COUNT;
        IF updated_rows = 0 AND EXISTS (
          SELECT 1 FROM product
            WHERE product_id = NEW.product_id AND manage_stock = TRUE
        ) THEN
          RAISE EXCEPTION 'Insufficient stock for product_id % (requested %)',
            NEW.product_id, NEW.qty
            USING ERRCODE = 'P0001';
        END IF;
        RETURN NEW;
      END
      $$;`
  );
};
