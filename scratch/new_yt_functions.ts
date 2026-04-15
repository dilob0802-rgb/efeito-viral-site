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
    thumbnails: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || "",
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));
}
