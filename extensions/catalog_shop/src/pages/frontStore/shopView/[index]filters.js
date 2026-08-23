import { buildFilterFromUrl } from '@evershop/evershop/lib/util/buildFilterFromUrl';
import { setContextValue } from '@evershop/evershop/graphql/services';

const DEFAULT_LIMIT = '4';

// Ordenação padrão da /shop quando a URL não traz `ob` explícito (pedido do
// fxlip 2026-08-22: poder escolher o que é o "Padrão"). Valores aceitos pelo
// core em registerDefaultProductCollectionFilters.js (filtro `ob`):
//   ''      → "Ordenar por Padrão" = produto mais recente primeiro
//             (ORDER BY product_id DESC, default do ProductCollection)
//   'price' → menor preço primeiro (ASC)
//   'name'  → alfabético A→Z
//   'qty'   → estoque ASC | 'status' → status ASC (válidos no core, mas sem
//             opção correspondente no select do Sorting.jsx)
// O valor injetado também faz o select abrir na opção certa, porque o
// Sorting.jsx marca a opção pelo currentFilters.
const DEFAULT_SORT_BY = '';

export default (request, response, next) => {
  const filters = buildFilterFromUrl(request.originalUrl);

  // Injetar limit=4 como default quando não vier explícito na URL
  if (!filters.find((f) => f.key === 'limit')) {
    filters.push({ key: 'limit', operation: 'eq', value: DEFAULT_LIMIT });
  }

  // Idem pro `ob`: sem ele na URL, a ordem seria sempre o default do core
  // (recentes primeiro) sem aparecer como opção marcada no select.
  if (!filters.find((f) => f.key === 'ob')) {
    filters.push({ key: 'ob', operation: 'eq', value: DEFAULT_SORT_BY });
  }

  setContextValue(request, 'filtersFromUrl', filters);
  next();
};
