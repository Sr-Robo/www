import updateDiscount from '../../services/productDiscount/updateDiscount.js';

export default async (request, response) => {
  const discount = await updateDiscount(request.params.id, request.body, {
    routeId: request.currentRoute.id
  });

  return discount;
};
