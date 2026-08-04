import PropTypes from 'prop-types';
import React from 'react';

// Versão própria do AttributeFilter (não reaproveita o do core): adiciona
// contagem de produtos "(N)" e o efeito glitch no hover, igual à referência.
// Título vem do próprio nome do atributo (ex: "Size"), já dinâmico.
export default function AttributeFilter({ currentFilters, availableAttributes, updateFilter }) {
  const onChange = (e, attributeCode, optionId) => {
    e.preventDefault();
    const index = currentFilters.findIndex((f) => f.key === attributeCode);
    if (index !== -1) {
      const value = currentFilters[index].value.split(',');
      const optionIndex = value.findIndex((v) => v === optionId.toString());
      if (optionIndex !== -1) {
        value.splice(optionIndex, 1);
        if (value.length === 0) {
          updateFilter(currentFilters.filter((f) => f.key !== attributeCode));
        } else {
          updateFilter(
            currentFilters.map((f) =>
              f.key !== attributeCode
                ? f
                : { key: attributeCode, operation: 'in', value: value.join(',') }
            )
          );
        }
      } else {
        updateFilter(
          currentFilters.map((f) =>
            f.key !== attributeCode
              ? f
              : {
                  key: attributeCode,
                  operation: 'in',
                  value: value.concat(optionId).join(',')
                }
          )
        );
      }
    } else {
      updateFilter(
        currentFilters.concat({ key: attributeCode, operation: 'in', value: optionId })
      );
    }
  };

  return (
    <>
      {availableAttributes.map((a) => (
        <div key={a.attributeCode} className="attribute-filter">
          <div className="filter-item-title">
            <span className="font-medium">{a.attributeName}</span>
          </div>
          <ul className="filter-option-list">
            {a.options.map((o) => {
              const isChecked = currentFilters.find(
                (f) =>
                  f.key === a.attributeCode &&
                  f.value.split(',').includes(o.optionId.toString())
              );
              return (
                <li key={o.optionId} className={isChecked ? 'is-active' : ''}>
                  <a
                    href="#"
                    className="cpk-glitch"
                    data-text={o.optionText}
                    onClick={(e) => onChange(e, a.attributeCode, o.optionId)}
                  >
                    <span className="filter-option">{o.optionText}</span>
                    {typeof o.productCount === 'number' && (
                      <span className="filter-option-count">({o.productCount})</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

AttributeFilter.propTypes = {
  currentFilters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired,
  availableAttributes: PropTypes.arrayOf(
    PropTypes.shape({
      attributeCode: PropTypes.string,
      attributeName: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          optionId: PropTypes.number,
          optionText: PropTypes.string,
          productCount: PropTypes.number
        })
      )
    })
  ).isRequired,
  updateFilter: PropTypes.func.isRequired
};
