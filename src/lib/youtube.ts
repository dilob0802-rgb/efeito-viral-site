const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

export interface YoutubeChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export interface YoutubeVideoInfo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export async function searchChannel(query: string): Promise<YoutubeChannelInfo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${API_KEY}`
  );

  const data = await response.json();
  if (!data.items) return [];

  const channelIds = data.items.map((item: any) => item.id.channelId).join(",");
  
  // Pegar estatísticas detalhadas
  const statsResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${API_KEY}`
  );
  
  const statsData = await statsResponse.json();
  
  return statsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    customUrl: item.snippet.customUrl,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    subscriberCount: item.statistics.subscriberCount,
    videoCount: item.statistics.videoCount,
    viewCount: item.statistics.viewCount,
  }));
}

export async function getChannelVideos(channelId: string): Promise<YoutubeVideoInfo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  // Pegar os vídeos mais populares ou recentes
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=10&order=viewCount&type=video&key=${API_KEY}`
  );

  const data = await response.json();
  if (!data.items) return [];

  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

  // Pegar estatísticas dos vídeos
  const statsResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`
  );

  const statsData = await statsResponse.json();

  return statsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));
}

export async function getChannelDetails(input: string): Promise<YoutubeChannelInfo | null> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  console.log("getChannelDetails chamado com:", input);
  
  let url = `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics`;
  
  // Se começar com @, busca por handle
  if (input.startsWith("@")) {
    url += `&forHandle=${input.substring(1)}`;
  } 
  // Se for um ID de canal (começa com UC)
  else if (/^UC[a-zA-Z0-9_-]{22}$/.test(input)) {
    url += `&id=${input}`;
  }
  // Se for um ID de vídeo (11 caracteres), busca o canal primeiro
  else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    // Busca o vídeo para obter o channelId
    const videoRes = await fetch(`${YOUTUBE_API_BASE_URL}/videos?part=snippet&id=${input}&key=${API_KEY}`);
    const videoData = await videoRes.json();
    if (videoData.items && videoData.items.length > 0) {
      const channelId = videoData.items[0].snippet.channelId;
      return getChannelDetails(channelId);
    }
    return null;
  }
  // Caso contrário, tenta buscar por nome (busca genérica)
  else {
    url = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(input)}&type=channel&maxResults=1&key=${API_KEY}`;
  }
  
  url += `&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("API Response:", data.error || "OK");
    
    if (!data.items || data.items.length === 0) {
      // Tenta uma busca genérica se não achou por ID/Handle
      const searchRes = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(input)}&type=channel&maxResults=1&key=${API_KEY}`);
      const searchData = await searchRes.json();
      if (searchData.items && searchData.items.length > 0) {
        return getChannelDetails(searchData.items[0].id.channelId);
      }
      return null;
    }

    const item = data.items[0];
    
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      subscriberCount: item.statistics?.subscriberCount || "0",
      videoCount: item.statistics?.videoCount || "0",
      viewCount: item.statistics?.viewCount || "0",
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error);
    return null;
  }
}

export async function getMostPopularVideos(): Promise<YoutubeVideoInfo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&maxResults=15&regionCode=BR&key=${API_KEY}`
  );

  const data = await response.json();
  if (!data.items) return [];

  return data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));
}

export async function searchVideos(query: string): Promise<YoutubeVideoInfo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&order=viewCount&maxResults=15&regionCode=BR&key=${API_KEY}`
  );

  const data = await response.json();
  if (!data.items) return [];

  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

  const statsResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`
  );

  const statsData = await statsResponse.json();
  if (!statsData.items) return [];

  return statsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));
}


export async function searchTopChannels(): Promise<YoutubeChannelInfo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  // YouTube API doesn't have a charting for channels, so we search generically and sort by views/relevance
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=channel&q=brasil&order=viewCount&maxResults=10&key=${API_KEY}`
  );

  const data = await response.json();
  if (!data.items) return [];

  const channelIds = data.items.map((item: any) => item.id.channelId).join(",");
  
  const statsResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${API_KEY}`
  );
  
  const statsData = await statsResponse.json();
  
  if (!statsData.items) return [];

  return statsData.items
    .sort((a: any, b: any) => parseInt(b.statistics.subscriberCount || "0") - parseInt(a.statistics.subscriberCount || "0"))
    .map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    customUrl: item.snippet.customUrl,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    subscriberCount: item.statistics.subscriberCount,
    videoCount: item.statistics.videoCount,
    viewCount: item.statistics.viewCount,
  }));
}

export async function getMyChannel(accessToken: string): Promise<YoutubeChannelInfo | null> {
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&mine=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  if (!data.items || data.items.length === 0) return null;

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    customUrl: item.snippet.customUrl,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    subscriberCount: item.statistics.subscriberCount,
    videoCount: item.statistics.videoCount,
    viewCount: item.statistics.viewCount,
  };
}

export async function getMyVideos(accessToken: string): Promise<YoutubeVideoInfo[]> {
    // 1. Pegar o ID da playlist de 'uploads' do canal autenticado
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&mine=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const channelData = await channelResponse.json();
    
    if (channelData.error) {
       const error = new Error(channelData.error.message || "Erro na API do YouTube");
       (error as any).status = channelData.error.code;
       throw error;
    }

    if (!channelData.items || channelData.items.length === 0) return [];

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Buscar itens dessa playlist
    const playlistResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`,
      {
         headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const playlistData = await playlistResponse.json();
    if (!playlistData.items) return [];

    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(",");

    // 3. Pegar estatísticas detalhadas e durações
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const statsData = await statsResponse.json();
    if (!statsData.items) return [];
    return statsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount,
      duration: item.contentDetails.duration,
    }));
}

export async function getChannelVideosRSS(channelId: string): Promise<YoutubeVideoInfo[]> {
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const xml = await response.text();
    
    // Parser simples via Regex
    const entries = xml.split('<entry>');
    entries.shift(); // Remove o header do XML
    
    return entries.slice(0, 15).map(entry => {
      const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || "";
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1] || "";
      const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      
      return {
        id: videoId,
        title: title,
        publishedAt: publishedAt,
        thumbnail: thumbnail,
        viewCount: "0",
        likeCount: "0",
        commentCount: "0"
      };
    }).filter(v => v.id !== "");
  } catch (error) {
    console.error("Erro ao buscar RSS:", error);
    return [];
  }
}

export async function getChannelDetailsScraping(input: string): Promise<YoutubeChannelInfo | null> {
  try {
    let url = "";
    if (input.startsWith("@")) url = `https://www.youtube.com/${input}/about`;
    else if (input.startsWith("UC")) url = `https://www.youtube.com/channel/${input}/about`;
    else url = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Extração básica via Regex dos metadados injetados pelo YouTube (ytInitialData)
    const subMatch = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"(.*?)"\}\}/);
    const viewMatch = html.match(/"viewCountText":\{"simpleText":"(.*?)"\}/);
    const titleMatch = html.match(/"title":\{"simpleText":"(.*?)"\}/);
    const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(.*?)",/);

    const cleanSubs = subMatch ? subMatch[1].replace(/[^0-9KMB,.]/g, '') : "0";
    const cleanViews = viewMatch ? viewMatch[1].replace(/[^0-9]/g, '') : "0";

    if (!titleMatch && !subMatch) return null;

    return {
      id: input,
      title: titleMatch ? titleMatch[1] : input,
      description: "",
      customUrl: input,
      thumbnail: avatarMatch ? avatarMatch[1] : "",
      subscriberCount: cleanSubs,
      videoCount: "0",
      viewCount: cleanViews
    };
  } catch (error) {
    console.error("Erro no scraping de detalhes:", error);
    return null;
  }
}



