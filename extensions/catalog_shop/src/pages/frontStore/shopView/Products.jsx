import ProductList from '@components/frontStore/catalog/product/list/List.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import './Products.scss';

export default function Products({
  products: { items, total }
}) {
  return (
    <div>
      <ProductList products={items} countPerRow={3} />
      <span className="product-count italic block mt-5">
        {_('Showing ${count} products', { count: total.toString() })}
      </span>
    </div>
  );
}

Products.propTypes = {
  products: PropTypes.shape({
    total: PropTypes.number,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        productId: PropTypes.number,
        url: PropTypes.string,
        price: PropTypes.shape({
          regular: PropTypes.shape({
            value: PropTypes.number,
            text: PropTypes.string
          }),
          special: PropTypes.shape({
            value: PropTypes.number,
            text: PropTypes.string
          })
        }),
        image: PropTypes.shape({
          alt: PropTypes.string,
          listing: PropTypes.string
        })
      })
    )
  })
};

Products.defaultProps = {
  products: {
    total: 0,
    items: []
  }
};

export const layout = {
  areaId: 'rightColumn',
  sortOrder: 25
};

export const query = `
  query Query($filters: [FilterInput]) {
    products(filters: $filters) {
      total
      items {
        ...Product
      }
    }
  }`;

export const fragments = `
  fragment Product on Product {
    productId
    name
    sku
    price {
      regular {
        value
        text
      }
      special {
        value
        text
      }
    }
    image {
      alt
      url: listing
    }
    url
  }
`;

export const variables = `
{
  filters: getContextValue('filtersFromUrl')
}`;
