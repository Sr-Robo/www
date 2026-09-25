import { insert, select } from '@evershop/postgres-query-builder';
import { v4 as uuidv4 } from 'uuid';
// Runtime aliases are resolved by EverShop's extension loader.
// @ts-ignore
import { pool } from '@evershop/evershop/lib/postgres';
// @ts-ignore
import { INVALID_PAYLOAD, OK } from '@evershop/evershop/lib/util/httpStatus.js';
export default async (request, response) => {
    const { order_id } = request.body || {};
    const order = await select().from('order').where('uuid', '=', order_id).load(pool);
    if (!order || order.payment_method !== 'pix' || order.payment_status !== 'pending')
        return response.status(INVALID_PAYLOAD).json({ error: { status: INVALID_PAYLOAD, message: 'Invalid PIX order' } });
    const existing = await select().from('pix_payment_attempt').where('order_id', '=', order.order_id).load(pool);
    if (existing)
        return response.status(OK).json({ data: { ...existing, expires_at: new Date(existing.expires_at).toISOString() } });
    const providerReference = `pix_sim_${order.order_id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const copyPaste = `00020126580014BR.GOV.BCB.PIX0136${providerReference}5204000053039865802BR5920SR ROBOO HOMOLOGACAO6009SAO PAULO62070503***6304ABCD`;
    const attempt = await insert('pix_payment_attempt').given({ uuid: uuidv4(), order_id: order.order_id, provider_reference: providerReference, amount: order.grand_total, currency: order.currency, status: 'waiting', qr_code: copyPaste, copy_paste: copyPaste, expires_at: expiresAt }).execute(pool);
    response.status(OK).json({ data: { ...attempt, provider_reference: providerReference, qr_code: copyPaste, copy_paste: copyPaste, expires_at: expiresAt.toISOString(), simulator: true } });
};
//# sourceMappingURL=createCharge.js.map