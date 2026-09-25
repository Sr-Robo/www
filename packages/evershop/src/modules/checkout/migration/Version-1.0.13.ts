import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/** Repair the stock trigger after inventory moved to product_inventory. */
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
        UPDATE product_inventory
          SET qty = qty - NEW.qty
          WHERE product_inventory_product_id = NEW.product_id
            AND manage_stock = TRUE
            AND qty >= NEW.qty;
        GET DIAGNOSTICS updated_rows = ROW_COUNT;
        IF updated_rows = 0 AND EXISTS (
          SELECT 1 FROM product_inventory
            WHERE product_inventory_product_id = NEW.product_id
              AND manage_stock = TRUE
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
