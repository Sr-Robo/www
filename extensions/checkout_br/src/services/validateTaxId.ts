/**
 * Validação e mascaramento de CPF e CNPJ (LGPD e consistência fiscal).
 */

export function validateCPF(cpf: string): boolean {
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas conhecidas (00000000000, 11111111111, etc.)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(digits.charAt(9), 10)) return false;

  // 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(digits.charAt(10), 10)) return false;

  return true;
}

export function validateCNPJ(cnpj: string): boolean {
  const digits = String(cnpj).replace(/\D/g, '');
  if (digits.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits.charAt(i), 10) * weights1[i];
  }
  let rest = sum % 11;
  const digit1 = rest < 2 ? 0 : 11 - rest;
  if (digit1 !== parseInt(digits.charAt(12), 10)) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits.charAt(i), 10) * weights2[i];
  }
  rest = sum % 11;
  const digit2 = rest < 2 ? 0 : 11 - rest;
  if (digit2 !== parseInt(digits.charAt(13), 10)) return false;

  return true;
}

export function maskTaxId(digits: string): string {
  if (!digits) return '';
  const clean = String(digits).replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
  }
  if (clean.length === 14) {
    return `${clean.slice(0, 2)}.***.***/****-${clean.slice(-2)}`;
  }
  return '***';
}

export interface TaxIdValidationResult {
  valid: boolean;
  cleaned: string;
  type: 'CPF' | 'CNPJ' | 'EMPTY' | 'INVALID';
  masked: string;
}

export function validateTaxId(taxId?: string | null): TaxIdValidationResult {
  if (!taxId || typeof taxId !== 'string' || taxId.trim() === '') {
    return {
      valid: true,
      cleaned: '',
      type: 'EMPTY',
      masked: ''
    };
  }

  const clean = taxId.replace(/\D/g, '');

  if (clean.length === 11) {
    const isValid = validateCPF(clean);
    return {
      valid: isValid,
      cleaned: isValid ? clean : '',
      type: isValid ? 'CPF' : 'INVALID',
      masked: isValid ? maskTaxId(clean) : ''
    };
  }

  if (clean.length === 14) {
    const isValid = validateCNPJ(clean);
    return {
      valid: isValid,
      cleaned: isValid ? clean : '',
      type: isValid ? 'CNPJ' : 'INVALID',
      masked: isValid ? maskTaxId(clean) : ''
    };
  }

  return {
    valid: false,
    cleaned: '',
    type: 'INVALID',
    masked: ''
  };
}
