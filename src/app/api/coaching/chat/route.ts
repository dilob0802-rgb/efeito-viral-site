import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function POST(req: Request) {
  try {
    const { message, history, userProfile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key não configurada" }, { status: 500 });
    }

    const { niche, mainGoal, painPoints } = userProfile || {};

    // Prompt de Sistema com Contexto do Usuário
    const systemPrompt = `
      Você é um Mentor de Elite de YouTube chamado "Mentor Viral". 
      Sua personalidade é encorajadora, direta, tática e focada em resultados reais.
      
      CONTEXTO DO ALUNO:
      - Nicho: ${niche || "Não definido"}
      - Principais Objetivos: ${mainGoal || "Crescer no YouTube"}
      - Maiores Dificuldades: ${painPoints || "Ainda em fase inicial"}
      
      DIRETRIZES:
      1. Suas respostas devem ser baseadas no nicho e nos objetivos acima.
      2. Seja tático. Se o aluno pedir uma ideia, dê uma ideia pronta para viralizar.
      3. Nunca seja genérico. Use jargões de YouTube (Retenção, CTR, AVD, Gancho).
      4. Se o aluno estiver desanimado com o desafio (${painPoints || "inicial"}), dê uma solução prática imediata.
      5. Formate o texto de forma limpa, usando parágrafos curtos.
    `;

    // Formatar histórico para texto e enviar um prompt sólido que nunca falha na API
    let historyText = "";
    if (Array.isArray(history) && history.length > 0) {
      historyText = "\n--- HISTÓRICO DA CONVERSA ---\n" + 
        history.map((m: any) => `${m.role === 'user' ? 'Aluno' : 'Mentor'}: ${m.content}`).join("\n") +
        "\n---------------------------\n";
    }

    const finalPrompt = `
      ${systemPrompt}
      ${historyText}
      
      AGORA RESPONDA COMO MENTOR:
      Aluno: ${message}
      Mentor:
    `;

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("❌ ERRO CRÍTICO NO MENTOR:", error);
    
    // Se for erro de cota (429), avisar o usuário de forma amigável
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return NextResponse.json({ 
        reply: "Opa! Recebi muitas perguntas agora. Como sou um Mentor de Elite, o Google limita meu tempo de resposta no plano gratuito. Poderia aguardar 60 segundos e me perguntar de novo? Estou ansioso para te ajudar!" 
      });
    }

    return NextResponse.json({ error: "Falha ao processar mensagem do Mentor IA." }, { status: 500 });
  }
}
