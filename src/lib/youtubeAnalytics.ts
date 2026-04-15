import prisma from "./prisma";

const YOUTUBE_ANALYTICS_API_URL = "https://youtubeanalytics.googleapis.com/v2/reports";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function refreshAccessToken(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { googleRefreshToken: true }
  });

  if (!user?.googleRefreshToken) {
    throw new Error("Usuário não tem refresh token.");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: user.googleRefreshToken,
      grant_type: "refresh_token"
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "Erro ao renovar token.");
  }

  await prisma.user.update({
    where: { email },
    data: { googleAccessToken: data.access_token }
  });

  return data.access_token;
}

async function getValidAccessToken(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { googleAccessToken: true, googleRefreshToken: true }
  });

  if (!user?.googleAccessToken) {
    throw new Error("Usuário não tem token do Google.");
  }

  return user.googleAccessToken;
}

export async function getYouTubeAnalytics(email: string, startDate: string, endDate: string) {
  let accessToken = await getValidAccessToken(email);

  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost",
    dimensions: "day"
  });

  let response = await fetch(`${YOUTUBE_ANALYTICS_API_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  let data = await response.json();

  if (data.error) {
    console.error("Erro na YouTube Analytics API:", data.error);
    
    if (data.error.code === 401) {
      console.log("Token expirado. Tentando renovar...");
      accessToken = await refreshAccessToken(email);
      
      response = await fetch(`${YOUTUBE_ANALYTICS_API_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      data = await response.json();
      
      if (data.error) {
        console.error("Erro após renovar token:", data.error);
        throw new Error(data.error.message || "Erro ao buscar dados do YouTube Analytics.");
      }
    } else {
      throw new Error(data.error.message || "Erro ao buscar dados do YouTube Analytics.");
    }
  }

  return data;
}

// Busca dados em tempo real (aproximadamente últimas 48h via Data API)
export async function getRealtimeStats(email: string) {
    let accessToken = await getValidAccessToken(email);
    
    const user = await prisma.user.findUnique({
        where: { email },
        select: { youtubeChannelId: true }
    });

    if (!accessToken || !user?.youtubeChannelId) {
        return null;
    }

    // A Data API fornece estatísticas cumulativas atuais
    let response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${user.youtubeChannelId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    let data = await response.json();

    if (data.error) {
        console.error("Erro na YouTube Data API:", data.error);
        
        if (data.error.code === 401) {
            console.log("Token expirado. Tentando renovar...");
            accessToken = await refreshAccessToken(email);
            
            response = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${user.youtubeChannelId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            
            data = await response.json();
        }
    }

    return data.items?.[0]?.statistics || null;
}
