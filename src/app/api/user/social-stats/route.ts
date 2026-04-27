import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Função utilitária para converter strings como "10.5k" em números
const parseSocialNumber = (str: string | number) => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  
  let num = str.toLowerCase().replace(/[^0-9,.]/g, '').replace(',', '.');
  let multiplier = 1;
  if (str.includes('m')) multiplier = 1000000;
  else if (str.includes('k') || str.includes('mil')) multiplier = 1000;
  
  return Math.round(parseFloat(num) * multiplier);
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { 
      instagramUsername,
      instagramFollowers,
      tiktokUsername,
      tiktokFollowers,
      youtubeUsername,
      youtubeFollowers
    } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 1. Atualiza o perfil principal do usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        instagramUsername,
        instagramFollowers: String(instagramFollowers),
        tiktokUsername,
        tiktokFollowers: String(tiktokFollowers),
        youtubeChannelName: youtubeUsername || undefined,
        subscribers: String(youtubeFollowers) || undefined
      }
    });

    // 2. Salva no histórico mensal
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    await prisma.userStatsHistory.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year
        }
      },
      update: {
        instagramFollowers: parseSocialNumber(instagramFollowers),
        tiktokFollowers: parseSocialNumber(tiktokFollowers),
        youtubeSubscribers: parseSocialNumber(youtubeFollowers),
        recordedAt: now
      },
      create: {
        userId: user.id,
        month,
        year,
        instagramFollowers: parseSocialNumber(instagramFollowers),
        tiktokFollowers: parseSocialNumber(tiktokFollowers),
        youtubeSubscribers: parseSocialNumber(youtubeFollowers),
        recordedAt: now
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error("Erro ao salvar estatísticas sociais:", error);
    return NextResponse.json({ error: "Falha ao salvar estatísticas." }, { status: 500 });
  }
}
