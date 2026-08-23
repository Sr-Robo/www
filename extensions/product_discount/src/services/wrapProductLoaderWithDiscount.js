import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

// Envia o desconto ativo junto do row do product carregado no item do
// carrinho. O registry 'cartItemProductLoaderFunction' encadeia processors:
// o checkout registra o loader base (ignora o anterior) e este wrapper
// recebe esse loader e devolve uma versão que anexa `discount_percent`.
// 1 query extra por item por load do carrinho (o Item cacheia via getProduct).
export function wrapProductLoaderWithDiscount(loader) {
  return async function loadProductWithDiscount(id) {
    const product = await loader(id);
    if (!product) {
      return product;
    }
    const discount = await select()
      .from('product_discount')
      .where('product_id', '=', id)
      .andWhere('status', '=', true)
      .load(pool);
    if (discount) {
      product.discount_percent = parseFloat(discount.discount_percent) || 0;
    }
    return product;
  };
}
