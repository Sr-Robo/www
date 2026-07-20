import Area from '@components/common/Area';
import React from 'react';

export default function ShopView() {
  return (
    <div className="page-width grid grid-cols-1 md:grid-cols-4 gap-5">
      <Area id="leftColumn" className="md:col-span-1" />
      <Area id="rightColumn" className="md:col-span-3" />
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
