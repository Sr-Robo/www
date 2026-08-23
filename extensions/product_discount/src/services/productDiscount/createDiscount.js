import {
  commit,
  insert,
  rollback,
  startTransaction
} from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';
import { hookable, hookBefore, hookAfter } from '@evershop/evershop/lib/util/hookable';
import { getValue } from '@evershop/evershop/lib/util/registry';

function validateProductDiscountDataBeforeInsert(data) {
  if (
    !Number.isInteger(Number(data.product_id)) ||
    Number(data.product_id) <= 0
  ) {
    throw new Error('Product is required');
  }
  const percent = parseFloat(String(data.discount_percent));
  if (Number.isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Discount percent must be a number between 0 and 100');
  }
  if (![0, 1, '0', '1', true, false].includes(data.status)) {
    throw new Error('Status must be 0 or 1');
  }
  return data;
}

async function insertProductDiscountData(data, connection) {
  const discount = await insert('product_discount')
    .given({
      product_id: Number(data.product_id),
      discount_percent: String(data.discount_percent),
      status: data.status
    })
    .execute(connection);
  return discount;
}

/**
 * Create product discount service.
 * @param {object} data
 * @param {object} context
 */
async function createDiscount(data, context) {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    const discountData = await getValue(
      'productDiscountDataBeforeCreate',
      data
    );
    validateProductDiscountDataBeforeInsert(discountData);

    const discount = await hookable(insertProductDiscountData, {
      ...context,
      connection
    })(discountData, connection);
    await commit(connection);
    return discount;
  } catch (e) {
    await rollback(connection);
    if (String(e.message).includes('PRODUCT_DISCOUNT_PRODUCT_UNIQUE')) {
      throw new Error('This product already has a discount');
    }
    throw e;
  }
}

export default async (data, context = {}) => {
  // Make sure the context is either not provided or is an object
  if (context && typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  const discount = await hookable(createDiscount, context)(data, context);
  return discount;
};

export function hookBeforeInsertProductDiscountData(
  callback,
  priority
) {
  hookBefore('insertProductDiscountData', callback, priority);
}

export function hookAfterInsertProductDiscountData(
  callback,
  priority
) {
  hookAfter('insertProductDiscountData', callback, priority);
}

export function hookBeforeCreateDiscount(callback, priority) {
  hookBefore('createDiscount', callback, priority);
}

export function hookAfterCreateDiscount(callback, priority) {
  hookAfter('createDiscount', callback, priority);
}
