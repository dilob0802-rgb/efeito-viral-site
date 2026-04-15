import { NextResponse } from "next/server";
import { getChannelDetails, getChannelVideos, getChannelDetailsScraping, getChannelVideosRSS } from "@/lib/youtube";
import { generateComparisonAnalysis } from "@/lib/gemini";

const calculateViralScore = (subscribers: string, videoList: any[]) => {
  const subs = parseInt(subscribers.replace(/[^0-9]/g, '')) || 1;
  const totalViews = videoList.reduce((sum, v) => sum + parseInt(v.viewCount || 0), 0);
  const avgViews = videoList.length > 0 ? totalViews / videoList.length : 0;
  const ratio = avgViews / subs;
  let score = Math.round(ratio * 20);
  if (score > 100) score = 100;
  if (score < 5) score = 5;
  return score;
};

const analyzeChannel = (details: any, videos: any[]) => {
  const subs = parseInt(details.subscriberCount?.replace(/[^0-9]/g, '')) || 0;
  const viewCount = parseInt(details.viewCount?.replace(/[^0-9]/g, '')) || 0;
  const videoCount = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + parseInt(v.viewCount || 0), 0);
  const avgViews = videoCount > 0 ? totalViews / videoCount : 0;
  
  // Cálculo de engajamento melhorado
  const engagement = subs > 0 ? (avgViews / subs) * 100 : 0;
  
  const positives: string[] = [];
  const negatives: string[] = [];
  const scores: any = { engagement: 5, consistency: 5, growth: 5, authority: 5 };

  // 1. Engajamento (Qualidade do conteúdo)
  if (engagement > 12) { positives.push("Altíssimo engajamento direto"); scores.engagement = 10; }
  else if (engagement > 6) { positives.push("Engajamento acima da média"); scores.engagement = 8; }
  else if (engagement > 2) { scores.engagement = 6; }
  else { negatives.push("Engajamento frio (poucas views p/ inscrito)"); scores.engagement = 3; }

  // 2. Consistência (Frequência)
  if (videoCount >= 10) { positives.push("Postagens frequentes detectadas"); scores.consistency = 10; }
  else if (videoCount >= 5) { positives.push("Consistência regular"); scores.consistency = 7; }
  else if (videoCount > 0) { negatives.push("Postagens esporádicas"); scores.consistency = 4; }
  else { negatives.push("Canal inativo ou sem conteúdo recente"); scores.consistency = 1; }

  // 3. Base Total (Tamanho)
  if (subs > 1000000) { positives.push("Canal com escala de milhões"); scores.growth = 10; }
  else if (subs > 100000) { positives.push("Autoridade consolidada (+100k)"); scores.growth = 8; }
  else if (subs > 10000) { scores.growth = 6; }
  else { scores.growth = 4; }

  // 4. Autoridade (Visualizações acumuladas)
  if (viewCount > 10000000) { positives.push("Autoridade histórica massiva"); scores.authority = 10; }
  else if (viewCount > 1000000) { positives.push("Boa base de visualizações"); scores.authority = 8; }
  else { scores.authority = 5; }

  const finalScore = Math.round((scores.engagement * 0.4 + scores.consistency * 0.2 + scores.growth * 0.2 + scores.authority * 0.2) * 10);

  return {
    positives,
    negatives,
    scores,
    totalScore: finalScore,
    growthEstimate: {
      daily: Math.round(subs * 0.0005) || 1,
      weekly: Math.round(subs * 0.0035) || 7,
      monthly: Math.round(subs * 0.015) || 30,
      yearly: Math.round(subs * 0.18) || 365
    }
  };
};

export async function POST(req: Request) {
  try {
    const { channelIdA, channelIdB } = await req.json();

    if (!channelIdA || !channelIdB) {
      return NextResponse.json({ error: "É necessário fornecer dois IDs de canal." }, { status: 400 });
    }

    async function getDetailsWithFallback(id: string) {
      try {
        const details = await getChannelDetails(id);
        if (details) return details;
        return await getChannelDetailsScraping(id);
      } catch (e) {
        return await getChannelDetailsScraping(id);
      }
    }

    async function getVideosWithFallback(id: string) {
      try {
        const videos = await getChannelVideos(id);
        if (videos && videos.length > 0) return videos;
        return await getChannelVideosRSS(id);
      } catch (e) {
        return await getChannelVideosRSS(id);
      }
    }

    const [detailsA, videosA, detailsB, videosB] = await Promise.all([
      getDetailsWithFallback(channelIdA),
      getVideosWithFallback(channelIdA),
      getDetailsWithFallback(channelIdB),
      getVideosWithFallback(channelIdB)
    ]);

    if (!detailsA || !detailsB) {
      return NextResponse.json({ error: "Um ou ambos os canais não foram encontrados." }, { status: 404 });
    }

    const analysisA = analyzeChannel(detailsA, videosA);
    const analysisB = analyzeChannel(detailsB, videosB);
    const winner = analysisA.totalScore >= analysisB.totalScore ? 'A' : 'B';

    const analysis = await generateComparisonAnalysis(
      { title: detailsA.title, subscribers: detailsA.subscriberCount, score: analysisA.totalScore },
      { title: detailsB.title, subscribers: detailsB.subscriberCount, score: analysisB.totalScore }
    );

    return NextResponse.json({
      canalA: { ...detailsA, score: analysisA.totalScore },
      canalB: { ...detailsB, score: analysisB.totalScore },
      analysisA,
      analysisB,
      winner,
      analysis
    });

  } catch (error: any) {
    console.error("Erro na Arena:", error);
    return NextResponse.json({ error: "Erro ao processar o duelo na Arena." }, { status: 500 });
  }
}
