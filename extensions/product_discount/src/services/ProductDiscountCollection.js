import { pool } from '@evershop/evershop/lib/postgres';
import { camelCase } from '@evershop/evershop/lib/util/camelCase';
import { getValue } from '@evershop/evershop/lib/util/registry';

export class ProductDiscountCollection {
  constructor(baseQuery) {
    this.baseQuery = baseQuery;
  }

  async init(filters = []) {
    const currentFilters = [];

    // Apply the filters
    const productDiscountCollectionFilters = await getValue(
      'productDiscountCollectionFilters',
      []
    );

    productDiscountCollectionFilters.forEach((filter) => {
      const check = filters.find(
        (f) => f.key === filter.key && filter.operation.includes(f.operation)
      );
      if (filter.key === '*' || check) {
        filter.callback(
          this.baseQuery,
          check?.operation,
          check?.value,
          currentFilters
        );
      }
    });

    // Clone the main query for getting total right before doing the paging
    const totalQuery = this.baseQuery.clone();
    totalQuery.select(
      'COUNT(product_discount.product_discount_id)',
      'total'
    );
    totalQuery.removeOrderBy();
    totalQuery.removeLimit();

    this.currentFilters = currentFilters;
    this.totalQuery = totalQuery;
  }

  async items() {
    const items = await this.baseQuery.execute(pool);
    return items.map((row) => camelCase(row));
  }

  async total() {
    const total = await this.totalQuery.execute(pool);
    return total[0].total;
  }

  currentFilters() {
    return this.currentFilters;
  }
}
