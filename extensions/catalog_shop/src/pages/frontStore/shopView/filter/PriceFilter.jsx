import PropTypes from 'prop-types';
import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

// Versão própria do PriceFilter (não reaproveita o do core): a referência
// exige clique manual em "Filtrar" — o core aplica sozinho com debounce ao
// arrastar. Mantém o mesmo range duplo (dois <input type=range>).
export default function PriceFilter({
  priceRange: { min: minPrice, max: maxPrice },
  currentFilters,
  updateFilter,
  setting: { storeLanguage: language, storeCurrency: currency }
}) {
  const initialFrom = () => {
    const f = currentFilters.find((filter) => filter.key === 'min_price');
    return f ? Number(f.value) : minPrice;
  };
  const initialTo = () => {
    const f = currentFilters.find((filter) => filter.key === 'max_price');
    return f ? Number(f.value) : maxPrice;
  };

  const [from, setFrom] = React.useState(initialFrom);
  const [to, setTo] = React.useState(initialTo);

  React.useEffect(() => {
    setFrom(initialFrom());
    setTo(initialTo());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters]);

  const onChange = (e, direction) => {
    const { value } = e.target;
    if (direction === 'min') {
      setFrom(Math.min(Number(value), to - 1));
    } else {
      setTo(Math.max(Number(value), from + 1));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const newFilters = currentFilters.filter(
      (f) => f.key !== 'min_price' && f.key !== 'max_price'
    );
    if (from > minPrice) {
      newFilters.push({ key: 'min_price', operation: 'eq', value: from });
    }
    if (to < maxPrice) {
      newFilters.push({ key: 'max_price', operation: 'eq', value: to });
    }
    updateFilter(newFilters);
  };

  const f = new Intl.NumberFormat(language, {
    style: 'currency',
    currency
  }).format(from);
  const t = new Intl.NumberFormat(language, {
    style: 'currency',
    currency
  }).format(to);

  return (
    <div className="price-filter">
      <div className="filter-item-title">{_('Filter by Price')}</div>
      <form onSubmit={onSubmit}>
        <div className="rangeslider">
          <input
            className="min"
            type="range"
            min={minPrice}
            max={maxPrice}
            value={from}
            onChange={(e) => onChange(e, 'min')}
          />
          <input
            className="max"
            type="range"
            min={minPrice}
            max={maxPrice}
            value={to}
            onChange={(e) => onChange(e, 'max')}
          />
        </div>
        <div className="price-filter-amount">
          {_('Price')}: <span>{f}</span> — <span>{t}</span>
        </div>
        <button
          type="submit"
          className="cpk-btn cpk-btn--outline cpk-glitch cpk-glitch-btn"
          data-text={_('Filter')}
        >
          <span className="cpk-btn-bg" aria-hidden="true" />
          {_('Filter')}
        </button>
      </form>
    </div>
  );
}

PriceFilter.propTypes = {
  currentFilters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired,
  priceRange: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired,
  setting: PropTypes.shape({
    storeLanguage: PropTypes.string,
    storeCurrency: PropTypes.string
  }).isRequired,
  updateFilter: PropTypes.func.isRequired
};
