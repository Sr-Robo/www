import { buildFilterFromUrl } from '@evershop/evershop/lib/util/buildFilterFromUrl';
import {
  getContextValue,
  setContextValue
} from '@evershop/evershop/graphql/services';

export default (request, response) => {
  // Mesma coisa que setPageMetaInfo do core (não exportada no barrel
  // público cms/services): merge no contexto 'pageInfo'.
  const current = getContextValue(request, 'pageInfo', {});
  setContextValue(request, 'pageInfo', {
    ...current,
    title: 'Discounts',
    description: 'Discounts'
  });
  setContextValue(
    request,
    'filtersFromUrl',
    buildFilterFromUrl(request.originalUrl)
  );
};
