import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Rota para buscar os dados do perfil do usuário logado (Apenas do Banco de Dados)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca o usuário atual no banco
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        niche: true,
        mainGoal: true,
        painPoints: true,
        youtubeChannelId: true,
        youtubeChannelName: true,
        youtubeChannelAvatar: true,
        subscribers: true,
        viewCount: true,
        videoCount: true,
        instagramUsername: true,
        instagramFollowers: true,
        tiktokUsername: true,
        tiktokFollowers: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ profile: user });

  } catch (error: any) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Falha ao carregar perfil." }, { status: 500 });
  }
}
