import { NextResponse } from 'next/server';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { paypalClient } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const response = await paypalClient.execute(request);
    
    // Aqui você pode atualizar o status do usuário no banco de dados!
    // status: response.result.status (COMPLETED)
    
    return NextResponse.json({
      status: response.result.status,
      details: response.result
    });

  } catch (error: any) {
    console.error('Erro ao capturar pagamento PayPal:', error);
    return NextResponse.json({ error: 'Falha ao processar pagamento' }, { status: 500 });
  }
}
