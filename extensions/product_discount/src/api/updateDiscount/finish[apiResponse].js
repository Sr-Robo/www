import { getDelegate } from '@evershop/evershop/lib/middleware/delegate';
import { buildUrl } from '@evershop/evershop/lib/router';
import { OK } from '@evershop/evershop/lib/util/httpStatus';

export default async (request, response, next) => {
  const discount = await getDelegate('updateDiscount', request);
  response.status(OK);
  response.json({
    data: {
      ...discount,
      links: [
        {
          rel: 'discountGrid',
          href: buildUrl('discountGrid'),
          action: 'GET',
          types: ['text/xml']
        },
        {
          rel: 'edit',
          href: buildUrl('discountEdit', { id: discount.uuid }),
          action: 'GET',
          types: ['text/xml']
        }
      ]
    }
  });
};
