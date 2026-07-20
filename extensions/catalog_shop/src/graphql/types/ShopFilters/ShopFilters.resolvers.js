import { select } from '@evershop/postgres-query-builder';
import { getProductsBaseQuery } from '@evershop/evershop/catalog/services';
import { getShopFilterableAttributes } from '../../../services/getShopFilterableAttributes.js';

export default {
  Query: {
    shopFilters: () => ({})
  },
  ShopFilters: {
    availableAttributes: async () => getShopFilterableAttributes(),
    priceRange: async (_, __, { pool }) => {
      const query = getProductsBaseQuery();
      query
        .select('MIN(product.price)', 'min')
        .select('MAX(product.price)', 'max');
      const result = await query.load(pool);
      return {
        min: result.min || 0,
        max: result.max || 0
      };
    }
  },
  FilterOption: {
    productCount: (option) => option.productCount || null
  },
  Category: {
    productCount: async (category, _, { pool }) => {
      const query = select().from('product');
      query.select('COUNT(*)', 'count');
      query.where('product.category_id', '=', category.categoryId);
      const result = await query.load(pool);
      return parseInt(result.count, 10) || 0;
    }
  }
};
