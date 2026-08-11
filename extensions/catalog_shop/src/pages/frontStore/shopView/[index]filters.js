import { buildFilterFromUrl } from '@evershop/evershop/lib/util/buildFilterFromUrl';
import { setContextValue } from '@evershop/evershop/graphql/services';

const DEFAULT_LIMIT = '4';

export default (request, response, next) => {
  const filters = buildFilterFromUrl(request);

  // Injetar limit=4 como default quando não vier explícito na URL
  if (!filters.find((f) => f.key === 'limit')) {
    filters.push({ key: 'limit', operation: 'eq', value: DEFAULT_LIMIT });
  }

  setContextValue(request, 'filtersFromUrl', filters);
  next();
};
