import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "ID do vídeo é obrigatório." }, { status: 400 });

    // 1. Buscar metadados do vídeo do usuário
    const videoRes = await fetch(`${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const videoData = await videoRes.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
    }

    const video = videoData.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;

    // 2. IA Auditoria
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Você é um auditor sênior de SEO para YouTube (estilo vidIQ).
      AUDITE O SEGUINTE VÍDEO:
      Título: "${snippet.title}"
      Descrição: "${snippet.description}"
      Tags Atuais: "${snippet.tags ? snippet.tags.join(", ") : "Nenhuma"}"
      Visualizações: ${stats.viewCount}

      SUA TAREFA:
      1. Identificar 5 a 10 "Tags de Ouro" que faltam e que ajudariam este vídeo a viralizar no algoritmo.
      2. Reescrever a descrição (apenas o primeiro parágrafo) para ser mais persuasiva e cheia de palavras-chave.
      3. Dar uma nota de "SEO Viral" de 0 a 100.
      4. Dar uma justificativa curta por canal.

      RESPONDA APENAS EM JSON:
      {
        "seoScore": 85,
        "missingTags": ["tag1", "tag2", "tag3"],
        "optimizedDescription": "Nova descrição...",
        "justification": "Por que o vídeo precisa disso..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    const audit = JSON.parse(text);

    return NextResponse.json({
      video: {
        title: snippet.title,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
        stats: stats
      },
      audit
    });

  } catch (error: any) {
    console.error("Erro na auditoria:", error);
    return NextResponse.json({ error: "Falha ao auditar vídeo. Verifique o ID e tente novamente." }, { status: 500 });
  }
}
