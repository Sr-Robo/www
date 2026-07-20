import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';
import { getProductsBaseQuery } from '@evershop/evershop/catalog/services';

export const getShopFilterableAttributes = async () => {
  const productsQuery = getProductsBaseQuery();
  productsQuery.select('product.product_id');
  // Get the list of productIds before applying pagination, sorting...etc
  // Base on this list, we will find all attributes that can appear in the filter
  const allIds = (await productsQuery.execute(pool)).map(
    (row) => row.product_id
  );

  if (allIds.length === 0) {
    return [];
  }

  const query = select('attribute.attribute_name', 'attribute_name')
    .select('attribute.type', 'type')
    .select('attribute.is_filterable', 'is_filterable')
    .select('product_attribute_value_index.attribute_id', 'attribute_id')
    .select('attribute.attribute_code', 'attribute_code')
    .select('product_attribute_value_index.option_id', 'option_id')
    .select('product_attribute_value_index.option_text', 'option_text')
    .from('attribute');
  query
    .innerJoin('product_attribute_value_index')
    .on(
      'attribute.attribute_id',
      '=',
      'product_attribute_value_index.attribute_id'
    );

  query
    .where('product_attribute_value_index.product_id', 'IN', allIds)
    .and('type', '=', 'select')
    .and('is_filterable', '=', 1);

  const attributeData = await query.execute(pool);

  const attributes = [];

  for (let i = 0; i < attributeData.length; i++) {
    const row = attributeData[i];
    const index = attributes.findIndex(
      (a) => a.attributeCode === row.attribute_code
    );
    if (index === -1) {
      attributes.push({
        attributeName: row.attribute_name,
        attributeId: row.attribute_id,
        attributeCode: row.attribute_code,
        options: [
          {
            optionId: row.option_id,
            optionText: row.option_text
          }
        ]
      });
    } else {
      const idx = attributes[index].options.findIndex(
        (o) => parseInt(o.optionId, 10) === parseInt(row.option_id, 10)
      );
      if (idx === -1) {
        attributes[index].options.push({
          optionId: row.option_id,
          optionText: row.option_text
        });
      }
    }
  }

  return attributes;
};
