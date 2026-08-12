import Area from '@components/common/Area.js';
import { Button } from '@components/common/ui/Button.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

export function DefaultMiniCartDropdownSummary({
  total,
  cartUrl,
  checkoutUrl,
  totalQty
}: {
  total: string;
  cartUrl: string;
  checkoutUrl: string;
  totalQty: number;
}) {
  // Mesmo tratamento cpk-btn/cpk-glitch do botão "Filtrar"
  // (extensions/catalog_shop/.../filter/PriceFilter.jsx): precisa do
  // texto num data-text (glitch de texto lê attr(data-text) via CSS) e do
  // <span class="cpk-btn-bg"> real como pai do fundo cortado/glitch.
  const viewCartLabel = _('View Cart (${totalQty})', {
    totalQty: totalQty.toString()
  });
  const checkoutLabel = _('Checkout');

  return (
    <>
      <div className="minicart__summary flex justify-between items-center mb-3">
        <span className="font-medium text-foreground">{_('Subtotal')}:</span>
        <span className="font-semibold text-lg text-foreground">
          {total || '—'}
        </span>
      </div>
      <Area id="miniCartSummaryViewCartButtonBefore" noOuter />
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={'outline'}
          size={'lg'}
          onClick={() => {
            if (cartUrl) {
              window.location.href = cartUrl;
            }
          }}
          className="minicart__viewcart__button cpk-btn cpk-btn--outline cpk-glitch cpk-glitch-btn w-full"
          data-text={viewCartLabel}
        >
          <span className="cpk-btn-bg" aria-hidden="true" />
          {viewCartLabel}
        </Button>
        <Area id="miniCartSummaryViewCartButtonAfter" noOuter />
        <Area id="miniCartSummaryCheckoutButtonBefore" noOuter />
        <Button
          variant={'default'}
          size={'lg'}
          onClick={() => {
            if (checkoutUrl) {
              window.location.href = checkoutUrl;
            }
          }}
          className="minicart__checkout__button cpk-btn cpk-glitch cpk-glitch-btn w-full"
          data-text={checkoutLabel}
        >
          <span className="cpk-btn-bg" aria-hidden="true" />
          {checkoutLabel}
        </Button>
      </div>
      <Area id="miniCartSummaryCheckoutButtonAfter" noOuter />
    </>
  );
}
