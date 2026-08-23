import { addProcessor } from '@evershop/evershop/lib/util/registry';
import { defaultPaginationFilters } from '@evershop/evershop/lib/util/defaultPaginationFilters';
import { gateCouponCalculators } from './services/gateCouponCalculators.js';
import { registerCartItemDiscountFields } from './services/registerCartItemDiscountFields.js';
import { registerDefaultProductDiscountCollectionFilters } from './services/registerDefaultProductDiscountCollectionFilters.js';
import { wrapProductLoaderWithDiscount } from './services/wrapProductLoaderWithDiscount.js';

// Todos os addProcessor vivem aqui: o registry é travado (lockRegistry)
// depois que os bootstraps de módulos E extensões rodam.
// Priority 20 > 11 (promotion) garante que os resolvers desta extensão
// encadeiem DEPOIS dos do core (sortFields concatena na ordem de registro).
export default () => {
  // 1) Anexa discount_percent ao row do product carregado no item do carrinho
  addProcessor('cartItemProductLoaderFunction', wrapProductLoaderWithDiscount, 20);
  // 2) Campo novo + resolvers encadeados em final_price / final_price_incl_tax
  addProcessor('cartItemFields', registerCartItemDiscountFields, 20);
  // 3) Gate: item em promoção de produto não recebe desconto de cupom
  addProcessor('discountCalculatorFunctions', gateCouponCalculators, 20);
  // 4) Filtros do grid admin (mesmo shape do promotion/bootstrap.js)
  addProcessor(
    'productDiscountCollectionFilters',
    registerDefaultProductDiscountCollectionFilters,
    1
  );
  addProcessor(
    'productDiscountCollectionFilters',
    (filters) => [...filters, ...defaultPaginationFilters],
    2
  );
};
