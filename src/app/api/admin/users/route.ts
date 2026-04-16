import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper para verificar se é ADMIN
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

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPremium: true,
        plan: true,
        niche: true,
        subscribers: true,
        viewCount: true,
        whatsapp: true,
        createdAt: true,
        youtubeChannelName: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao buscar usuários' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const { userId, ...data } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao atualizar usuário' }, { status: 500 });
  }
}
