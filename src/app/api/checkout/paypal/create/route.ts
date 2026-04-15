import { NextResponse } from 'next/server';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { paypalClient } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const { amount, description } = await req.json();

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'BRL',
          value: amount || '97.00'
        },
        description: description || 'Acesso Premium - Efeito Viral'
      }]
    });

    const response = await paypalClient.execute(request);
    
    return NextResponse.json({
      id: response.result.id
    });

  } catch (error: any) {
    console.error('Erro ao criar pedido PayPal:', error);
    return NextResponse.json({ error: 'Falha ao iniciar pagamento' }, { status: 500 });
  }
}
