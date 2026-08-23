import createDiscount from '../../services/productDiscount/createDiscount.js';

export default async (request, response) => {
  const discount = await createDiscount(request.body, {
    routeId: request.currentRoute.id
  });

  return discount;
};
