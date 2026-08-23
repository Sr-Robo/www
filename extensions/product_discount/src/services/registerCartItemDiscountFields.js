import { toPrice } from '@evershop/evershop/checkout/services';

// Registra os campos do desconto de produto no item do carrinho.
// O registry 'cartItemFields' encadeia processors e sortFields MESCLA campos
// de mesma key (resolvers concatenam depois dos do core; o resolver recebe o
// valor anterior) — por isso podemos "acoplar" um passo nos resolvers de
// final_price/final_price_incl_tax do core sem substituí-los.
// A partir daí a cascata é automática: line_total → sub_total → tax_amount →
// grand_total (e o snapshot order_item.final_price sai descontado).
export function registerCartItemDiscountFields(fields) {
  return fields.concat([
    {
      key: 'product_discount_percent',
      resolvers: [
        async function resolver() {
          const product = await this.getProduct();
          if (!product) {
            return 0;
          }
          const percent = parseFloat(product.discount_percent);
          return Number.isFinite(percent) && percent > 0 ? percent : 0;
        }
      ],
      dependencies: ['product_id']
    },
    {
      key: 'final_price',
      resolvers: [
        async function resolver(previous) {
          const percent = this.getData('product_discount_percent');
          return percent > 0
            ? toPrice(previous * (1 - percent / 100))
            : previous;
        }
      ],
      dependencies: ['product_discount_percent']
    },
    {
      key: 'final_price_incl_tax',
      resolvers: [
        async function resolver(previous) {
          const percent = this.getData('product_discount_percent');
          return percent > 0
            ? toPrice(previous * (1 - percent / 100))
            : previous;
        }
      ],
      dependencies: ['product_discount_percent']
    }
  ]);
}
