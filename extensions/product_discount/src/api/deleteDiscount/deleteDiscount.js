import {
  INTERNAL_SERVER_ERROR,
  OK
} from '@evershop/evershop/lib/util/httpStatus';
import deleteDiscount from '../../services/productDiscount/deleteDiscount.js';

export default async (request, response, next) => {
  try {
    const { id } = request.params;
    const discount = await deleteDiscount(id, {
      routeId: request.currentRoute.id
    });
    response.status(OK);
    response.json({
      data: discount
    });
  } catch (e) {
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: e.message
      }
    });
  }
};
