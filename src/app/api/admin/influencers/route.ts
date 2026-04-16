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
    const influencers = await prisma.influencer.findMany({
      include: { 
        coupons: {
          select: {
            code: true,
            usageCount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(influencers);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao buscar influenciadores' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const influencer = await prisma.influencer.create({
      data: {
        name: data.name,
        socialHandle: data.socialHandle || null,
        whatsapp: data.whatsapp || null,
        commissionRate: parseFloat(data.commissionRate || 0)
      }
    });
    return NextResponse.json(influencer);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao criar influenciador' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    await prisma.influencer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao deletar influenciador' }, { status: 500 });
  }
}
