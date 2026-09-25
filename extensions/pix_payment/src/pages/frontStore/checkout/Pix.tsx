// @ts-ignore Storefront aliases are resolved by the EverShop webpack build.
import { Button } from '@components/common/ui/Button.js';
// @ts-ignore
import { toast } from '@components/common/ui/Sonner.js';
// @ts-ignore
import { useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext.js';
import React, { useEffect, useRef, useState } from 'react';

type Charge = {
  provider_reference: string;
  copy_paste: string;
  qr_image: string;
  expires_at: string;
  status: string;
};

function PixCheckoutButton() {
  const { checkout } = useCheckoutDispatch();
  const { loadingStates, orderPlaced } = useCheckout();
  return <Button type="button" size="xl" className="w-full"
    disabled={loadingStates.placingOrder || orderPlaced}
    onClick={async (event: React.MouseEvent) => {
      event.preventDefault();
      try { await checkout(); }
      catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível criar o pedido.'); }
    }}>
    {loadingStates.placingOrder ? 'Criando pedido…' : orderPlaced ? 'Pedido criado' : 'Criar pedido e gerar PIX'}
  </Button>;
}

export default function PixMethod({ createChargeApi, confirmApi }: { createChargeApi: string; confirmApi: string }) {
  const { orderPlaced, orderId, checkoutData, checkoutSuccessUrl } = useCheckout();
  const { registerPaymentComponent } = useCheckoutDispatch();
  const [charge, setCharge] = useState<Charge | null>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [retry, setRetry] = useState(0);
  const confirmingRef = useRef(false);
  const pixPlaced = orderPlaced && checkoutData.paymentMethod === 'pix';

  useEffect(() => {
    registerPaymentComponent('pix', {
      nameRenderer: () => <span>PIX — simulação</span>,
      formRenderer: () => <p className="text-sm text-muted-foreground">O QR Code será exibido após criar o pedido. Este teste não movimenta dinheiro.</p>,
      checkoutButtonRenderer: PixCheckoutButton
    });
  }, [registerPaymentComponent]);

  useEffect(() => {
    if (!pixPlaced || !orderId) return;
    let active = true;
    setError('');
    fetch(createChargeApi, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    }).then(async (response) => {
      const body = await response.json();
      if (!response.ok || body.error || !body.data?.qr_image) {
        throw new Error(body.error?.message || 'Não foi possível gerar o PIX. Tente novamente.');
      }
      if (active) setCharge(body.data);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Falha de conexão. Tente novamente.');
    });
    return () => { active = false; };
  }, [pixPlaced, orderId, createChargeApi, retry]);

  async function confirmPayment() {
    if (!charge || !orderId || confirmingRef.current) return;
    confirmingRef.current = true;
    setConfirming(true);
    setError('');
    try {
      const response = await fetch(confirmApi, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_reference: charge.provider_reference })
      });
      const body = await response.json();
      if (!response.ok || body.error || body.data?.status !== 'paid') {
        throw new Error(body.error?.message || 'O pagamento ainda não foi confirmado. Tente novamente.');
      }
      setCharge({ ...charge, status: 'paid' });
      window.location.assign(checkoutSuccessUrl.replace(/\/$/, '') + '/' + encodeURIComponent(orderId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha de conexão. Tente novamente.');
      confirmingRef.current = false;
      setConfirming(false);
    }
  }

  if (!pixPlaced) return null;
  return <section aria-label="Pagamento PIX" className="mt-4 space-y-4 rounded border p-4">
    <h2>Pagamento PIX de teste</h2>
    <p className="text-sm">Simulação: não pague este código em um aplicativo bancário.</p>
    {charge ? <>
      <img src={charge.qr_image} alt="QR Code PIX de teste" width={320} height={320}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', background: 'white' }} />
      <label htmlFor="pix-copy-paste">PIX copia e cola</label>
      <textarea id="pix-copy-paste" readOnly value={charge.copy_paste}
        className="min-h-20 w-full rounded border p-2 text-xs"
        onFocus={(event) => event.currentTarget.select()} />
      <Button type="button" variant="secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(charge.copy_paste); toast.success('Código copiado.'); }
        catch { setError('Selecione o código acima e copie manualmente.'); }
      }}>Copiar código</Button>
      <p role="status">{charge.status === 'paid' ? 'Pagamento confirmado. Abrindo seu pedido…' : confirming ? 'Confirmando pagamento…' : 'Aguardando pagamento de teste.'}</p>
      <Button type="button" disabled={confirming || charge.status === 'paid'} onClick={confirmPayment}>
        {confirming ? 'Confirmando…' : 'Simular pagamento PIX'}
      </Button>
    </> : !error ? <p role="status">Gerando QR Code…</p> : null}
    {error && <p role="alert">{error}</p>}
    {!charge && error && <Button type="button" onClick={() => setRetry((value) => value + 1)}>Tentar gerar PIX novamente</Button>}
  </section>;
}

export const layout = { areaId: 'checkoutFormAfter', sortOrder: 20 };
export const query = `query Query { createChargeApi: url(routeId: "pixCreateCharge") confirmApi: url(routeId: "pixSimulate") }`;
