import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  return user?.role === 'ADMIN';
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      premiumUsers,
      totalOrders,
      totalLeads,
      salesToday,
      revenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.lead.count(),
      prisma.order.count({ 
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: today }
        } 
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    // Usuários que cadastraram mas não são premium
    const registeredLeads = totalUsers - premiumUsers;

    return NextResponse.json({
      metrics: {
        totalUsers,
        premiumUsers,
        totalOrders,
        totalLeads, //leads do formulário
        registeredLeads, //leads que criaram conta mas não compraram
        salesToday,
        totalRevenue: revenue._sum.amount || 0,
        conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar stats admin:', error);
    return NextResponse.json({ error: 'Falha ao buscar estatísticas' }, { status: 500 });
  }
}
