import { NextRequest, NextResponse } from "next/server";
import { searchChannel, getChannelVideos, getChannelDetails, searchTopChannels, getMostPopularVideos, getMyChannel, searchVideos } from "@/lib/youtube";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || searchParams.get("q");
  const channelId = searchParams.get("channelId") || searchParams.get("id");
  const trend = searchParams.get("trend");
  const mine = searchParams.get("mine");

  try {
    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { googleAccessToken: true }
      });

      if (!user?.googleAccessToken) {
        return NextResponse.json({ error: "Token Google não encontrado" }, { status: 404 });
      }

      const channel = await getMyChannel(user.googleAccessToken);
      return NextResponse.json(channel);
    }

    if (trend === "channels") {
      const topChannels = await searchTopChannels();
      return NextResponse.json(topChannels);
    }
    
    if (trend === "videos") {
      if (query) {
        const searchedVideos = await searchVideos(query);
        return NextResponse.json(searchedVideos);
      }
      const topVideos = await getMostPopularVideos();
      return NextResponse.json(topVideos);
    }

    if (channelId) {
      const results = await Promise.all([
        getChannelDetails(channelId),
        getChannelVideos(channelId)
      ]);
      
      return NextResponse.json({
        profile: results[0],
        videos: results[1]
      });
    }

    if (query) {
      // Se for um handle (@), busca detalhes diretos primeiro
      if (query.startsWith("@")) {
        const directChannel = await getChannelDetails(query);
        if (directChannel) {
          return NextResponse.json([directChannel]);
        }
      }
      
      const channels = await searchChannel(query);
      return NextResponse.json(channels);
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na API do YouTube:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
