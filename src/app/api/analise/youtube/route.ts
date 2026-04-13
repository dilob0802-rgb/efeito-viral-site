import { NextRequest, NextResponse } from "next/server";
import { searchChannel, getChannelVideos, getChannelDetails } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const channelId = searchParams.get("channelId");

  try {
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
      const channels = await searchChannel(query);
      return NextResponse.json(channels);
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na API do YouTube:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
