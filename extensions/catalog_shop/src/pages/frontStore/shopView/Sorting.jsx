import PropTypes from 'prop-types';
import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import './Sorting.scss';

const options = [
  { code: 'price', name: _('Preço') },
  { code: 'name', name: _('Nome') }
];

export default function Sorting({ products: { currentFilters } }) {
  const currentOb = currentFilters.find((f) => f.key === 'ob');
  const hiddenFilters = currentFilters.filter(
    (f) => f.key !== 'ob' && f.key !== 'page'
  );

  return (
    <form
      method="get"
      action="/shop"
      className="cpk-shop-sorting flex justify-end items-center gap-2 mb-5"
    >
      {hiddenFilters.map((f) =>
        f.operation === 'eq' ? (
          <input key={f.key} type="hidden" name={f.key} value={f.value} />
        ) : (
          <React.Fragment key={f.key}>
            <input
              type="hidden"
              name={`${f.key}[operation]`}
              value={f.operation}
            />
            <input type="hidden" name={`${f.key}[value]`} value={f.value} />
          </React.Fragment>
        )
      )}
      <label htmlFor="shop-sort-by">{_('Ordenar por')}:</label>
      <select
        id="shop-sort-by"
        name="ob"
        defaultValue={currentOb ? currentOb.value : ''}
        className="cpk-input"
        onChange={(e) => e.target.form.submit()}
      >
        <option value="">{_('Padrão')}</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </form>
  );
}

Sorting.propTypes = {
  products: PropTypes.shape({
    currentFilters: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        operation: PropTypes.string,
        value: PropTypes.string
      })
    )
  })
};

Sorting.defaultProps = {
  products: {
    currentFilters: []
  }
};

export const layout = {
  areaId: 'rightColumn',
  sortOrder: 15
};

export const query = `
  query Query($filters: [FilterInput]) {
    products(filters: $filters) {
      currentFilters {
        key
        operation
        value
      }
    }
  }`;

export const variables = `
{
  filters: getContextValue('filtersFromUrl')
}`;
