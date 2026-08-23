import {
  commit,
  del,
  rollback,
  select,
  startTransaction
} from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';
import {
  hookable,
  hookBefore,
  hookAfter
} from '@evershop/evershop/lib/util/hookable';

async function deleteProductDiscountData(uuid, connection) {
  await del('product_discount')
    .where('uuid', '=', uuid)
    .execute(connection);
}

/**
 * Delete product discount service.
 * @param {string} uuid
 * @param {object} context
 */
async function deleteDiscount(uuid, context) {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    const discount = await select()
      .from('product_discount')
      .where('uuid', '=', uuid)
      .load(connection);

    if (!discount) {
      throw new Error('Invalid discount id');
    }
    await hookable(deleteProductDiscountData, {
      ...context,
      discount,
      connection
    })(uuid, connection);
    await commit(connection);
    return discount;
  } catch (e) {
    await rollback(connection);
    throw e;
  }
}

export default async (uuid, context = {}) => {
  // Make sure the context is either not provided or is an object
  if (context && typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  const discount = await hookable(deleteDiscount, context)(uuid, context);
  return discount;
};

export function hookBeforeDeleteProductDiscountData(callback, priority) {
  hookBefore('deleteProductDiscountData', callback, priority);
}

export function hookAfterDeleteProductDiscountData(callback, priority) {
  hookAfter('deleteProductDiscountData', callback, priority);
}

export function hookBeforeDeleteDiscount(callback, priority) {
  hookBefore('deleteDiscount', callback, priority);
}

export function hookAfterDeleteDiscount(callback, priority) {
  hookAfter('deleteDiscount', callback, priority);
}
