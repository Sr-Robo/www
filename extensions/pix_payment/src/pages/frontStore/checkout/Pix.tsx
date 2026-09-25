// @ts-ignore Storefront aliases are resolved by the EverShop webpack build.
import { Button } from '@components/common/ui/Button.js';
// @ts-ignore
import { toast } from '@components/common/ui/Sonner.js';
// @ts-ignore
import { useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useEffect, useState } from 'react';

type Charge = { provider_reference: string; copy_paste: string; qr_code: string; expires_at: string; status: string };

export default function PixMethod({ createChargeApi, confirmApi }: { createChargeApi: string; confirmApi: string }) {
  const { orderPlaced, orderId, checkoutData, loadingStates } = useCheckout();
  const { registerPaymentComponent } = useCheckoutDispatch();
  const [charge, setCharge] = useState<Charge | null>(null);

  useEffect(() => {
    registerPaymentComponent('pix', {
      nameRenderer: () => <span className="flex w-full justify-between"><span>{_('PIX')}</span><span>Banco do Brasil</span></span>,
      formRenderer: () => charge ? <div className="space-y-3 rounded border p-3"><p>{_('After placing the order, scan the QR code or copy the PIX code below.')}</p><textarea readOnly value={charge.copy_paste} className="min-h-20 w-full rounded border p-2 text-xs" onFocus={(e) => e.currentTarget.select()} /><p className="text-sm text-muted-foreground">{_('Status')}: {charge.status}</p></div> : <p className="text-sm text-muted-foreground">{_('The PIX charge is created after placing the order.')}</p>,
      checkoutButtonRenderer: () => {
        const { checkout } = useCheckoutDispatch();
        return <Button type="button" size="xl" className="w-full" disabled={loadingStates.placingOrder || orderPlaced} onClick={async (event) => { event.preventDefault(); try { await checkout(); } catch (error: any) { toast.error(error?.message || _('Could not place order')); } }}>{loadingStates.placingOrder ? _('Creating order...') : orderPlaced ? _('Order created') : _('Place order and generate PIX')}</Button>;
      }
    });
  }, [registerPaymentComponent, charge, loadingStates.placingOrder, orderPlaced]);

  useEffect(() => {
    if (!orderPlaced || checkoutData.paymentMethod !== 'pix' || !orderId || charge) return;
    fetch(createChargeApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || _('Could not create PIX charge')); return body.data; })
      .then(setCharge).catch((error) => toast.error(error.message));
  }, [orderPlaced, checkoutData.paymentMethod, orderId, charge, createChargeApi]);

  return charge ? <div className="mt-3 space-y-2"><Button type="button" variant="secondary" onClick={async () => { const response = await fetch(confirmApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider_reference: charge.provider_reference }) }); const body = await response.json(); if (!response.ok) return toast.error(body.error?.message || _('Could not confirm PIX')); setCharge({ ...charge, status: 'paid' }); toast.success(_('PIX payment confirmed in simulator')); }}>{_('Simulate PIX payment')}</Button><p className="text-xs text-muted-foreground">{_('Homologation simulator only')}</p></div> : null;
}

export const layout = { areaId: 'checkoutFormAfter', sortOrder: 20 };
export const query = `query Query { createChargeApi: url(routeId: "pixCreateCharge") confirmApi: url(routeId: "pixSimulate") }`;
