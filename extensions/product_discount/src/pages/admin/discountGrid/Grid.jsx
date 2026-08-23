import { GridPagination } from '@components/admin/grid/GridPagination';
import { DummyColumnHeader } from '@components/admin/grid/header/Dummy';
import { SortableHeader } from '@components/admin/grid/header/Sortable';
import { Status } from '@components/admin/Status.js';
import Area from '@components/common/Area.js';
import { Form } from '@components/common/form/Form.js';
import { InputField } from '@components/common/form/InputField.js';
import { useAlertContext } from '@components/common/modal/Alert';
import { Button } from '@components/common/ui/Button.js';
import { ButtonGroup } from '@components/common/ui/ButtonGroup.js';
import { Card } from '@components/common/ui/Card';
import {
  CardAction,
  CardContent,
  CardHeader
} from '@components/common/ui/Card.js';
import { Checkbox } from '@components/common/ui/Checkbox.js';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@components/common/ui/Select.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/common/ui/Table.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import axios from 'axios';
import React, { useState } from 'react';

function Actions({ discounts = [], selectedIds = [] }) {
  const { openAlert, closeAlert } = useAlertContext();
  const [isLoading, setIsLoading] = useState(false);

  const updateDiscounts = async (status) => {
    setIsLoading(true);
    const promises = discounts
      .filter((discount) => selectedIds.includes(discount.uuid))
      .map((discount) => axios.patch(discount.updateApi, { status }));
    await Promise.all(promises);
    setIsLoading(false);
    // Refresh the page
    window.location.reload();
  };

  const deleteDiscounts = async () => {
    setIsLoading(true);
    const promises = discounts
      .filter((discount) => selectedIds.includes(discount.uuid))
      .map((discount) => axios.delete(discount.deleteApi));
    await Promise.all(promises);
    setIsLoading(false);
    // Refresh the page
    window.location.reload();
  };

  const actions = [
    {
      name: _('Disable'),
      onAction: () => {
        openAlert({
          heading: _('Disable ${count} discounts', {
            count: selectedIds.length
          }),
          content: _('Are you sure?'),
          primaryAction: {
            title: _('Cancel'),
            onAction: closeAlert,
            variant: 'secondary'
          },
          secondaryAction: {
            title: _('Disable'),
            onAction: async () => {
              await updateDiscounts(0);
            },
            variant: 'destructive'
          }
        });
      }
    },
    {
      name: _('Enable'),
      onAction: () => {
        openAlert({
          heading: _('Enable ${count} discounts', {
            count: selectedIds.length
          }),
          content: _('Are you sure?'),
          primaryAction: {
            title: _('Cancel'),
            onAction: closeAlert,
            variant: 'secondary'
          },
          secondaryAction: {
            title: _('Enable'),
            onAction: async () => {
              await updateDiscounts(1);
            },
            variant: 'destructive'
          }
        });
      }
    },
    {
      name: _('Delete'),
      onAction: () => {
        openAlert({
          heading: _('Delete ${count} discounts', {
            count: selectedIds.length
          }),
          content: <div>{_("Can't be undone")}</div>,
          primaryAction: {
            title: _('Cancel'),
            onAction: closeAlert,
            variant: 'secondary'
          },
          secondaryAction: {
            title: _('Delete'),
            onAction: async () => {
              await deleteDiscounts();
            },
            variant: 'destructive'
          }
        });
      }
    }
  ];

  return (
    <TableRow>
      {selectedIds.length === 0 && null}
      {selectedIds.length > 0 && (
        <TableCell colSpan="100">
          <ButtonGroup>
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={'outline'}
                onClick={(e) => {
                  e.preventDefault();
                  action.onAction();
                }}
              >
                {action.name}
              </Button>
            ))}
          </ButtonGroup>
        </TableCell>
      )}
    </TableRow>
  );
}

export default function DiscountGrid({
  discounts: { items: discounts, total, currentFilters = [] }
}) {
  const page = currentFilters.find((filter) => filter.key === 'page')
    ? parseInt(
        currentFilters.find((filter) => filter.key === 'page').value,
        10
      )
    : 1;
  const limit = currentFilters.find((filter) => filter.key === 'limit')
    ? parseInt(
        currentFilters.find((filter) => filter.key === 'limit').value,
        10
      )
    : 20;
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <Form submitBtn={false} id="discountGridFilter">
          <div className="flex gap-5 justify-center items-center">
            <Area
              id="discountGridFilter"
              noOuter
              coreComponents={[
                {
                  component: {
                    default: () => (
                      <InputField
                        name="product_name"
                        placeholder={_('Search')}
                        defaultValue={
                          currentFilters.find((f) => f.key === 'product_name')
                            ?.value
                        }
                        onKeyPress={(e) => {
                          // If the user press enter, we should submit the form
                          if (e.key === 'Enter') {
                            const url = new URL(document.location);
                            const productName = e.target?.value;
                            if (productName) {
                              url.searchParams.set(
                                'product_name[operation]',
                                'like'
                              );
                              url.searchParams.set(
                                'product_name[value]',
                                productName
                              );
                            } else {
                              url.searchParams.delete('product_name[operation]');
                              url.searchParams.delete('product_name[value]');
                            }
                            window.location.href = url;
                          }
                        }}
                      />
                    )
                  },
                  sortOrder: 5
                },
                {
                  component: {
                    default: () => (
                      <Select
                        value={
                          currentFilters.find((f) => f.key === 'status')?.value
                        }
                        onValueChange={(value) => {
                          const url = new URL(document.location);
                          url.searchParams.set('status', value);
                          window.location.href = url.href;
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>{_('Status')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{_('Status')}</SelectLabel>
                            <SelectItem value="1">{_('Enabled')}</SelectItem>
                            <SelectItem value="0">{_('Disabled')}</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )
                  },
                  sortOrder: 10
                }
              ]}
              currentFilters={currentFilters}
            />
          </div>
        </Form>
        <CardAction>
          <Button
            variant="link"
            onClick={() => {
              const url = new URL(document.location);
              url.search = '';
              window.location.href = url.href;
            }}
          >
            {_('Clear filter')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="form-field mb-0">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      if (checked)
                        setSelectedRows(discounts.map((d) => d.uuid));
                      else setSelectedRows([]);
                    }}
                  />
                </div>
              </TableHead>
              <Area
                id="discountGridHeader"
                noOuter
                coreComponents={[
                  {
                    component: {
                      default: () => (
                        <DummyColumnHeader title={_('Product')} />
                      )
                    },
                    sortOrder: 10
                  },
                  {
                    component: {
                      default: () => (
                        <SortableHeader
                          title={_('Discount')}
                          name="discount_percent"
                          currentFilters={currentFilters}
                        />
                      )
                    },
                    sortOrder: 20
                  },
                  {
                    component: {
                      default: () => (
                        <SortableHeader
                          title={_('Status')}
                          name="status"
                          currentFilters={currentFilters}
                        />
                      )
                    },
                    sortOrder: 30
                  }
                ]}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            <Actions
              discounts={discounts}
              selectedIds={selectedRows}
              setSelectedRows={setSelectedRows}
            />
            {discounts.map((d) => (
              <TableRow key={d.productDiscountId}>
                <TableHead>
                  <div className="form-field mb-0">
                    <Checkbox
                      checked={selectedRows.includes(d.uuid)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows(selectedRows.concat([d.uuid]));
                        } else {
                          setSelectedRows(
                            selectedRows.filter((row) => row !== d.uuid)
                          );
                        }
                      }}
                    />
                  </div>
                </TableHead>
                <Area
                  id="discountGridRow"
                  row={d}
                  noOuter
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  coreComponents={[
                    {
                      component: {
                        default: () => (
                          <TableCell>
                            <a
                              className="hover:underline font-semibold"
                              href={d.editUrl}
                            >
                              {d.productName || `#${d.productId}`}
                            </a>
                            {d.productSku && (
                              <span className="text-gray-400">
                                {' '}
                                ({d.productSku})
                              </span>
                            )}
                          </TableCell>
                        )
                      },
                      sortOrder: 10
                    },
                    {
                      component: {
                        default: () => (
                          <TableCell>{d.discountPercent}%</TableCell>
                        )
                      },
                      sortOrder: 20
                    },
                    {
                      component: {
                        default: () => (
                          <Status status={parseInt(d.status, 10)} />
                        )
                      },
                      sortOrder: 30
                    }
                  ]}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {discounts.length === 0 && (
          <div className="flex w-full justify-center mt-2">
            {_('There is no discount to display')}
          </div>
        )}
        <GridPagination total={total} limit={limit} page={page} />
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 20
};

export const query = `
  query Query($filters: [FilterInput]) {
    discounts: productDiscounts (filters: $filters) {
      items {
        productDiscountId
        uuid
        productId
        productName
        productSku
        discountPercent
        status
        editUrl
        updateApi
        deleteApi
      }
      total
      currentFilters {
        key
        operation
        value
      }
    }
  }
`;

export const variables = `
{
  filters: getContextValue('filtersFromUrl')
}`;
