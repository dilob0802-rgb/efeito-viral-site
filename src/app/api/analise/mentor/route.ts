import { NextRequest, NextResponse } from "next/server";
import { getChannelVideos, getChannelDetails } from "@/lib/youtube";
import { generateViralAnalysis } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { channelId } = await req.json();

    if (!channelId) {
      return NextResponse.json({ error: "ID do canal é obrigatório" }, { status: 400 });
    }

    // 1. Buscar dados do canal e vídeos populares
    const [channelDetails, videos] = await Promise.all([
      getChannelDetails(channelId),
      getChannelVideos(channelId)
    ]);

    if (!channelDetails) {
      return NextResponse.json({ error: "Canal não encontrado" }, { status: 404 });
    }

    // 2. Chamar o Gemini para gerar a análise
    const analysis = await generateViralAnalysis({
      channelTitle: channelDetails.title,
      videos: videos
    });

    return NextResponse.json({ 
      analysis,
      success: true 
    });

  } catch (error: any) {
    console.error("Erro na API do Mentor IA:", error);
    return NextResponse.json({ 
      error: "Falha ao processar análise inteligente.",
      details: error.message 
    }, { status: 500 });
  }
}
