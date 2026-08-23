// Gate não-acumulativo (decisão do fxlip 2026-08-23): item com desconto de
// produto fica FORA do cálculo do cupom; os demais itens do carrinho recebem
// o cupom normalmente.
//
// O registry 'discountCalculatorFunctions' encadeia processors — os
// calculadores default do promotion devolvem [fn1..fn4] e cada fn faz
// early-return quando o discount_type do cupom não é o seu. Este processor
// recebe esse array e devolve wrappers: cada wrapper roda o calculador
// original e DEPOIS zera o discount_amount dos itens em promoção (setData
// com 0 passa no contrato do DataObject: o resolver do item devolve
// toPrice(requestedValue) — e short-circuita se já é 0). O somatório do
// cart.discount_amount acontece depois de calculateDiscount retornar, então
// a cota zerada nunca entra no total. A cota do cupom não é redistribuída
// aos demais itens (mais conservador: nunca super-desconta).
export function gateCouponCalculators(calculators) {
  return calculators.map(
    (calculator) =>
      async function gatedCalculator(cart, coupon) {
        await calculator(cart, coupon);
        const items = cart.getItems();
        for (const item of items) {
          if (item.getData('product_discount_percent') > 0) {
            await item.setData('discount_amount', 0);
          }
        }
      }
  );
}
