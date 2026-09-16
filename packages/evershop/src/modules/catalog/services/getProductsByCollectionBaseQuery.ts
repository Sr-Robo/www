import { SelectQuery } from '@evershop/postgres-query-builder';
import { getProductsBaseQuery } from './getProductsBaseQuery.js';

export const getProductsByCollectionBaseQuery = (
  collectionId: number
): SelectQuery => {
  const query = getProductsBaseQuery();
  query
    .leftJoin('product_collection')
    .on('product_collection.product_id', '=', 'product.product_id')
    .and('product_collection.collection_id', '=', collectionId);

  query.andWhere('product_collection.collection_id', '=', collectionId);
  // Collections are editorial lists. Preserve the order in which the admin
  // assigned products instead of silently reverting to newest-first order.
  // The collection editor can reorder this list by removing and re-adding an
  // item; the storefront remains deterministic without changing global shop
  // sorting.
  query.orderBy('product_collection.product_collection_id', 'ASC');
  return query;
};
