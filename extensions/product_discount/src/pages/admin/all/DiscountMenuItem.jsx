import { NavigationItem } from '@components/admin/NavigationItem.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { Percent } from 'lucide-react';
import React from 'react';

export default function DiscountMenuItem({ discountGrid }) {
  return (
    <NavigationItem Icon={Percent} url={discountGrid} title={_('Discounts')} />
  );
}

// Inject into the existing Promotion menu group (rendered by CouponMenuGroup as
// an Area with id `couponMenuGroup`) without editing CouponMenuGroup itself.
export const layout = {
  areaId: 'couponMenuGroup',
  sortOrder: 30
};

export const query = `
  query Query {
    discountGrid: url(routeId: "discountGrid")
  }
`;
