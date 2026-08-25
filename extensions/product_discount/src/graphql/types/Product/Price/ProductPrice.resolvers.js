import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';
import { toPrice } from '@evershop/evershop/checkout/services';

// Sobrepõe os dois stubs do core (catalog e tax fazem `special = regular`
// com um TODO de special price). Isso só vence de fato porque o
// buildResolvers mescla em duas etapas — core primeiro, extensões por
// último (um loadFiles único ordenava por path e o core ganhava; detalhe
// no comentário lá). O front inteiro já renderiza `price.special` com
// preço riscado + badge de sale quando special.value < regular.value.
// 1 query por row (N+1 aceitável no MVP; índice em product_id).
export default {
  Product: {
    price: async (product) => {
      const regular = toPrice(product.price);
      // O row chega em formatos diferentes por contexto: a listagem
      // (ProductCollection) seleciona com aliases camelCase (`productId`),
      // loaders diretos trazem a coluna crua (`product_id`). Aceitar ambos.
      const productId = product.product_id ?? product.productId;
      if (!productId) {
        return { regular, special: regular };
      }
      const discount = await select()
        .from('product_discount')
        .where('product_id', '=', productId)
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
