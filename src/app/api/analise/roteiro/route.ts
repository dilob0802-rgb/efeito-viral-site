import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { title, nicho } = await req.json();
    
    // Modificado para a versão mais recente e sólida do modelo
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Você é um estrategista e roteirista sênior de YouTube.
      Com base no seguinte nicho: "${nicho}"
      E neste título de vídeo altamente viral: "${title}"
      
      Escreva um roteiro COMPLETO e direto ao ponto para um vídeo do YouTube. O roteiro deve incluir:
      
      # 🎣 HOOK (0 - 10s)
      O gancho visual e falado para reter a atenção absurdo nos primeiros 5-10 segundos.
      
      # 🎬 INTRODUÇÃO (10s - 30s)
      Qual a grande promessa do vídeo e por que a pessoa deve continuar assistindo?
      
      # 📚 DESENVOLVIMENTO
      Divida em 3 passos ou segredos práticos. Para cada um, descreva rapidamente:
      - **Visual:** O que mostrar na tela (B-roll, zoom, texto animado, etc).
      - **Áudio:** O que você deve falar (use script persuasivo e objetivo).
      
      # 🚀 CTA E FECHAMENTO
      Pedido de engajamento natural e como jogar a pessoa para o próximo vídeo sugerido na tela final.

      Retorne APENAS o roteiro formatado em Markdown limpo (sem tags de código "markdown" em volta).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ script: text });

  } catch (error: any) {
    console.error("Erro ao gerar roteiro:", error);
    return NextResponse.json({ error: error.message || "Falha ao gerar o roteiro. O Gemini pode estar indisponível." }, { status: 500 });
  }
}
