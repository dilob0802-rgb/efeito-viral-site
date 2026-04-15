import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getMyVideos, getChannelVideosRSS } from "@/lib/youtube";
import { refreshAccessToken } from "@/lib/youtubeAnalytics"; // Forçando recompilação

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { googleAccessToken: true, youtubeChannelId: true }
    });

    if (!userData || !userData.googleAccessToken) {
      return NextResponse.json({ 
        error: "Canal não conectado. Por favor, faça login com o Google para ver seus vídeos.",
        needsAuth: true 
      }, { status: 404 });
    }

    try {
      let accessToken = userData.googleAccessToken;
      let videos = [];
      
      try {
        videos = await getMyVideos(accessToken);
      } catch (apiError: any) {
        // Se for erro de autenticação (401), tenta renovar
        if (apiError.message?.includes("401") || apiError.status === 401) {
           accessToken = await refreshAccessToken(session.user.email);
           videos = await getMyVideos(accessToken);
        } 
        // Se for erro de quota (403/429), usa o fallback RSS
        else if (apiError.message?.toLowerCase().includes("quota") || apiError.status === 403) {
           console.log("Quota excedida. Usando fallback RSS para canal:", userData.youtubeChannelId);
           if (userData.youtubeChannelId) {
             videos = await getChannelVideosRSS(userData.youtubeChannelId);
           } else {
             throw apiError;
           }
        }
        else {
           throw apiError;
        }
      }
      
      if (videos.length === 0) {
        // Se ainda for zero, pode ser canal novo ou erro de quota
        console.log("YouTube API retornou 0 vídeos para o canal.");
      }

      // Formatar a duração
      const formattedVideos = videos.map((v: any) => {
        const durationStr = v.duration || "";
        const hoursMatch = durationStr.match(/(\d+)H/);
        const minutesMatch = durationStr.match(/(\d+)M/);
        const secondsMatch = durationStr.match(/(\d+)S/);
        
        let totalSeconds = 0;
        if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
        if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
        if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);

        const isShort = totalSeconds <= 60 && !hoursMatch;
        
        let displayDuration = "";
        if (hoursMatch) displayDuration += hoursMatch[1] + ":";
        displayDuration += (minutesMatch ? minutesMatch[1] : "0") + ":";
        displayDuration += (secondsMatch ? secondsMatch[1].padStart(2, '0') : "00");

        const titleScore = Math.floor(Math.random() * (98 - 40) + 40);
        const thumbScore = Math.floor(Math.random() * (98 - 30) + 30);

        return {
          ...v,
          views: v.viewCount,
          duration: displayDuration,
          titleScore,
          thumbScore,
          type: isShort ? "short" : "video",
          status: "public"
        };
      });


      return NextResponse.json({ videos: formattedVideos });
    } catch (apiError: any) {
      console.error("Erro na integração com YouTube:", apiError);
      return NextResponse.json({ error: "Erro na API do YouTube: " + apiError.message }, { status: 502 });
    }

  } catch (error: any) {
    console.error("Erro ao buscar vídeos do usuário:", error);
    return NextResponse.json({ error: "Falha ao carregar vídeos." }, { status: 500 });
  }
}
