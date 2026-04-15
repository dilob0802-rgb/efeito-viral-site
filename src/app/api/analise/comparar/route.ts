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

const analyzeChannel = (details: any, videos: any[]) => {
  const subs = parseInt(details.subscriberCount);
  const viewCount = parseInt(details.viewCount);
  const videoCount = parseInt(details.videoCount);
  const totalViews = videos.reduce((sum, v) => sum + parseInt(v.viewCount || 0), 0);
  const avgViews = videoCount > 0 ? totalViews / videoCount : 0;
  const engagement = subs > 0 ? (avgViews / subs) * 100 : 0;
  const uploadFreq = videoCount || 0;
  
  // Estimar crescimento baseado em engajamento e frequência de upload
  // Usamos uma taxa estimada: quanto maior o engajamento e mais uploads, maior o crescimento
  const engagementFactor = Math.min(engagement / 10, 1); // 0-1 baseado em engajamento
  const uploadFactor = Math.min(uploadFreq / 5, 1); // 0-1 baseado em frequência
  const baseGrowthRate = (engagementFactor * 0.7 + uploadFactor * 0.3); 
  
  // Estimar crescimento diário baseado no tamanho do canal e fatores
  const dailyEstimate = Math.round(subs * (baseGrowthRate * 0.001)); // Exemplo: 0.1% do total por dia
  const weeklyEstimate = dailyEstimate * 7;
  const monthlyEstimate = dailyEstimate * 30;
  const yearlyEstimate = dailyEstimate * 365;
  
  // Ajustar paraChannels pequenos (mínimo de 1)
  const finalDaily = Math.max(dailyEstimate, subs > 0 ? 1 : 0);
  const finalWeekly = Math.max(weeklyEstimate, subs > 0 ? 7 : 0);
  const finalMonthly = Math.max(monthlyEstimate, subs > 0 ? 30 : 0);
  const finalYearly = Math.max(yearlyEstimate, subs > 0 ? 365 : 0);
  
  const positives: string[] = [];
  const negatives: string[] = [];
  const scores: any = {
    engagement: 0,
    consistency: 0,
    growth: 0,
    authority: 0
  };

  // Engagement
  if (engagement > 10) { positives.push("Excelente taxa de engajamento"); scores.engagement = 10; }
  else if (engagement > 5) { positives.push("Bom engajamento"); scores.engagement = 7; }
  else if (engagement > 2) { negatives.push("Engajamento abaixo da média"); scores.engagement = 4; }
  else { negatives.push("Engajamento baixo"); scores.engagement = 1; }

  // Consistency
  if (uploadFreq > 5) { positives.push("Alta frequência de postagem"); scores.consistency = 10; }
  else if (uploadFreq > 2) { positives.push("Postagem consistente"); scores.consistency = 7; }
  else if (uploadFreq > 0) { negatives.push("Baixa frequência de postagem"); scores.consistency = 4; }
  else { negatives.push("Inativo"); scores.consistency = 1; }

  // Growth - baseado no tamanho total (base de inscritos)
  if (subs > 100000) { positives.push("Grande base de inscritos"); scores.growth = 10; }
  else if (subs > 10000) { positives.push("Bom crescimento"); scores.growth = 7; }
  else if (subs > 1000) { positives.push("Crescimento em progresso"); scores.growth = 5; }
  else { negatives.push("Poucos inscritos"); scores.growth = 3; }

  // Authority
  if (avgViews > 100000) { positives.push("Alta média de visualizações"); scores.authority = 10; }
  else if (avgViews > 10000) { positives.push("Boas visualizações por vídeo"); scores.authority = 7; }
  else if (avgViews > 1000) { positives.push("Visualizações moderadas"); scores.authority = 5; }
  else { negatives.push("Baixa média de visualizações"); scores.authority = 2; }

  return {
    positives,
    negatives,
    scores,
    totalScore: Math.round((scores.engagement + scores.consistency + scores.growth + scores.authority) / 4 * 10),
    growthEstimate: {
      daily: finalDaily,
      weekly: finalWeekly,
      monthly: finalMonthly,
      yearly: finalYearly
    }
  };
};

export async function POST(req: Request) {
  try {
    const { channelIdA, channelIdB } = await req.json();

    if (!channelIdA || !channelIdB) {
      return NextResponse.json({ error: "É necessário fornecer dois IDs de canal." }, { status: 400 });
    }

    // Buscar dados de ambos simultaneamente
    console.log("=== DEBUG COMPARAR ===");
    console.log("Input A:", channelIdA);
    console.log("Input B:", channelIdB);
    
    try {
      const detailsA = await getChannelDetails(channelIdA);
      console.log("detailsA:", detailsA);
    } catch (e: any) {
      console.log("Erro detailsA:", e.message);
    }
    
    try {
      const detailsB = await getChannelDetails(channelIdB);
      console.log("detailsB:", detailsB);
    } catch (e: any) {
      console.log("Erro detailsB:", e.message);
    }
    
    const [detailsA, videosA, detailsB, videosB] = await Promise.all([
      getChannelDetails(channelIdA),
      getChannelVideos(channelIdA),
      getChannelDetails(channelIdB),
      getChannelVideos(channelIdB)
    ]);
    console.log("Resultado busca A:", detailsA ? "encontrado" : "null");
    console.log("Resultado busca B:", detailsB ? "encontrado" : "null");

    if (!detailsA || !detailsB) {
      return NextResponse.json({ error: "Um ou ambos os canais não foram encontrados." }, { status: 404 });
    }

    // Análise detalhada
    const analysisA = analyzeChannel(detailsA, videosA);
    const analysisB = analyzeChannel(detailsB, videosB);

    // Determinar vencedor
    const winner = analysisA.totalScore >= analysisB.totalScore ? 'A' : 'B';
    
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
