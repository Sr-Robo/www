import {
  startTransaction,
  commit,
  rollback,
  select,
  insertOnUpdate
} from '@evershop/postgres-query-builder';
import stripePgk from 'stripe';
import smallestUnit, { display } from 'zero-decimal-currencies';
import { emit } from '../../../../lib/event/emitter.js';
import { debug, error } from '../../../../lib/log/logger.js';
import { getConnection } from '../../../../lib/postgres/connection.js';
import { getConfig } from '../../../../lib/util/getConfig.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import addOrderActivityLog from '../../../oms/services/addOrderActivityLog.js';
import { updatePaymentStatus } from '../../../oms/services/updatePaymentStatus.js';
import { getSetting } from '../../../setting/services/setting.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const sig = request.headers['stripe-signature'];

  let event;
  const connection = await getConnection();
  try {
    const stripeConfig = getConfig('system.stripe', {}) as {
      secretKey?: string;
      endpointSecret?: string;
    };
    let stripeSecretKey;
    if (stripeConfig.secretKey) {
      stripeSecretKey = stripeConfig.secretKey;
    } else {
      stripeSecretKey = await getSetting('stripeSecretKey', '');
    }
    const stripe = new stripePgk(stripeSecretKey);

    // Webhook enpoint secret
    let endpointSecret;
    if (stripeConfig.endpointSecret) {
      endpointSecret = stripeConfig.endpointSecret;
    } else {
      endpointSecret = await getSetting('stripeEndpointSecret', '');
    }

    event = stripe.webhooks.constructEvent(
      request.body,
      sig as string,
      endpointSecret
    );
    await startTransaction(connection);
    const paymentIntent = event.data.object as stripePgk.PaymentIntent;
    const { order_id } = paymentIntent.metadata;
    const transaction = await select()
      .from('payment_transaction')
      .where('transaction_id', '=', paymentIntent.id)
      .load(connection);
    // Load the order
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .load(connection);
    if (!order) {
      throw new Error(`Order with id ${order_id} not found`);
    }
    // Integrity check: the PaymentIntent must match the order's amount and
    // currency. A signed event only proves Stripe sent it — not that the
    // intent was created for this order (metadata.order_id is set by the
    // public createPaymentIntent API from client-provided data).
    const isPaymentEvent =
      event.type === 'payment_intent.succeeded' ||
      event.type === 'payment_intent.amount_capturable_updated';
    if (isPaymentEvent) {
      const expectedAmount = parseInt(
        smallestUnit(order.grand_total, order.currency),
        10
      );
      if (
        paymentIntent.amount !== expectedAmount ||
        paymentIntent.currency.toLowerCase() !== order.currency.toLowerCase()
      ) {
        throw new Error(
          `PaymentIntent ${paymentIntent.id} amount/currency mismatch for order ${order_id}: got ${paymentIntent.amount} ${paymentIntent.currency}, expected ${expectedAmount} ${order.currency}`
        );
      }
    }
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        debug('payment_intent.succeeded event received');
        // Update the order
        // Create payment transaction
        await insertOnUpdate('payment_transaction', [
          'transaction_id',
          'payment_transaction_order_id'
        ])
          .given({
            amount: parseFloat(
              display(paymentIntent.amount, paymentIntent.currency)
            ),
            payment_transaction_order_id: order.order_id,
            transaction_id: paymentIntent.id,
            transaction_type: 'online',
            payment_action:
              paymentIntent.capture_method === 'manual' ? 'Manual' : 'Automatic'
          })
          .execute(connection);

        if (!transaction) {
          await updatePaymentStatus(
            order.order_id,
            'stripe_captured',
            connection
          );

          // Add an activity log
          await addOrderActivityLog(
            order.order_id,
            `Payment captured by using Stripe. Transaction ID: ${paymentIntent.id}`,
            false,
            connection
          );

          // Emit event to add order placed event
          await emit('order_placed', { ...order });
        }
        break;
      }
      case 'payment_intent.amount_capturable_updated': {
        debug('payment_intent.amount_capturable_updated event received');
        // Create payment transaction
        await insertOnUpdate('payment_transaction', [
          'transaction_id',
          'payment_transaction_order_id'
        ])
          .given({
            amount: parseFloat(
              display(paymentIntent.amount, paymentIntent.currency)
            ),
            payment_transaction_order_id: order.order_id,
            transaction_id: paymentIntent.id,
            transaction_type: 'online',
            payment_action:
              paymentIntent.capture_method === 'manual'
                ? 'authorize'
                : 'capture'
          })
          .execute(connection);

        if (!transaction) {
          await updatePaymentStatus(
            order.order_id,
            'stripe_authorized',
            connection
          );
          // Add an activity log
          await addOrderActivityLog(
            order.order_id,
            `Payment authorized by using Stripe. Transaction ID: ${paymentIntent.id}`,
            false,
            connection
          );
          // Emit event to add order placed event
          await emit('order_placed', { ...order });
        }
        break;
      }
      case 'payment_intent.canceled': {
        debug('payment_intent.canceled event received');
        // Only cancel orders that are still pending/authorized. A late or
        // re-ordered `canceled` event must not overwrite a captured order.
        if (['pending', 'stripe_authorized'].includes(order.payment_status)) {
          await updatePaymentStatus(order.order_id, 'canceled', connection);
        } else {
          debug(
            `Ignoring payment_intent.canceled for order ${order_id} in status ${order.payment_status}`
          );
        }
        break;
      }
      default: {
        debug(`Unhandled event type ${event.type}`);
      }
    }
    await commit(connection);
    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  } catch (err) {
    error(err);
    await rollback(connection);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
};
