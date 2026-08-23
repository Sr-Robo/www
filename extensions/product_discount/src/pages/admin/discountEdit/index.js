import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';
import { buildUrl } from '@evershop/evershop/lib/router';
import {
  getContextValue,
  setContextValue
} from '@evershop/evershop/graphql/services';

export default async (request, response, next) => {
  try {
    const query = select();
    query.from('product_discount');
    query.andWhere('product_discount.uuid', '=', request.params.id);
    const discount = await query.load(pool);

    if (discount === null) {
      response.redirect(302, buildUrl('discountGrid'));
    } else {
      setContextValue(
        request,
        'discountId',
        parseInt(discount.product_discount_id, 10)
      );
      setContextValue(request, 'discountUuid', discount.uuid);
      // Mesma coisa que setPageMetaInfo do core (não exportada no barrel
      // público cms/services): merge no contexto 'pageInfo'.
      const current = getContextValue(request, 'pageInfo', {});
      setContextValue(request, 'pageInfo', {
        ...current,
        title: 'Discount',
        description: 'Discount'
      });
      next();
    }
  } catch (e) {
    next(e);
  }
};
