import { FormButtons } from '@components/admin/FormButtons.js';
import Area from '@components/common/Area.js';
import { Form } from '@components/common/form/Form.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

export default function DiscountEditForm({ action, gridUrl }) {
  return (
    <Form method="PATCH" action={action} submitBtn={false} id="discountEditForm">
      <div className="grid grid-cols-1 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>{_('General Information')}</CardTitle>
            <CardDescription>
              {_('The general information about the discount.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Area id="discountEditGeneral" noOuter />
          </CardContent>
        </Card>
      </div>
      <FormButtons cancelUrl={gridUrl} formId="discountEditForm" />
    </Form>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    action: url(routeId: "updateDiscount", params: [{key: "id", value: getContextValue("discountUuid")}]),
    gridUrl: url(routeId: "discountGrid")
  }
`;
