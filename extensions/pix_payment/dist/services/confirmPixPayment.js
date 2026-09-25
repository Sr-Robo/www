import { commit, getConnection, insert, rollback, select, startTransaction, update } from '@evershop/postgres-query-builder';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore Runtime aliases are resolved by EverShop's extension loader.
import { pool } from '@evershop/evershop/lib/postgres';
import { updatePaymentStatus } from '@evershop/evershop/oms/services';
export async function confirmPixPayment(providerReference, endToEndId) {
    const connection = await getConnection(pool);
    try {
        await startTransaction(connection);
        const attempt = await select().from('pix_payment_attempt').where('provider_reference', '=', providerReference).load(connection);
        if (!attempt)
            throw new Error('PIX charge not found');
        if (attempt.status === 'paid') {
            await commit(connection);
            return attempt;
        }
        if (attempt.status !== 'waiting')
            throw new Error(`PIX charge cannot be confirmed from ${attempt.status}`);
        if (new Date(attempt.expires_at).getTime() < Date.now())
            throw new Error('PIX charge expired');
        const order = await select().from('order').where('order_id', '=', attempt.order_id).load(connection);
        if (!order || order.payment_method !== 'pix' || order.payment_status !== 'pending')
            throw new Error('Order is not payable by PIX');
        await update('pix_payment_attempt').given({ status: 'paid', end_to_end_id: endToEndId, paid_at: new Date(), updated_at: new Date() }).where('pix_payment_attempt_id', '=', attempt.pix_payment_attempt_id).execute(connection);
        await insert('payment_transaction').given({ payment_transaction_order_id: order.order_id, transaction_id: providerReference, amount: order.grand_total, currency: order.currency, payment_action: 'capture', transaction_type: 'online' }).execute(connection);
        await updatePaymentStatus(order.order_id, 'paid', connection);
        await insert('event_outbox').given({ event_id: uuidv4(), event_type: 'order.paid', event_version: 1, occurred_at: new Date(), producer: 'pix_payment', business_key: JSON.stringify({ order_number: String(order.order_number) }), payload: JSON.stringify({ order_id: String(order.order_id), order_number: String(order.order_number), payment: { transaction_id: providerReference, method: 'pix', amount: Number(order.grand_total), currency: order.currency, status: 'paid', gateway: 'bb_pix_simulator' }, paid_at: new Date().toISOString() }), status: 'pending' }).execute(connection);
        await commit(connection);
        return { ...attempt, status: 'paid', end_to_end_id: endToEndId };
    }
    catch (error) {
        await rollback(connection);
        throw error;
    }
}
//# sourceMappingURL=confirmPixPayment.js.map