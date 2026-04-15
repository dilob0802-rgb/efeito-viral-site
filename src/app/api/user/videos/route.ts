import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getMyVideos } from "@/lib/youtube";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { googleAccessToken: true }
    });

    if (!user || !user.googleAccessToken) {
      return NextResponse.json({ 
        error: "Canal não conectado. Por favor, faça login com o Google para ver seus vídeos.",
        needsAuth: true 
      }, { status: 404 });
    }

    try {
      const videos = await getMyVideos(user.googleAccessToken);
      
      if (videos.length === 0) {
        // Log para debug interno (pode ser visto no terminal do servidor)
        console.log("YouTube API retornou 0 vídeos para o token fornecido.");
      }

      // Formatar a duração e adicionar scores mockados por enquanto
      const formattedVideos = videos.map(v => {
        // Converte PT1M30S para segundos para detectar shorts (< 60s)
        const durationStr = v.duration || "";
        let totalSeconds = 0;
        const hoursMatch = durationStr.match(/(\d+)H/);
        const minutesMatch = durationStr.match(/(\d+)M/);
        const secondsMatch = durationStr.match(/(\d+)S/);

        if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
        if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
        if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);

        const isShort = totalSeconds <= 60 && !hoursMatch;
        
        // Formata para exibição (ex: 1:30)
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
