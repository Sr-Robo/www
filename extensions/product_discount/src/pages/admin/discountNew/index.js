import {
  getContextValue,
  setContextValue
} from '@evershop/evershop/graphql/services';

export default (request) => {
  // Mesma coisa que setPageMetaInfo do core (não exportada no barrel
  // público cms/services): merge no contexto 'pageInfo'.
  const current = getContextValue(request, 'pageInfo', {});
  setContextValue(request, 'pageInfo', {
    ...current,
    title: 'Create a new discount',
    description: 'Create a new discount'
  });
};
