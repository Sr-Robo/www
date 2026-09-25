import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
export default async () => {
    registerPaymentMethod({
        init: () => ({ code: 'pix', name: 'PIX' }),
        validator: (context = {}) => typeof context.cartTotal !== 'number' || context.cartTotal > 0
    });
};
//# sourceMappingURL=bootstrap.js.map