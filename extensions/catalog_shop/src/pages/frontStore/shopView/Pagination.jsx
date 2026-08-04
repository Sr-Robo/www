import {
  Pagination,
  DefaultPaginationRenderer
} from '@components/frontStore/Pagination.js';
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
      {(paginationProps) => (
        <DefaultPaginationRenderer renderProps={paginationProps} />
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
  areaId: 'rightColumn',
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
