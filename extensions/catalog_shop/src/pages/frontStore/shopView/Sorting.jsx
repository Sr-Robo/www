import PropTypes from 'prop-types';
import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import './Sorting.scss';

const options = [
  { code: 'price', name: _('Preço') },
  { code: 'name', name: _('Nome') }
];

export default function Sorting({ products: { total, currentFilters } }) {
  const currentOb = currentFilters.find((f) => f.key === 'ob');
  const page = currentFilters.find((f) => f.key === 'page');
  const limit = currentFilters.find((f) => f.key === 'limit');
  const hiddenFilters = currentFilters.filter(
    (f) => f.key !== 'ob' && f.key !== 'page'
  );

  // Cálculo do intervalo "Mostrando X-Y de Z resultados"
  const currentPage = parseInt(page?.value || '1', 10);
  const perPage = parseInt(limit?.value || '20', 10);
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div className="cpk-shop-toolbar flex justify-between items-center mb-5">
      {/* woocommerce-ordering */}
      <form
        method="get"
        action="/shop"
        className="woocommerce-ordering flex items-center gap-2"
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

      <p className="woocommerce-result-count">
        {total > 0
          ? _('Showing ${start}–${end} of ${total} results', {
              start: start.toString(),
              end: end.toString(),
              total: total.toString()
            })
          : _('No results found')}
      </p>
    </div>
  );
}

Sorting.propTypes = {
  products: PropTypes.shape({
    total: PropTypes.number,
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
    total: 0,
    currentFilters: []
  }
};

export const layout = {
  areaId: 'leftColumn',
  sortOrder: 15
};

export const query = `
  query Query($filters: [FilterInput]) {
    products(filters: $filters) {
      total
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
