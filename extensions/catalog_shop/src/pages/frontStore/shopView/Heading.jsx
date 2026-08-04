import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

// Título "Loja" acima do conteúdo (produtos/sorting), à esquerda.
// areaId: leftColumn, antes do sorting (sortOrder 5 < 15).
export default function ShopHeading() {
  return (
    <div className="mb-2 md:mb-5">
      <h1 className="cpk-h1" style={{ color: '#fff' }}>{_('Loja')}</h1>
    </div>
  );
}

export const layout = {
  areaId: 'leftColumn',
  sortOrder: 5
};
