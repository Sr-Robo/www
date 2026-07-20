import { buildFilterFromUrl } from '@evershop/evershop/lib/util/buildFilterFromUrl';
import { setContextValue } from '@evershop/evershop/graphql/services';

export default (request, response, next) => {
  setContextValue(request, 'filtersFromUrl', buildFilterFromUrl(request));
  next();
};
