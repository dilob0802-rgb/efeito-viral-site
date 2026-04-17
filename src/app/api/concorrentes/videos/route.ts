import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChannelVideos, getChannelVideosRSS } from "@/lib/youtube";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) return NextResponse.json({ error: "channelId é obrigatório" }, { status: 400 });

  try {
    let videos: any[] = [];
    try {
      videos = await getChannelVideos(channelId);
      if (!videos || videos.length === 0) {
        videos = await getChannelVideosRSS(channelId);
      }
    } catch (e) {
      videos = await getChannelVideosRSS(channelId);
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return NextResponse.json({ error: "Erro ao buscar vídeos" }, { status: 500 });
  }
}
