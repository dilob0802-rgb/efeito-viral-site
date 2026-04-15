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
  const engagement = subs > 0 ? (avgViews / subs) * 100 : 0;
  
  const dailyEstimate = Math.round(subs * 0.001) || 1;
  
  const positives: string[] = [];
  const negatives: string[] = [];
  const scores: any = { engagement: 5, consistency: 5, growth: 5, authority: 5 };

  if (engagement > 10) { positives.push("Excelente taxa de engajamento"); scores.engagement = 10; }
  else if (engagement > 5) { positives.push("Bom engajamento"); scores.engagement = 7; }
  else { negatives.push("Engajamento abaixo da média"); scores.engagement = 4; }

  if (videoCount > 5) { positives.push("Alta frequência recente"); scores.consistency = 10; }
  else { negatives.push("Frequência moderada"); scores.consistency = 6; }

  if (subs > 100000) { positives.push("Grande base de inscritos"); scores.growth = 10; }
  else { scores.growth = 7; }

  return {
    positives,
    negatives,
    scores,
    totalScore: Math.round((scores.engagement + scores.consistency + scores.growth + scores.authority) / 4 * 10),
    growthEstimate: {
      daily: dailyEstimate,
      weekly: dailyEstimate * 7,
      monthly: dailyEstimate * 30,
      yearly: dailyEstimate * 365
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
