const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

export interface YoutubeChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnails: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export interface YoutubeVideoInfo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails: string;
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
    thumbnails: item.snippet.thumbnails.default.url,
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
    thumbnails: item.snippet.thumbnails.high.url,
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));
}

export async function getChannelDetails(input: string): Promise<YoutubeChannelInfo | null> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  let url = `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics`;
  
  // Se começar com @, busca por handle
  if (input.startsWith("@")) {
    url += `&forHandle=${input.substring(1)}`;
  } else {
    url += `&id=${input}`;
  }
  
  url += `&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
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
      thumbnails: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      subscriberCount: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount,
      viewCount: item.statistics.viewCount,
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error);
    return null;
  }
}

