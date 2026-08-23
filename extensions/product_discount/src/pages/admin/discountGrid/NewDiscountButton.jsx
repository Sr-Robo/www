import { Button } from '@components/common/ui/Button.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

export default function NewDiscountButton({ newDiscountUrl }) {
  return (
    <Button
      onClick={() => (window.location.href = newDiscountUrl)}
      title={_('New Discount')}
    >
      {' '}
      {_('New Discount')}{' '}
    </Button>
  );
}

export const layout = {
  areaId: 'pageHeadingRight',
  sortOrder: 10
};

export const query = `
  query Query {
    newDiscountUrl: url(routeId: "discountNew")
  }
`;
