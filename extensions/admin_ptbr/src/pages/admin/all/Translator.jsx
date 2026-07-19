import React from 'react';

// Overlay de tradução PT-BR para o painel admin.
// O admin do EverShop não tem i18n embutido (só a loja/frontstore tem, via
// translations/pt/*.csv) — em vez de editar ~189 arquivos core (o que geraria
// conflito constante com o sync diário do upstream), essa extensão troca as
// strings em inglês por português direto no DOM, no navegador, depois que a
// página carrega. Frágil a mudanças de texto no upstream (se o EverShop mudar
// uma string em inglês, a tradução daquela string específica para de bater),
// mas não toca em nada do core.
const script = `
(function () {
  var dict = {
    // Login
    "Email": "E-mail",
    "Password": "Senha",
    "Email is required": "E-mail é obrigatório",
    "Password is required": "Senha é obrigatória",
    "SIGN IN": "ENTRAR",
    "Invalid email or password": "E-mail ou senha inválidos",
    "Logout": "Sair",
    "Logout failed": "Falha ao sair",

    // Navegação lateral
    "Dashboard": "Painel",
    "Sale": "Vendas",
    "Orders": "Pedidos",
    "Catalog": "Catálogo",
    "Products": "Produtos",
    "Categories": "Categorias",
    "Collections": "Coleções",
    "Attributes": "Atributos",
    "Customer": "Cliente",
    "Customers": "Clientes",
    "Promotion": "Promoção",
    "Coupons": "Cupons",
    "CMS": "CMS",
    "Pages": "Páginas",
    "Widgets": "Widgets",
    "Setting": "Configurações",

    // Ações comuns
    "Save": "Salvar",
    "Cancel": "Cancelar",
    "Delete": "Excluir",
    "Edit": "Editar",
    "Enable": "Ativar",
    "Disable": "Desativar",
    "Enabled": "Ativado",
    "Disabled": "Desativado",
    "Search": "Buscar",
    "Clear filter": "Limpar filtro",
    "Create a new product": "Criar novo produto",
    "Add new address": "Adicionar novo endereço",
    "New folder": "Nova pasta",
    "Upload image": "Enviar imagem",
    "Insert image": "Inserir imagem",
    "Delete image": "Excluir imagem",
    "No file selected": "Nenhum arquivo selecionado",
    "Invalid folder name": "Nome de pasta inválido",
    "Select Attribute Groups": "Selecionar Grupos de Atributos",
    "Search attribute groups": "Buscar grupos de atributos",
    "Search categories": "Buscar categorias",
    "Search collections": "Buscar coleções",
    "Search products": "Buscar produtos",
    "Mark as shipped": "Marcar como enviado",
    "Configurable": "Configurável",
    "Simple": "Simples",

    // Colunas de grid
    "Name": "Nome",
    "Full Name": "Nome completo",
    "Price": "Preço",
    "Status": "Status",
    "Product type": "Tipo de produto",
    "Created At": "Criado em",
    "Payment status": "Status do pagamento",
    "Shipment status": "Status do envio",
    "Payment Status": "Status do Pagamento",
    "Shipment Status": "Status do Envio",
    "Order Number": "Número do Pedido",
    "Date": "Data",
    "Customer Email": "E-mail do Cliente",
    "Total": "Total"
  };

  var TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label'];

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      var trimmed = node.nodeValue.trim();
      if (trimmed && Object.prototype.hasOwnProperty.call(dict, trimmed)) {
        node.nodeValue = node.nodeValue.replace(trimmed, dict[trimmed]);
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;

    for (var i = 0; i < TRANSLATABLE_ATTRS.length; i++) {
      var attr = TRANSLATABLE_ATTRS[i];
      if (node.hasAttribute(attr)) {
        var val = node.getAttribute(attr);
        if (Object.prototype.hasOwnProperty.call(dict, val)) {
          node.setAttribute(attr, dict[val]);
        }
      }
    }

    for (var j = 0; j < node.childNodes.length; j++) {
      translateNode(node.childNodes[j]);
    }
  }

  function run() {
    translateNode(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        translateNode(n);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
`;

export default function AdminPtBrTranslator() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export const layout = {
  areaId: 'head',
  sortOrder: 100
};
