import { hookBefore } from '@evershop/evershop/lib/util/hookable';
import { validateTaxId, maskTaxId } from './services/validateTaxId.js';

export default async () => {
  // Hook de validação no salvamento do endereço de entrega
  hookBefore(
    'saveShippingAddress',
    async function validateShippingTaxId(addressData: any) {
      if (addressData && addressData.tax_id) {
        const result = validateTaxId(addressData.tax_id);
        if (!result.valid) {
          console.warn(`[checkout_br] Tentativa de cadastro de endereço com CPF/CNPJ inválido.`);
          throw new Error('CPF ou CNPJ inválido. Verifique o número informado.');
        }
        // Armazena formato limpo (apenas dígitos numéricos)
        addressData.tax_id = result.cleaned;
        console.log(`[checkout_br] Endereço de entrega com ${result.type} válido mascarado: ${result.masked}`);
      }
    },
    10
  );

  // Hook de validação no salvamento do endereço de faturamento
  hookBefore(
    'saveBillingAddress',
    async function validateBillingTaxId(addressData: any) {
      if (addressData && addressData.tax_id) {
        const result = validateTaxId(addressData.tax_id);
        if (!result.valid) {
          console.warn(`[checkout_br] Tentativa de cadastro de endereço de cobrança com CPF/CNPJ inválido.`);
          throw new Error('CPF ou CNPJ inválido. Verifique o número informado.');
        }
        addressData.tax_id = result.cleaned;
        console.log(`[checkout_br] Endereço de cobrança com ${result.type} válido mascarado: ${result.masked}`);
      }
    },
    10
  );
};
