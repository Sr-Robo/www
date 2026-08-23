import { ProductSelector } from '@components/admin/ProductSelector.js';
import Area from '@components/common/Area.js';
import { InputField } from '@components/common/form/InputField.js';
import { RadioGroupField } from '@components/common/form/RadioGroupField.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/common/ui/Dialog.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

// Seletor de produto único: campo hidden product_id + Dialog com o
// ProductSelector do core (mesmo embrulho do SkuConditionValueSelector,
// adaptação a 1 item pro formulário minimalista do MVP).
function ProductPickerField({ discount }) {
  const { setValue } = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(
    discount?.productSku
      ? { sku: discount.productSku, name: discount.productName || '' }
      : null
  );

  const onSelect = async (sku, uuid, productId) => {
    setValue('product_id', Number(productId), { shouldValidate: true });
    setSelected({ sku, name: '' });
    setDialogOpen(false);
  };

  return (
    <div>
      <InputField
        type="hidden"
        name="product_id"
        defaultValue={discount?.productId}
        validation={{
          required: _('Product is required')
        }}
      />
      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogTrigger>
          <Button variant={'outline'}>
            {selected ? selected.name || selected.sku : _('Select product')}
          </Button>
        </DialogTrigger>
        <DialogContent className={'max-w-[80vw]'}>
          <DialogHeader>
            <DialogTitle>{_('Select product')}</DialogTitle>
          </DialogHeader>
          <ProductSelector
            onSelect={onSelect}
            selectedProducts={
              discount?.productId
                ? [{ productId: String(discount.productId) }]
                : []
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function General({ discount }) {
  return (
    <Area
      id="discountFormGeneral"
      className="space-y-3"
      coreComponents={[
        {
          component: {
            default: <ProductPickerField discount={discount} />
          },
          sortOrder: 10
        },
        {
          component: {
            default: (
              <InputField
                name="discount_percent"
                type="number"
                label={_('Discount percent (%)')}
                defaultValue={discount?.discountPercent ?? ''}
                placeholder={_('Enter discount percent')}
                required
                validation={{
                  required: _('Discount percent is required'),
                  min: {
                    value: 0.01,
                    message: _('Discount percent must be greater than 0')
                  },
                  max: {
                    value: 100,
                    message: _('Discount percent must be 100 or less')
                  }
                }}
              />
            )
          },
          sortOrder: 20
        },
        {
          component: {
            default: (
              <RadioGroupField
                name="status"
                label={_('Status')}
                options={[
                  { label: _('Enabled'), value: 1 },
                  { label: _('Disabled'), value: 0 }
                ]}
                defaultValue={discount?.status === 0 ? 0 : 1}
                required
                validation={{
                  required: _('Status is required'),
                  valueAsNumber: true
                }}
              />
            )
          },
          sortOrder: 30
        }
      ]}
    />
  );
}

export const layout = {
  areaId: 'discountEditGeneral',
  sortOrder: 10
};

export const query = `
  query Query {
    discount: productDiscount(id: getContextValue('discountId', null)) {
      productId
      productName
      productSku
      discountPercent
      status
    }
  }
`;
