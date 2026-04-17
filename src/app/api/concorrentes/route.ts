import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getChannelDetails, getChannelDetailsScraping, getChannelVideos, getChannelVideosRSS } from "@/lib/youtube";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const competitors = await prisma.competitor.findMany({
      where: { userId },
      include: {
        history: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Converter BigInt para string para JSON
    const serializedCompetitors = competitors.map(comp => ({
      ...comp,
      viewCount: comp.viewCount?.toString() || "0",
      history: comp.history.map(h => ({
        ...h,
        viewCount: h.viewCount?.toString() || "0"
      }))
    }));

    return NextResponse.json(serializedCompetitors);
  } catch (error) {
    console.error("Erro ao buscar concorrentes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as any).id;
  let { channelId, platform = "youtube" } = await req.json();

  if (!channelId) return NextResponse.json({ error: "ID do canal é obrigatório" }, { status: 400 });

  channelId = channelId.trim();
  console.log(`[API Concorrentes] Buscando canal: ${channelId} para o usuário: ${userId}`);

  try {
    // Buscar detalhes do canal
    let details: any = null;
    try {
      details = await getChannelDetails(channelId);
      if (!details) details = await getChannelDetailsScraping(channelId);
    } catch (e) {
      details = await getChannelDetailsScraping(channelId);
    }

    if (!details) {
      return NextResponse.json({ error: "Canal não encontrado no YouTube" }, { status: 404 });
    }

    // Criar o concorrente
    const competitor = await prisma.competitor.create({
      data: {
        userId,
        name: details.title,
        channelId: details.id,
        avatar: details.thumbnail,
        platform,
        subsCount: parseInt(details.subscriberCount) || 0,
        viewCount: BigInt(details.viewCount || "0"),
        videoCount: parseInt(details.videoCount) || 0,
        history: {
          create: {
            subsCount: parseInt(details.subscriberCount) || 0,
            viewCount: BigInt(details.viewCount || "0"),
          }
        }
      }
    });

    return NextResponse.json({
      ...competitor,
      viewCount: competitor.viewCount?.toString() || "0"
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Você já está seguindo este canal." }, { status: 400 });
    }
    console.error("Erro ao adicionar concorrente:", error);
    return NextResponse.json({ error: "Erro ao adicionar concorrente" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  try {
    await prisma.competitor.delete({
      where: { 
        id,
        userId: (session.user as any).id
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}
