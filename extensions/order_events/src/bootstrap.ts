import { insert, select } from '@evershop/postgres-query-builder';
import { v4 as uuidv4 } from 'uuid';
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

export default async () => {
  hookAfter(
    'saveOrderItems',
    // O runtime do hookable chama after-hooks como (result, ...argsOriginais):
    // hookable.ts:100 → callbackFunc.call(context, result, ...argumentsList).
    // saveOrderItems(cart, orderId, connection) retorna savedItems, então a
    // callback recebe 4 args. Omitir o primeiro desloca tudo e faz `connection`
    // receber o número order.insertId → TypeError → rollback de todo checkout.
    async function writeOrderPlacedOutbox(
      savedItems: any,
      cart: any,
      orderId: number,
      connection: any
    ) {
      try {
        // 1. Carregar dados completos do pedido recém gravado
        const order = await select()
          .from('order')
          .where('order_id', '=', orderId)
          .load(connection);

        if (!order) {
          return;
        }

        // 2. Carregar itens do pedido
        const items = await select()
          .from('order_item')
          .where('order_item_order_id', '=', orderId)
          .execute(connection);

        // 3. Carregar endereço de entrega
        let shippingAddress: any = null;
        if (order.shipping_address_id) {
          shippingAddress = await select()
            .from('order_address')
            .where('order_address_id', '=', order.shipping_address_id)
            .load(connection);
        }

        // 4. Carregar endereço de faturamento (opcional)
        let billingAddress: any = null;
        if (order.billing_address_id) {
          billingAddress = await select()
            .from('order_address')
            .where('order_address_id', '=', order.billing_address_id)
            .load(connection);
        }

        // 5. Montar payload canônico estritamente compatível com o schema order.placed.schema.json v1
        const occurredAt = new Date().toISOString();
        const eventId = uuidv4();
        const orderNumberStr = String(order.order_number);

        const payload = {
          order_id: String(order.order_id),
          order_number: orderNumberStr,
          customer: {
            customer_id: order.customer_id ? String(order.customer_id) : undefined,
            email: order.customer_email || 'cliente@robo.net.br',
            full_name: order.customer_full_name || 'Cliente Sr. Robô',
            tax_id: shippingAddress?.tax_id
              ? String(shippingAddress.tax_id).replace(/\D/g, '')
              : billingAddress?.tax_id
              ? String(billingAddress.tax_id).replace(/\D/g, '')
              : undefined,
            phone: order.customer_phone || shippingAddress?.telephone || undefined
          },
          shipping_address: {
            full_name: shippingAddress?.full_name || order.customer_full_name || 'Destinatário',
            address1: shippingAddress?.address_1 || 'Endereço não informado',
            address2: shippingAddress?.address_2 || undefined,
            city: shippingAddress?.city || 'São Paulo',
            province: shippingAddress?.province || 'SP',
            postal_code: shippingAddress?.postcode || '01001-000',
            country: shippingAddress?.country || 'BR',
            phone: shippingAddress?.telephone || undefined
          },
          billing_address: billingAddress
            ? {
                full_name: billingAddress.full_name || undefined,
                address1: billingAddress.address_1 || undefined,
                address2: billingAddress.address_2 || undefined,
                city: billingAddress.city || undefined,
                province: billingAddress.province || undefined,
                postal_code: billingAddress.postcode || undefined,
                country: billingAddress.country || undefined,
                phone: billingAddress.telephone || undefined
              }
            : undefined,
          items: items.map((item: any) => ({
            product_id: String(item.product_id),
            sku: String(item.product_sku),
            name: String(item.product_name),
            qty: parseInt(item.qty, 10),
            price: parseFloat(item.product_price),
            total: parseFloat(item.final_price || item.total || item.product_price * item.qty)
          })),
          totals: {
            subtotal: parseFloat(order.sub_total || 0),
            shipping_fee: parseFloat(order.shipping_fee || 0),
            discount: parseFloat(order.discount_amount || 0),
            tax: parseFloat(order.tax_amount || 0),
            grand_total: parseFloat(order.grand_total || 0)
          },
          currency: order.currency || 'BRL',
          notes: order.customer_notes || undefined,
          created_at: occurredAt
        };

        const businessKey = {
          order_number: orderNumberStr
        };

        // 6. Inserir na tabela event_outbox DENTRO DA MESMA TRANSAÇÃO
        await insert('event_outbox')
          .given({
            event_id: eventId,
            event_type: 'order.placed',
            event_version: 1,
            occurred_at: occurredAt,
            producer: 'evershop',
            business_key: JSON.stringify(businessKey),
            payload: JSON.stringify(payload),
            status: 'pending'
          })
          .execute(connection);
      } catch (err) {
        // Se falhar a gravação no outbox, propaga o erro para dar rollback na transação do pedido
        throw err;
      }
    },
    15
  );
};
