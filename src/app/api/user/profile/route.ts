import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getMyChannel } from "@/lib/youtube";

// Rota para buscar e sincronizar dados reais do canal do usuário logado
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca o usuário atual no banco para obter os tokens do Google salvos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        googleAccessToken: true,
        niche: true,
        mainGoal: true,
        painPoints: true,
        youtubeChannelId: true,
        youtubeChannelName: true,
        youtubeChannelAvatar: true,
        subscribers: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Sincroniza com a API do YouTube se tiver o token
    let updatedData = {};
    if (user.googleAccessToken) {
      try {
        const channel = await getMyChannel(user.googleAccessToken);
        if (channel) {
          updatedData = {
            youtubeChannelId: channel.id,
            youtubeChannelName: channel.title,
            youtubeChannelAvatar: channel.thumbnails,
            subscribers: channel.subscriberCount,
          };

          // Salva os dados atualizados no banco
          await prisma.user.update({
            where: { email: session.user.email },
            data: updatedData
          });
        }
      } catch (err) {
        console.error("Erro ao sincronizar com YouTube:", err);
        // Continua para retornar os dados do banco se a sincronização falhar
      }
    }

    // Combina os dados existentes com os atualizados
    const finalProfile = {
      ...user,
      ...updatedData
    };

    return NextResponse.json({ profile: finalProfile });

  } catch (error: any) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Falha ao carregar perfil." }, { status: 500 });
  }
}
