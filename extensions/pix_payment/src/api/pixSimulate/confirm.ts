// @ts-ignore Runtime aliases are resolved by EverShop's extension loader.
import { OK, INVALID_PAYLOAD } from '@evershop/evershop/lib/util/httpStatus';
import { confirmPixPayment } from '../../services/confirmPixPayment.js';
export default async (request: any, response: any, next: any) => {
  const { provider_reference, end_to_end_id } = request.body || {};
  if (!provider_reference) return response.status(INVALID_PAYLOAD).json({ error: { status: INVALID_PAYLOAD, message: 'provider_reference is required' } });
  try { const payment = await confirmPixPayment(provider_reference, end_to_end_id || `E${Date.now()}`); return response.status(OK).json({ data: payment }); }
  catch (error: any) { return response.status(INVALID_PAYLOAD).json({ error: { status: INVALID_PAYLOAD, message: error.message } }); }
};
