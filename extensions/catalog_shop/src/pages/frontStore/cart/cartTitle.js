import { translate } from '@evershop/evershop/lib/locale/translate/translate';
import {
  getContextValue,
  setContextValue
} from '@evershop/evershop/graphql/services';

/**
 * Sobrescreve o <title> do documento na rota core `cart` para o formato de
 * prompt de terminal `sr@robo:~/cart$` (mesma identidade do /shop).
 *
 * Registrado como middleware da rota core `cart` — o EverShop anexa middleware
 * a uma rota existente pelo NOME DA PASTA batendo com o routeId
 * (`pages/frontStore/cart/`), sem precisar de `route.json` novo aqui.
 *
 * NÃO renomear este arquivo para `index.js`/`index.ts`: colidiria em `id`
 * (o id do middleware é o basename sem extensão) com o `index.ts` do core na
 * MESMA rota `cart` (modules/checkout/pages/frontStore/cart/index.ts) e o
 * bootstrap derrubaria a loja inteira no boot (`addMiddleware` lança
 * "Found two middleware with the same id"). Por isso o nome único `cartTitle`.
 *
 * Passivo (3 argumentos, chama `next()`): só enriquece o pageInfo e segue a
 * cadeia. Faz merge do pageInfo atual (`...current`) para não apagar o que o
 * middleware do core já setou via setPageMetaInfo.
 */
export default (request, response, next) => {
  const current = getContextValue(request, 'pageInfo', {});
  setContextValue(request, 'pageInfo', {
    ...current,
    title: 'sr@robo:~/cart$',
    description: translate('Shopping cart')
  });
  if (typeof next === 'function') {
    next();
  }
};
