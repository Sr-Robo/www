import PropTypes from 'prop-types';
import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

// Versão própria do CategoryFilter (não reaproveita o do core): adiciona
// contagem de produtos "(N)" e o efeito glitch no hover, igual à referência.
export function CategoryFilter({ currentFilters, categories, updateFilter }) {
  const onChange = (e, categoryId) => {
    e.preventDefault();
    const index = currentFilters.findIndex((f) => f.key === 'cat');
    if (index !== -1) {
      const value = currentFilters[index].value.split(',');
      const optionIndex = value.findIndex((v) => v === categoryId.toString());
      if (optionIndex !== -1) {
        value.splice(optionIndex, 1);
        if (value.length === 0) {
          updateFilter(currentFilters.filter((f) => f.key !== 'cat'));
        } else {
          updateFilter(
            currentFilters.map((f) =>
              f.key !== 'cat'
                ? f
                : { key: 'cat', operation: 'in', value: value.join(',') }
            )
          );
        }
      } else {
        updateFilter(
          currentFilters.map((f) =>
            f.key !== 'cat'
              ? f
              : {
                  key: 'cat',
                  operation: 'in',
                  value: value.concat(categoryId).join(',')
                }
          )
        );
      }
    } else {
      updateFilter(
        currentFilters.concat({ key: 'cat', operation: 'in', value: categoryId })
      );
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="category-filter">
      <div className="filter-item-title">
        <span className="font-medium">{_('Category')}</span>
      </div>
      <ul className="filter-option-list">
        {categories.map((c) => {
          const isChecked = currentFilters.find(
            (f) =>
              f.key === 'cat' &&
              f.value.split(',').includes(c.categoryId.toString())
          );
          return (
            <li key={c.uuid} className={isChecked ? 'is-active' : ''}>
              <a
                href="#"
                className="cpk-glitch"
                data-text={c.name}
                onClick={(e) => onChange(e, c.categoryId)}
              >
                <span className="filter-option">{c.name}</span>
                {typeof c.productCount === 'number' && (
                  <span className="filter-option-count">({c.productCount})</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

CategoryFilter.propTypes = {
  currentFilters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryId: PropTypes.number,
      name: PropTypes.string,
      uuid: PropTypes.string,
      productCount: PropTypes.number
    })
  ).isRequired,
  updateFilter: PropTypes.func.isRequired
};
