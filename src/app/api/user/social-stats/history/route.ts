import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Busca o histórico ordenado por data
    const history = await prisma.userStatsHistory.findMany({
      where: { userId: user.id },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });

    // Formata os nomes dos meses
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const formattedHistory = history.map(item => ({
      name: `${monthNames[item.month - 1]}/${String(item.year).slice(-2)}`,
      instagram: item.instagramFollowers || 0,
      youtube: item.youtubeSubscribers || 0,
      tiktok: item.tiktokFollowers || 0,
      fullDate: item.recordedAt
    }));

    return NextResponse.json(formattedHistory);

  } catch (error: any) {
    console.error("Erro ao buscar histórico de estatísticas:", error);
    return NextResponse.json({ error: "Falha ao buscar histórico." }, { status: 500 });
  }
}
