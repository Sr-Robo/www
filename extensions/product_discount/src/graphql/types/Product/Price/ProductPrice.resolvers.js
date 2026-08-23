import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';
import { toPrice } from '@evershop/evershop/checkout/services';

// Sobrepõe os dois stubs do core (catalog e tax fazem `special = regular`
// com um TODO de special price; extensões entram por último no mergeResolvers
// e ganham de ambos, no schema admin e no storefront). O front inteiro já
// renderiza `price.special` com preço riscado + badge de sale quando
// special.value < regular.value — este resolver é o único backend necessário.
// 1 query por row (N+1 aceitável no MVP; índice em product_id).
export default {
  Product: {
    price: async (product) => {
      const regular = toPrice(product.price);
      const discount = await select()
        .from('product_discount')
        .where('product_id', '=', product.product_id)
        .andWhere('status', '=', true)
        .load(pool);
      const percent = discount
        ? parseFloat(discount.discount_percent)
        : 0;
      if (percent > 0) {
        return {
          regular,
          special: toPrice(regular * (1 - percent / 100))
        };
      }
      return { regular, special: regular };
    }
  }
};
