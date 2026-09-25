// @ts-ignore Storefront aliases are resolved by the EverShop webpack build.
import { Button } from '@components/common/ui/Button.js';
// @ts-ignore
import { toast } from '@components/common/ui/Sonner.js';
// @ts-ignore
import { useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext.js';
import React, { useEffect, useRef, useState } from 'react';
function PixCheckoutButton() {
    const { checkout } = useCheckoutDispatch();
    const { loadingStates, orderPlaced } = useCheckout();
    return React.createElement(Button, { type: "button", size: "xl", className: "w-full", disabled: loadingStates.placingOrder || orderPlaced, onClick: async (event) => {
            event.preventDefault();
            try {
                await checkout();
            }
            catch (error) {
                toast.error(error instanceof Error ? error.message : 'Não foi possível criar o pedido.');
            }
        } }, loadingStates.placingOrder ? 'Criando pedido…' : orderPlaced ? 'Pedido criado' : 'Criar pedido e gerar PIX');
}
export default function PixMethod({ createChargeApi, confirmApi }) {
    const { orderPlaced, orderId, checkoutData, checkoutSuccessUrl } = useCheckout();
    const { registerPaymentComponent } = useCheckoutDispatch();
    const [charge, setCharge] = useState(null);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [retry, setRetry] = useState(0);
    const confirmingRef = useRef(false);
    const pixPlaced = orderPlaced && checkoutData.paymentMethod === 'pix';
    useEffect(() => {
        registerPaymentComponent('pix', {
            nameRenderer: () => React.createElement("span", null, "PIX \u2014 simula\u00E7\u00E3o"),
            formRenderer: () => React.createElement("p", { className: "text-sm text-muted-foreground" }, "O QR Code ser\u00E1 exibido ap\u00F3s criar o pedido. Este teste n\u00E3o movimenta dinheiro."),
            checkoutButtonRenderer: PixCheckoutButton
        });
    }, [registerPaymentComponent]);
    useEffect(() => {
        if (!pixPlaced || !orderId)
            return;
        let active = true;
        setError('');
        fetch(createChargeApi, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId })
        }).then(async (response) => {
            var _a, _b;
            const body = await response.json();
            if (!response.ok || body.error || !((_a = body.data) === null || _a === void 0 ? void 0 : _a.qr_image)) {
                throw new Error(((_b = body.error) === null || _b === void 0 ? void 0 : _b.message) || 'Não foi possível gerar o PIX. Tente novamente.');
            }
            if (active)
                setCharge(body.data);
        }).catch((cause) => {
            if (active)
                setError(cause instanceof Error ? cause.message : 'Falha de conexão. Tente novamente.');
        });
        return () => { active = false; };
    }, [pixPlaced, orderId, createChargeApi, retry]);
    async function confirmPayment() {
        var _a, _b;
        if (!charge || !orderId || confirmingRef.current)
            return;
        confirmingRef.current = true;
        setConfirming(true);
        setError('');
        try {
            const response = await fetch(confirmApi, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider_reference: charge.provider_reference })
            });
            const body = await response.json();
            if (!response.ok || body.error || ((_a = body.data) === null || _a === void 0 ? void 0 : _a.status) !== 'paid') {
                throw new Error(((_b = body.error) === null || _b === void 0 ? void 0 : _b.message) || 'O pagamento ainda não foi confirmado. Tente novamente.');
            }
            setCharge({ ...charge, status: 'paid' });
            window.location.assign(checkoutSuccessUrl.replace(/\/$/, '') + '/' + encodeURIComponent(orderId));
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Falha de conexão. Tente novamente.');
            confirmingRef.current = false;
            setConfirming(false);
        }
    }
    if (!pixPlaced)
        return null;
    return React.createElement("section", { "aria-label": "Pagamento PIX", className: "mt-4 space-y-4 rounded border p-4" },
        React.createElement("h2", null, "Pagamento PIX de teste"),
        React.createElement("p", { className: "text-sm" }, "Simula\u00E7\u00E3o: n\u00E3o pague este c\u00F3digo em um aplicativo banc\u00E1rio."),
        charge ? React.createElement(React.Fragment, null,
            React.createElement("img", { src: charge.qr_image, alt: "QR Code PIX de teste", width: 320, height: 320, style: { display: 'block', maxWidth: '100%', height: 'auto', background: 'white' } }),
            React.createElement("label", { htmlFor: "pix-copy-paste" }, "PIX copia e cola"),
            React.createElement("textarea", { id: "pix-copy-paste", readOnly: true, value: charge.copy_paste, className: "min-h-20 w-full rounded border p-2 text-xs", onFocus: (event) => event.currentTarget.select() }),
            React.createElement(Button, { type: "button", variant: "secondary", onClick: async () => {
                    try {
                        await navigator.clipboard.writeText(charge.copy_paste);
                        toast.success('Código copiado.');
                    }
                    catch (_a) {
                        setError('Selecione o código acima e copie manualmente.');
                    }
                } }, "Copiar c\u00F3digo"),
            React.createElement("p", { role: "status" }, charge.status === 'paid' ? 'Pagamento confirmado. Abrindo seu pedido…' : confirming ? 'Confirmando pagamento…' : 'Aguardando pagamento de teste.'),
            React.createElement(Button, { type: "button", disabled: confirming || charge.status === 'paid', onClick: confirmPayment }, confirming ? 'Confirmando…' : 'Simular pagamento PIX')) : !error ? React.createElement("p", { role: "status" }, "Gerando QR Code\u2026") : null,
        error && React.createElement("p", { role: "alert" }, error),
        !charge && error && React.createElement(Button, { type: "button", onClick: () => setRetry((value) => value + 1) }, "Tentar gerar PIX novamente"));
}
export const layout = { areaId: 'checkoutFormAfter', sortOrder: 20 };
export const query = `query Query { createChargeApi: url(routeId: "pixCreateCharge") confirmApi: url(routeId: "pixSimulate") }`;
//# sourceMappingURL=Pix.js.map