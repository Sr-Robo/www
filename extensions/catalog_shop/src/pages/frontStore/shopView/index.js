import { translate } from '@evershop/evershop/lib/locale/translate/translate';
import { setContextValue } from '@evershop/evershop/graphql/services';

export default (request, response, next) => {
  setContextValue(request, 'pageInfo', {
    title: translate('Shop'),
    description: translate('Shop'),
    url: request.url
  });
  next();
};
