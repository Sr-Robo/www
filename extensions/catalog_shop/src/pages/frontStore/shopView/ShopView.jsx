import Area from '@components/common/Area';
import React from 'react';

// Layout: sidebar à direita (320px), conteúdo à esquerda (920px).
// grid-cols-[920px_320px] só em ≥1320px; em telas menores cai pra col-span natural.
// Título "Loja" fica acima do leftColumn (conteúdo), não centralizado.
export default function ShopView() {
  return (
    <div className="page-width grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar (filtros) — 1/4 da largura, à direita */}
      <div className="md:col-span-1">
        <Area id="rightColumn" noOuter />
      </div>
      {/* Conteúdo (produtos + sorting + paginação) — 3/4 da largura, à esquerda */}
      <div className="md:col-span-3">
        <Area id="leftColumn" noOuter />
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
