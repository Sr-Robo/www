/**
 * Deixa a home core renderizar normalmente.
 *
 * Registrado como middleware da rota core `homepage` — o EverShop anexa
 * middleware a uma rota existente pelo NOME DA PASTA batendo com o routeId
 * (`pages/frontStore/homepage/`), sem precisar de `route.json` novo aqui.
 *
 * NÃO renomear este arquivo para `redirect.js`/`redirect.ts`: colidiria em
 * `id` com o middleware `redirect` do core (escopo `frontStore`, em
 * modules/base/pages/frontStore/all/redirect.ts) e derrubaria o bootstrap
 * (`findDublicatedMiddleware.js` lança exceção nesse caso).
 *
 * Este middleware permanece registrado para preservar o ponto de extensão,
 * mas a home agora é controlada pelo Page Builder do EverShop.
 */
export default async (request, response, next) => {
  next();
};
