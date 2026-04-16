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
    request.requestBody({} as any);

    const response = await paypalClient.execute(request);
    
    // Se o pagamento foi concluído com sucesso
    if (response.result.status === 'COMPLETED') {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        const purchaseUnit = response.result.purchase_units[0];
        const amount = parseFloat(purchaseUnit.amount.value);
        const currency = purchaseUnit.amount.currency_code;

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: true,
              plan: 'PREMIUM'
            }
          }),
          prisma.order.create({
            data: {
              userId: user.id,
              amount: amount,
              currency: currency,
              status: 'COMPLETED',
              paypalId: orderID,
              // O código do cupom pode vir opcionalmente no corpo da requisição futuramente
              couponCode: (await req.clone().json()).couponCode || null
            }
          })
        ]);
      }
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
