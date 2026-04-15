/**
 * Algoritmo determinístico de pontuação para vídeos do YouTube.
 * Garante que o mesmo vídeo sempre receba a mesma nota.
 */

const IMPACT_WORDS = [
  'viral', 'estratégia', 'segredo', 'revelado', 'como', 'fazer', 
  'passo a passo', 'dinheiro', 'crescer', 'rápido', 'guia', 
  'erro', 'nunca', 'sempre', 'hoje', '2026', 'atualizado'
];

/**
 * Gera um hash numérico simples a partir de uma string.
 */
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Converte para inteiro de 32 bits
  }
  return Math.abs(hash);
}

export function calculateVideoScores(title: string, videoId: string) {
  const t = title.toLowerCase();
  const hash = getDeterministicHash(videoId);

  // --- SCORE DO TÍTULO (LÓGICA REAL) ---
  let titleScore = 50; // Base média

  // Comprimento ideal (Next-Gen SEO)
  if (title.length >= 40 && title.length <= 70) titleScore += 20;
  else if (title.length < 20 || title.length > 90) titleScore -= 15;

  // Pontuação por Curiosidade
  if (t.includes('?')) titleScore += 10;
  if (t.includes('!')) titleScore += 5;

  // Pontuação por Números
  if (/\d+/.test(title)) titleScore += 10;

  // Palavras de Impacto
  IMPACT_WORDS.forEach(word => {
    if (t.includes(word)) titleScore += 2;
  });

  // Limites
  titleScore = Math.min(Math.max(titleScore, 15), 98);

  // --- SCORE DA MINIATURA (ESTÁVEL POR HASH) ---
  // Como não analisamos a imagem real, usamos o hash para ser estável.
  // Criamos uma "assinatura" do vídeo.
  let thumbScore = 40 + (hash % 50); // Variabilidade entre 40 e 90
  
  // Se o título é forte, geralmente o canal investe na thumb (correlação simulada)
  if (titleScore > 80) thumbScore += 5;
  thumbScore = Math.min(Math.max(thumbScore, 20), 96);

  // --- SCORE DE CONTEÚDO (ESTÁVEL) ---
  const contentScore = 75 + (hash % 20); // Entre 75 e 95

  return {
    titleScore,
    thumbScore,
    contentScore
  };
}
