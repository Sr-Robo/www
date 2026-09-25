import { registerPaymentMethod } from '@evershop/evershop/checkout/services';

export default async () => {
  registerPaymentMethod({
    init: () => ({ code: 'pix', name: 'PIX' }),
    validator: (context: { cartTotal?: number } = {}) => typeof context.cartTotal !== 'number' || context.cartTotal > 0
  });
};
