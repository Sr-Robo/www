import { select } from '@evershop/postgres-query-builder';
import Stripe from 'stripe';
import { error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import { getConfig } from '../../../../lib/util/getConfig.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { getSetting } from '../../../setting/services/setting.js';
import { toStripeMinorUnit } from '../../services/stripeAmount.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  try {
    const { order_id } = request.body;

<<<<<<< HEAD
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
=======
    // The charge amount MUST come from the order, never from a client-supplied
    // cart. The order is the frozen, server-owned record of what is owed; a
    // request that pairs a cheap cart with an expensive order can no longer mint
    // a cheap intent. Scoped to a pending Stripe order so an already-paid or
    // foreign order cannot be re-charged or under-charged.
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .and('payment_method', '=', 'stripe')
      .and('payment_status', '=', 'pending')
      .load(pool);
>>>>>>> upstream/main

    if (!order) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid order'
        }
      });
      return;
    }

    const stripeConfig = getConfig('system.stripe', {}) as {
      secretKey?: string;
    };
    const stripeSecretKey = stripeConfig?.secretKey
      ? stripeConfig.secretKey
      : await getSetting('stripeSecretKey', '');
    const stripePaymentMode = await getSetting('stripePaymentMode', 'capture');

    const stripe = new Stripe(stripeSecretKey);

<<<<<<< HEAD
    // Create a PaymentIntent with the order amount and currency. Use the
    // order as the source of truth — the cart row can still be touched by
    // cart APIs after checkout, the order total cannot.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(smallestUnit(order.grand_total, order.currency), 10),
=======
    // The metadata order_id is what the webhook and the return page bind the
    // intent back to. It is the order's own uuid, set here — not echoed from
    // the client — so the binding is trustworthy.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeMinorUnit(order.grand_total, order.currency),
>>>>>>> upstream/main
      currency: order.currency,
      metadata: {
        order_id: order.uuid
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
  } catch (err) {
    error(err);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: 'Can not create the payment intent'
      }
    });
  }
};
