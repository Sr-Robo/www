import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

export default function ShopHeading() {
  return (
    <div className="page-width">
      <div className="mb-2 md:mb-5">
        <h1 className="cpk-h1">{_('Shop')}</h1>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 5
};
