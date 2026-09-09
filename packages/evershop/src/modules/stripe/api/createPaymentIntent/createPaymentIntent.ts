import { select } from '@evershop/postgres-query-builder';
import Stripe from 'stripe';
import smallestUnit from 'zero-decimal-currencies';
import { pool } from '../../../../lib/postgres/connection.js';
import { getConfig } from '../../../../lib/util/getConfig.js';
import { OK, INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { getSetting } from '../../../setting/services/setting.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const { cart_id, order_id } = request.body;
  // Check the cart
  const cart = await select()
    .from('cart')
    .where('uuid', '=', cart_id)
    .load(pool);

  // Load the order and make sure it belongs to this cart, uses Stripe and
  // is still pending. Without these checks a client could bind a cheap
  // cart's PaymentIntent to an expensive order via metadata.order_id.
  const order = await select()
    .from('order')
    .where('uuid', '=', order_id)
    .load(pool);

  if (
    !cart ||
    !order ||
    order.cart_id !== cart.cart_id ||
    order.payment_method !== 'stripe' ||
    order.payment_status !== 'pending'
  ) {
    response.status(INVALID_PAYLOAD);
    response.json({
      error: {
        status: INVALID_PAYLOAD,
        message: 'Invalid cart'
      }
    });
  } else {
    const stripeConfig = getConfig('system.stripe', {});
    let stripeSecretKey;

    if (stripeConfig?.secretKey) {
      stripeSecretKey = stripeConfig.secretKey;
    } else {
      stripeSecretKey = await getSetting('stripeSecretKey', '');
    }
    const stripePaymentMode = await getSetting('stripePaymentMode', 'capture');

    const stripe = new Stripe(stripeSecretKey);

    // Create a PaymentIntent with the order amount and currency. Use the
    // order as the source of truth — the cart row can still be touched by
    // cart APIs after checkout, the order total cannot.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(smallestUnit(order.grand_total, order.currency), 10),
      currency: order.currency,
      metadata: {
        cart_id,
        order_id
      },
      automatic_payment_methods: {
        enabled: true
      },
      capture_method:
        stripePaymentMode === 'capture' ? 'automatic_async' : 'manual'
    });

    response.status(OK);
    response.json({
      data: {
        clientSecret: paymentIntent.client_secret
      }
    });
  }
};
