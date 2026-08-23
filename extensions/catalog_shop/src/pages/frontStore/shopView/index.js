import { translate } from '@evershop/evershop/lib/locale/translate/translate';
import { setContextValue } from '@evershop/evershop/graphql/services';

export default (request, response, next) => {
  setContextValue(request, 'pageInfo', {
    // Título no formato prompt de terminal (pedido do fxlip 2026-08-22),
    // acompanha a identidade cyberpunk. Literal de marca — sem translate.
    title: 'sr@robo:~/shop$',
    description: translate('Shop'),
    url: request.url,
    breadcrumbs: []
  });
  next();
};
