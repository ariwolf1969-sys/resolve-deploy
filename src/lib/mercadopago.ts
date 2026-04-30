import mercadopago from 'mercadopago';

// Initialize Mercado Pago SDK
export function initMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('MP_ACCESS_TOKEN no configurado. Los pagos funcionarán en modo demo.');
    return null;
  }

  mercadopago.configure({
    access_token: accessToken,
  });

  return mercadopago;
}

// Create a payment preference for a quote
export async function createPaymentPreference({
  quoteId,
  title,
  description,
  amount,
  userId,
  userEmail,
}: {
  quoteId: string;
  title: string;
  description: string;
  amount: number;
  userId: string;
  userEmail?: string;
}) {
  const mp = initMercadoPago();
  
  // Demo mode: return mock data
  if (!mp) {
    const mockPreferenceId = `demo_pref_${quoteId}_${Date.now()}`;
    return {
      id: mockPreferenceId,
      init_point: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/${mockPreferenceId}/status`,
      sandbox_init_point: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/${mockPreferenceId}/status`,
      status: 'demo',
    };
  }

  try {
    const preference = await mp.preferences.create({
      items: [
        {
          id: quoteId,
          title: title.substring(0, 100),
          description: description.substring(0, 256),
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS',
        },
      ],
      payer: userEmail ? { email: userEmail } : undefined,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/pending`,
      },
      auto_return: 'approved',
      external_reference: `${quoteId}:${userId}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/webhook`,
      statement_descriptor: 'RESOLVE AR',
    });

    return preference.body;
  } catch (error) {
    console.error('Error creando preferencia de pago:', error);
    throw new Error('Error al crear preferencia de pago con Mercado Pago');
  }
}

// Get payment status from MP
export async function getPaymentStatus(paymentId: string) {
  const mp = initMercadoPago();
  
  if (!mp) {
    return {
      id: paymentId,
      status: 'pending',
      status_detail: 'pending_demo',
    };
  }

  try {
    const payment = await mp.payment.get(Number(paymentId));
    return payment.body;
  } catch (error) {
    console.error('Error consultando estado de pago:', error);
    throw new Error('Error al consultar estado de pago');
  }
}

export { mercadopago };
