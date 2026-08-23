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
import { toast } from '@components/common/ui/Sonner.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

export default function DiscountNewForm({ action, gridUrl }) {
  return (
    <Form
      action={action}
      method="POST"
      id="discountNewForm"
      onSuccess={(response) => {
        toast.success(_('Discount created successfully!'));
        const editUrl = response.data.links.find(
          (link) => link.rel === 'edit'
        ).href;
        window.location.href = editUrl;
      }}
      submitBtn={false}
    >
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
      <FormButtons cancelUrl={gridUrl} formId="discountNewForm" />
    </Form>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    action: url(routeId: "createDiscount")
    gridUrl: url(routeId: "discountGrid")
  }
`;
