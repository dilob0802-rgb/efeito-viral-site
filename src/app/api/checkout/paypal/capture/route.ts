import { NextResponse } from 'next/server';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { paypalClient } from '@/lib/paypal';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const response = await paypalClient.execute(request);
    
    // Se o pagamento foi concluído com sucesso
    if (response.result.status === 'COMPLETED') {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          isPremium: true,
          plan: 'PREMIUM'
        }
      });
    }
    
    return NextResponse.json({
      status: response.result.status,
      details: response.result
    });

  } catch (error: any) {
    console.error('Erro ao capturar pagamento PayPal:', error);
    return NextResponse.json({ error: 'Falha ao processar pagamento' }, { status: 500 });
  }
}
