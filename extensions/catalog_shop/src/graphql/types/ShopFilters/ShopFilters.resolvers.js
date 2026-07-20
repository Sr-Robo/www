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
  }
};
