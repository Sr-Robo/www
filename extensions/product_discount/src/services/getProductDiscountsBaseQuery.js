import { select } from '@evershop/postgres-query-builder';

// Colunas EXPLÍCITAS com alias (forma encadeada .select(col, alias)) — nunca
// deixar SELECT * com joins: as colunas "uuid" de product/product_description
// colidiriam com a da product_discount no row object.
export const getProductDiscountsBaseQuery = () => {
  const query = select().from('product_discount');
  query
    .leftJoin('product')
    .on('product.product_id', '=', 'product_discount.product_id');
  query
    .leftJoin('product_description')
    .on(
      'product_description.product_description_product_id',
      '=',
      'product_discount.product_id'
    );
  query
    .select('product_discount.product_discount_id', 'product_discount_id')
    .select('product_discount.uuid', 'uuid')
    .select('product_discount.status', 'status')
    .select('product_discount.product_id', 'product_id')
    .select('product_discount.discount_percent', 'discount_percent')
    .select('product_discount.created_at', 'created_at')
    .select('product_description.name', 'product_name')
    .select('product.sku', 'product_sku');
  return query;
};
