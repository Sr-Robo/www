import {
  commit,
  rollback,
  select,
  startTransaction,
  update
} from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';
import { hookable, hookBefore, hookAfter } from '@evershop/evershop/lib/util/hookable';
import { getValue } from '@evershop/evershop/lib/util/registry';

function validateProductDiscountDataBeforeUpdate(data) {
  if (
    data.discount_percent !== undefined &&
    data.discount_percent !== null
  ) {
    const percent = parseFloat(String(data.discount_percent));
    if (Number.isNaN(percent) || percent <= 0 || percent > 100) {
      throw new Error('Discount percent must be a number between 0 and 100');
    }
  }
  if (
    data.status !== undefined &&
    ![0, 1, '0', '1', true, false].includes(data.status)
  ) {
    throw new Error('Status must be 0 or 1');
  }
  return data;
}

async function updateProductDiscountData(uuid, data, connection) {
  const discount = await select()
    .from('product_discount')
    .where('uuid', '=', uuid)
    .load(connection);

  if (!discount) {
    throw new Error('Requested discount not found');
  }

  const given = {};
  if (data.product_id !== undefined) {
    given.product_id = Number(data.product_id);
  }
  if (data.discount_percent !== undefined) {
    given.discount_percent = String(data.discount_percent);
  }
  if (data.status !== undefined) {
    given.status = data.status;
  }

  try {
    await update('product_discount')
      .given(given)
      .where('uuid', '=', uuid)
      .execute(connection);
  } catch (e) {
    if (!String(e.message).includes('No data was provided')) {
      throw e;
    }
  }

  const updatedDiscount = await select()
    .from('product_discount')
    .where('uuid', '=', uuid)
    .load(connection);

  return updatedDiscount;
}

/**
 * Update product discount service.
 * @param {string} uuid
 * @param {object} data
 * @param {object} context
 */
async function updateDiscount(uuid, data, context) {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    const discountData = await getValue(
      'productDiscountDataBeforeUpdate',
      data
    );
    validateProductDiscountDataBeforeUpdate(discountData);

    const discount = await hookable(updateProductDiscountData, {
      ...context,
      connection
    })(uuid, discountData, connection);

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

export default async (uuid, data, context = {}) => {
  // Make sure the context is either not provided or is an object
  if (context && typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  const discount = await hookable(updateDiscount, context)(uuid, data, context);
  return discount;
};

export function hookBeforeUpdateProductDiscountData(callback, priority) {
  hookBefore('updateProductDiscountData', callback, priority);
}

export function hookAfterUpdateProductDiscountData(callback, priority) {
  hookAfter('updateProductDiscountData', callback, priority);
}

export function hookBeforeUpdateDiscount(callback, priority) {
  hookBefore('updateDiscount', callback, priority);
}

export function hookAfterUpdateDiscount(callback, priority) {
  hookAfter('updateDiscount', callback, priority);
}
