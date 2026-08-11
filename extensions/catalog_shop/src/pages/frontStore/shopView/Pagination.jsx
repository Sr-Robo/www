import {
  Pagination
} from '@components/frontStore/Pagination.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import PropTypes from 'prop-types';
import React from 'react';

export default function PaginationWrapper({
  products: { total, currentFilters }
}) {
  const page = currentFilters.find((filter) => filter.key === 'page');
  const limit = currentFilters.find((filter) => filter.key === 'limit');

  return (
    <Pagination
      total={total}
      limit={limit ? parseInt(limit.value, 10) : 20}
      currentPage={parseInt(page?.value || '1', 10)}
    >
      {({ hasPrev, hasNext, goToPrev, goToNext, isLoading }) => (
        <div className="products-pagination flex justify-center mt-8 mb-8 gap-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading && hasPrev) goToPrev();
            }}
            disabled={!hasPrev || isLoading}
            className={`cpk-btn cpk-btn--outline ${(!hasPrev || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cpk-glitch'}`}
            data-text={_('Previous')}
          >
            <span className="cpk-btn-bg" aria-hidden="true" />
            {_('Previous')}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading && hasNext) goToNext();
            }}
            disabled={!hasNext || isLoading}
            className={`cpk-btn cpk-btn--outline ${(!hasNext || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cpk-glitch'}`}
            data-text={_('Next')}
          >
            <span className="cpk-btn-bg" aria-hidden="true" />
            {_('Next')}
          </button>
        </div>
      )}
    </Pagination>
  );
}

PaginationWrapper.propTypes = {
  products: PropTypes.shape({
    total: PropTypes.number.isRequired,
    currentFilters: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        operation: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired
};

export const layout = {
  areaId: 'leftColumn',
  sortOrder: 30
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
