import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { nicho } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Você é um estrategista sênior de YouTube especializado em viralização.
      SUA TAREFA: Gerar 3 ideias de vídeos altamente virais para o nicho: "${nicho || "Curiosidades e Entretenimento"}".

      Para cada ideia, você deve fornecer:
      1. Título Chamativo (focado em alto CTR).
      2. Predição de Sucesso (Apenas um destes valores: "VERY HIGH", "HIGH", "MEDIUM").
      3. Por que vai funcionar? (Uma frase curta explicando o gatilho mental usado).

      Sua resposta deve ser estritamente em formato JSON seguindo este exemplo:
      [
        {
          "title": "O segredo que o YouTube não quer que você saiba",
          "prediction": "VERY HIGH",
          "why": "Usa gatilho de segredos escondidos e curiosidade extrema."
        }
      ]
      
      Gere 3 ideias variadas e disruptivas.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpar o texto para garantir que seja um JSON válido (removendo markdown se houver)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const ideas = JSON.parse(jsonString);

    return NextResponse.json({ ideas });

  } catch (error: any) {
    console.error("Erro ao gerar ideias:", error);
    return NextResponse.json({ error: "O motor de criatividade falhou ao gerar ideias. Tente novamente." }, { status: 500 });
  }
}
