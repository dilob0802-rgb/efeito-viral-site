import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "ID do video e obrigatorio." }, { status: 400 });

    // 1. Buscar metadados do video do usuario
    const videoRes = await fetch(`${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const videoData = await videoRes.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video nao encontrado." }, { status: 404 });
    }

    const video = videoData.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;

    // 2. IA Auditoria
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analise este video do YouTube como um estrategista especialista em viralizacao (estilo SrBeast/Vidiq).
Titulo Atual: "${snippet.title}"
Descricao Atual: "${snippet.description}"
Visualizacoes: ${stats.viewCount}

Retorne um JSON estritamente com esta estrutura:
{
  "titleScore": 0-100,
  "thumbScore": 0-100,
  "justificativaTitulo": "Analise tecnica curta do titulo atual",
  "justificativaMiniatura": "Analise estrategica tecnica da thumbnail atual baseada no contexto do titulo",
  "pontosPositivos": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "pontosNegativos": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "sugestoesTitulos": [
    {"titulo": "Opcao Viral 1", "score": 98},
    {"titulo": "Opcao Viral 2", "score": 95},
    {"titulo": "Opcao Viral 3", "score": 92}
  ],
  "tagsSugeridas": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12"]
}
Seja critico e focado em retencao e CTR. Responda APENAS o JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    console.log("Auditoria gerada com sucesso para:", snippet.title);
    const audit = JSON.parse(text);

    return NextResponse.json({
      video: {
        title: snippet.title,
        thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
        stats: stats
      },
      audit
    });

  } catch (error: any) {
    console.error("Erro na auditoria:", error);
    return NextResponse.json({ error: "Falha ao auditar video. Verifique o ID e tente novamente." }, { status: 500 });
  }
}