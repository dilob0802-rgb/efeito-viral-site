import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface AnalysisInput {
  channelTitle: string;
  videos: any[];
}

export interface AnalysisResult {
  markdown: string;
  pillars: {
    engajamento: number;
    seo: number;
    retencao: number;
    consistencia: number;
  };
  pros: string[];
  cons: string[];
}

export async function generateViralAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const videoContext = input.videos
    .slice(0, 5)
    .map(v => `- Título: ${v.title} | Views: ${parseInt(v.viewCount).toLocaleString('pt-BR')}`)
    .join("\n");

  const prompt = `
    Você é o "Mentor IA" do programa Efeito Viral. Sua especialidade é engenharia reversa de vídeos virais e criação de roteiros de alta retenção.

    ANALISE O CANAL: ${input.channelTitle}
    DADOS DOS VÍDEOS MAIS POPULARES:
    ${videoContext}

    SUA TAREFA:
    Forneça uma análise estratégica completa. 
    
    A resposta DEVE ser um JSON estrito seguindo este formato:
    {
      "markdown": "Seu relatório completo em Markdown contendo: 1. O que domina, 2. Onde falha, 3. Padrão de ouro, 4. Ganhos de retenção, 5. Estrutura do roteiro, 6. Dica mestre.",
      "pillars": {
        "engajamento": 85,
        "seo": 70,
        "retencao": 60,
        "consistencia": 90
      },
      "pros": ["Título curto e direto", "Uso de cores vibrantes", "Início impactante"],
      "cons": ["Descrições ignoradas", "Frequência inconstante", "Falta de CTA claro"]
    }

    PONTUAÇÃO DOS PILARES (0-100):
    - Engajamento: Relação entre views e inscritos.
    - SEO: Qualidade dos títulos e tags.
    - Retenção: Potencial de manter o público baseado no estilo dos títulos e ganchos.
    - Consistência: Baseado no volume de views dos vídeos populares.

    Mantenha um tom encorajador, estratégico e premium. Use negrito no markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro no Gemini:", error);
    throw new Error("Falha ao gerar análise estruturada com IA.");
  }
}

export async function generateComparisonAnalysis(canalA: any, canalB: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    Você é o juiz da "Arena de Concorrentes" do programa Efeito Viral.
    Sua missão é dar o veredito final entre dois canais do YouTube com base em suas métricas.

    CANAL A: ${canalA.title} (${canalA.subscribers} inscritos, Score: ${canalA.score}/100)
    CANAL B: ${canalB.title} (${canalB.subscribers} inscritos, Score: ${canalB.score}/100)

    SUA TAREFA:
    Analise os números e gere um veredito estratégico em Markdown com estas seções:

    1. 🏆 VEREDITO DO LÍDER
       Quem está vencendo em termos de ESTRATÉGIA VIRAL hoje? (Não necessariamente quem tem mais inscritos, mas quem é mais eficiente). Explique o porquê.

    2. 💪 O SUPERPODER DE CADA UM
       Destaque uma qualidade matadora do Canal A e uma do Canal B.

    3. 🗡️ A BRECHA (Como vencer o líder)
       Aponte uma falha ou ponto cego do canal que está na frente que o usuário pode explorar para superá-lo.

    4. 🧠 ESTRATÉGIA DE ROUBO (Copy and Improve)
       Qual técnica o Canal B deveria "roubar" do Canal A (ou vice-versa) agora mesmo?

    Mantenha um tom ácido, competitivo e altamente estratégico. Use negrito.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro na Arena IA:", error);
    throw new Error("A Arena IA não pôde decidir o vencedor.");
  }
}
