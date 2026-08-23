import { buildUrl } from '@evershop/evershop/lib/router';
import { camelCase } from '@evershop/evershop/lib/util/camelCase';
import {
  ProductDiscountCollection
} from '../../../services/ProductDiscountCollection.js';
import {
  getProductDiscountsBaseQuery
} from '../../../services/getProductDiscountsBaseQuery.js';

export default {
  Query: {
    productDiscount: async (root, { id }, { pool }) => {
      const query = getProductDiscountsBaseQuery();
      query.where('product_discount.product_discount_id', '=', id);
      const discount = await query.load(pool);
      return discount ? camelCase(discount) : null;
    },
    productDiscounts: async (_, { filters = [] }, { user }) => {
      // This field is for admin only
      if (!user) {
        return [];
      }
      const query = getProductDiscountsBaseQuery();
      const root = new ProductDiscountCollection(query);
      await root.init(filters);
      return root;
    }
  },
  ProductDiscount: {
    // O Postgres devolve boolean; o tipo GraphQL é Int (o componente admin
    // Status espera 0/1)
    status: ({ status }) => (status === true ? 1 : 0),
    editUrl: ({ uuid }) => buildUrl('discountEdit', { id: uuid }),
    updateApi: (discount) =>
      buildUrl('updateDiscount', { id: discount.uuid }),
    deleteApi: (discount) =>
      buildUrl('deleteDiscount', { id: discount.uuid })
  }
};
