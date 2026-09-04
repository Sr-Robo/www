import { registerShippingProvider } from '@evershop/evershop/checkout/services';

const GATEWAY_URL = process.env.SHIPPING_GATEWAY_URL || 'http://integracoes:9999/shipping/quote';
const GATEWAY_TOKEN = process.env.SHIPPING_API_TOKEN || '';

export interface ShippingItemDTO {
  productId: number;
  sku: string;
  name: string;
  qty: number;
  weight: number;
  unitPrice: number;
  lineTotal: number;
  noShippingRequired: boolean;
}

export interface ShippingContextDTO {
  origin: any;
  destination: any;
  zone: any;
  items: ShippingItemDTO[];
  totalWeight: number;
  totalValue: number;
  currency: string;
  zoneConfig: Record<string, unknown>;
  providerConfig: Record<string, unknown>;
}

export interface ShippingMethodDTO {
  code: string;
  name: string;
  cost: number;
  taxClass?: string;
  carrier?: string;
  serviceCode?: string;
  delivery?: {
    minBusinessDays?: number;
    maxBusinessDays?: number;
    estimatedDate?: string;
  };
  metadata?: Record<string, unknown>;
}

export const correiosProvider = {
  code: 'correios',
  name: 'Correios',
  description: 'Cotação de frete Correios CWS (PAC e SEDEX) com cache e fallback de alta resiliência',
  quoteTimeoutMs: 4000,
  quoteTtlSeconds: 86400,

  async getMethods(ctx: ShippingContextDTO): Promise<ShippingMethodDTO[]> {
    const destPostalCode = ctx.destination?.postcode;
    if (!destPostalCode) {
      return [];
    }

    // Soma de peso dos itens (se peso for 0 ou indefinido, adota default conservador de 300g por item)
    let totalWeightG = 0;
    if (ctx.items && ctx.items.length > 0) {
      for (const item of ctx.items) {
        const itemWeight = item.weight && item.weight > 0 ? item.weight : 300;
        totalWeightG += itemWeight * (item.qty || 1);
      }
    } else {
      totalWeightG = ctx.totalWeight && ctx.totalWeight > 0 ? ctx.totalWeight : 500;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (GATEWAY_TOKEN) {
        headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`;
      }

      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          postal_code: destPostalCode,
          weight_g: totalWeightG
        }),
        signal: AbortSignal.timeout(4000)
      });

      if (!response.ok) {
        console.warn(`[correios_shipping] Gateway retornou HTTP ${response.status}`);
        return [];
      }

      const data: any = await response.json();
      if (!data || !Array.isArray(data.methods)) {
        return [];
      }

      return data.methods.map((m: any) => ({
        code: `correios_${m.code}`,
        name: m.name || (m.code === 'sedex' ? 'Correios SEDEX' : 'Correios PAC'),
        cost: Number(m.price),
        carrier: 'Correios',
        serviceCode: m.code,
        delivery: {
          maxBusinessDays: m.delivery_days || (m.code === 'sedex' ? 2 : 7)
        },
        metadata: {
          source: m.source || 'gateway'
        }
      }));
    } catch (err: any) {
      console.warn('[correios_shipping] Falha ao cotar com gateway de frete:', err.message);
      return [];
    }
  }
};

export default async () => {
  registerShippingProvider(correiosProvider);
};
