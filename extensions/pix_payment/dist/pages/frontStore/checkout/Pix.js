// @ts-ignore Storefront aliases are resolved by the EverShop webpack build.
import { Button } from '@components/common/ui/Button.js';
// @ts-ignore
import { toast } from '@components/common/ui/Sonner.js';
// @ts-ignore
import { useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useEffect, useState } from 'react';
export default function PixMethod({ createChargeApi, confirmApi }) {
    const { orderPlaced, orderId, checkoutData, loadingStates } = useCheckout();
    const { registerPaymentComponent } = useCheckoutDispatch();
    const [charge, setCharge] = useState(null);
    useEffect(() => {
        registerPaymentComponent('pix', {
            nameRenderer: () => React.createElement("span", { className: "flex w-full justify-between" },
                React.createElement("span", null, _('PIX')),
                React.createElement("span", null, "Banco do Brasil")),
            formRenderer: () => charge ? React.createElement("div", { className: "space-y-3 rounded border p-3" },
                React.createElement("p", null, _('After placing the order, scan the QR code or copy the PIX code below.')),
                React.createElement("textarea", { readOnly: true, value: charge.copy_paste, className: "min-h-20 w-full rounded border p-2 text-xs", onFocus: (e) => e.currentTarget.select() }),
                React.createElement("p", { className: "text-sm text-muted-foreground" },
                    _('Status'),
                    ": ",
                    charge.status)) : React.createElement("p", { className: "text-sm text-muted-foreground" }, _('The PIX charge is created after placing the order.')),
            checkoutButtonRenderer: () => {
                const { checkout } = useCheckoutDispatch();
                return React.createElement(Button, { type: "button", size: "xl", className: "w-full", disabled: loadingStates.placingOrder || orderPlaced, onClick: async (event) => { event.preventDefault(); try {
                        await checkout();
                    }
                    catch (error) {
                        toast.error((error === null || error === void 0 ? void 0 : error.message) || _('Could not place order'));
                    } } }, loadingStates.placingOrder ? _('Creating order...') : orderPlaced ? _('Order created') : _('Place order and generate PIX'));
            }
        });
    }, [registerPaymentComponent, charge, loadingStates.placingOrder, orderPlaced]);
    useEffect(() => {
        if (!orderPlaced || checkoutData.paymentMethod !== 'pix' || !orderId || charge)
            return;
        fetch(createChargeApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) })
            .then(async (response) => { var _a; const body = await response.json(); if (!response.ok)
            throw new Error(((_a = body.error) === null || _a === void 0 ? void 0 : _a.message) || _('Could not create PIX charge')); return body.data; })
            .then(setCharge).catch((error) => toast.error(error.message));
    }, [orderPlaced, checkoutData.paymentMethod, orderId, charge, createChargeApi]);
    return charge ? React.createElement("div", { className: "mt-3 space-y-2" },
        React.createElement(Button, { type: "button", variant: "secondary", onClick: async () => { var _a; const response = await fetch(confirmApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider_reference: charge.provider_reference }) }); const body = await response.json(); if (!response.ok)
                return toast.error(((_a = body.error) === null || _a === void 0 ? void 0 : _a.message) || _('Could not confirm PIX')); setCharge({ ...charge, status: 'paid' }); toast.success(_('PIX payment confirmed in simulator')); } }, _('Simulate PIX payment')),
        React.createElement("p", { className: "text-xs text-muted-foreground" }, _('Homologation simulator only'))) : null;
}
export const layout = { areaId: 'checkoutFormAfter', sortOrder: 20 };
export const query = `query Query { createChargeApi: url(routeId: "pixCreateCharge") confirmApi: url(routeId: "pixSimulate") }`;
//# sourceMappingURL=Pix.js.map