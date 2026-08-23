import { OPERATION_MAP } from '@evershop/evershop/lib/util/filterOperationMap';
import { getValueSync } from '@evershop/evershop/lib/util/registry';

export async function registerDefaultProductDiscountCollectionFilters() {
  // List of default supported filters
  const defaultFilters = [
    {
      key: 'product_name',
      operation: ['eq', 'like'],
      callback: (query, operation, value, currentFilters) => {
        if (operation === 'eq') {
          query.andWhere('product_description.name', '=', value);
        } else {
          query.andWhere('product_description.name', 'ILIKE', `%${value}%`);
        }
        currentFilters.push({
          key: 'product_name',
          operation,
          value
        });
      }
    },
    {
      key: 'sku',
      operation: ['eq', 'like'],
      callback: (query, operation, value, currentFilters) => {
        if (operation === 'eq') {
          query.andWhere('product.sku', '=', value);
        } else {
          query.andWhere('product.sku', 'ILIKE', `%${value}%`);
        }
        currentFilters.push({
          key: 'sku',
          operation,
          value
        });
      }
    },
    {
      key: 'status',
      operation: ['eq'],
      callback: (query, operation, value, currentFilters) => {
        query.andWhere(
          'product_discount.status',
          OPERATION_MAP[operation],
          value
        );
        currentFilters.push({
          key: 'status',
          operation,
          value
        });
      }
    },
    {
      key: 'ob',
      operation: ['eq'],
      callback: (query, operation, value, currentFilters) => {
        const productDiscountCollectionSortBy = getValueSync(
          'productDiscountCollectionSortBy',
          {
            discount_percent: (query) =>
              query.orderBy('product_discount.discount_percent'),
            status: (query) => query.orderBy('product_discount.status'),
            created_at: (query) =>
              query.orderBy('product_discount.created_at')
          }
        );

        if (productDiscountCollectionSortBy[value]) {
          productDiscountCollectionSortBy[value](query, operation);
          currentFilters.push({
            key: 'ob',
            operation,
            value
          });
        }
      }
    }
  ];

  return defaultFilters;
}
