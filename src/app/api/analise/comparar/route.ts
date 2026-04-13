import { NextResponse } from "next/server";
import { getChannelDetails, getChannelVideos } from "@/lib/youtube";
import { generateComparisonAnalysis } from "@/lib/gemini";

const calculateViralScore = (subscribers: string, videoList: any[]) => {
  const subs = parseInt(subscribers);
  if (!subs || videoList.length === 0) return 0;
  const totalViews = videoList.reduce((sum, v) => sum + parseInt(v.viewCount), 0);
  const avgViews = totalViews / videoList.length;
  const ratio = avgViews / subs;
  let score = Math.round(ratio * 20);
  if (score > 100) score = 100;
  if (score < 5) score = 5;
  return score;
};

export async function POST(req: Request) {
  try {
    const { channelIdA, channelIdB } = await req.json();

    if (!channelIdA || !channelIdB) {
      return NextResponse.json({ error: "É necessário fornecer dois IDs de canal." }, { status: 400 });
    }

    // Buscar dados de ambos simultaneamente
    const [detailsA, videosA, detailsB, videosB] = await Promise.all([
      getChannelDetails(channelIdA),
      getChannelVideos(channelIdA),
      getChannelDetails(channelIdB),
      getChannelVideos(channelIdB)
    ]);

    if (!detailsA || !detailsB) {
      return NextResponse.json({ error: "Um ou ambos os canais não foram encontrados." }, { status: 404 });
    }

    // Preparar dados para a IA
    const channelA = {
      title: detailsA.title,
      subscribers: detailsA.subscriberCount,
      score: calculateViralScore(detailsA.subscriberCount, videosA)
    };

    const channelB = {
      title: detailsB.title,
      subscribers: detailsB.subscriberCount,
      score: calculateViralScore(detailsB.subscriberCount, videosB)
    };

    // Gerar análise comparativa
    const analysis = await generateComparisonAnalysis(channelA, channelB);

    return NextResponse.json({
      canalA: { ...detailsA, score: channelA.score },
      canalB: { ...detailsB, score: channelB.score },
      analysis
    });

  } catch (error: any) {
    console.error("Erro na Arena:", error);
    return NextResponse.json({ error: "Erro ao processar o duelo na Arena." }, { status: 500 });
  }
}
