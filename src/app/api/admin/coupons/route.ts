import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;

  if (session.user.email.toLowerCase() === "admin@efeitoviral.com") return true;
  if ((session.user as any).role === 'ADMIN') return true;

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
    const coupons = await prisma.coupon.findMany({
      include: { influencer: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao buscar cupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType, // PERCENTAGE, FIXED
        discountValue: parseFloat(data.discountValue),
        maxUsage: data.maxUsage ? parseInt(data.maxUsage) : null,
        influencerId: data.influencerId || null,
        isActive: true
      }
    });
    return NextResponse.json(coupon);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Este código de cupom já existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Falha ao criar cupom' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao deletar cupom' }, { status: 500 });
  }
}
