/**
 * Redireciona a home ("/") para a listagem de produtos ("/shop").
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
 * A vitrine oficial continua sendo a listagem `/shop`; a home do Page Builder
 * não é exibida publicamente.
 */
export default async (request, response, next) => {
  response.redirect(302, '/shop');
};
