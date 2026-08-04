import { MiniCart } from '@components/frontStore/cart/MiniCart.js';
import React from 'react';

interface MiniCartIconProps {
  cartUrl: string;
}

const CustomCartIcon = ({
  totalQty,
  onClick,
  isOpen,
  disabled = false,
  showItemCount = true,
  syncStatus
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mini-cart-icon relative rounded-md p-2 text-foreground/80 hover:text-foreground ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isOpen ? 'active' : ''} cpl-fancybox-toggle`}
      aria-label={`Shopping cart with ${totalQty} items`}
    >
      {syncStatus.syncing ? (
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-border"></div>
        </div>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 9C16 10.0609 15.5786 11.0783 14.8284 11.8284C14.0783 12.5786 13.0609 13 12 13C10.9391 13 9.92172 12.5786 9.17157 11.8284C8.42143 11.0783 8 10.0609 8 9M5 21L4.99605 21M4.99605 21C3.8933 20.9979 3 20.1033 3 19L3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H4.99605Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"></path>
        </svg>
      )}
      {showItemCount && totalQty > 0 && !syncStatus.syncing && (
        <span className="badge absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {totalQty > 99 ? '99+' : totalQty}
        </span>
      )}
    </button>
  );
};

export default function MiniCartIcon({ cartUrl }: MiniCartIconProps) {
  return (
    <MiniCart
      className="flex justify-center items-center"
      cartUrl={cartUrl}
      CartIconComponent={CustomCartIcon}
    />
  );
}

export const layout = {
  areaId: 'headerMiddleRight',
  sortOrder: 15
};

export const query = `
  query Query {
    cartUrl: url(routeId: "cart"),
  }
`;
