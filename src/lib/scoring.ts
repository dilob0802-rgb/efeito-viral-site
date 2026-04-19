const EMOTIONAL_TRIGGERS = [
  // Curiosidade & Tensão
  'revelado', 'segredo', 'misterioso', 'finalmente', 'descobri', 'estranho',
  // Medo & Evitar Dor
  'perigo', 'erro', 'pare', 'nunca', 'farsa', 'cuidado', 'mentira', 'urgente',
  // Conflito & Drama
  'confronto', 'briga', 'treta', 'expulso', 'fim', 'traição', 'choque',
  // Nostalgia & Humos
  'antigamente', 'época', 'quem lembra', 'hilário', 'surpreendente'
];

/**
 * Gera um hash numérico simples a partir de uma string.
 */
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
}

export function calculateVideoScores(title: string, videoId: string) {
  const t = title.toLowerCase();
  const words = title.trim().split(/\s+/);
  const hash = getDeterministicHash(videoId);

  // --- SCORE DO TÍTULO (MÉTODO EFEITO VIRAL - ATUALIZADO) ---
  let titleScore = 60; // Base inicial um pouco mais alta

  // 1. Regra de Ouro: Tamanho (5 a 8 palavras ideal)
  if (words.length >= 5 && words.length <= 8) titleScore += 25;
  else if (words.length > 10) titleScore -= 15;
  else if (words.length < 4) titleScore -= 10;

  // 2. Penalidade por Números (Público prefere emoção, não listas)
  if (/\d+/.test(title)) titleScore -= 12;

  // 3. Gatilhos Emocionais (Foco em Tensão e Curiosidade)
  let emotionalImpact = 0;
  EMOTIONAL_TRIGGERS.forEach(word => {
    if (t.includes(word)) emotionalImpact += 5;
  });
  titleScore += Math.min(emotionalImpact, 20);

  // 4. Formato de Caracteres (~30-35 caracteres ideal)
  if (title.length >= 25 && title.length <= 40) titleScore += 5;

  titleScore = Math.min(Math.max(titleScore, 10), 99);

  // --- SCORE DA MINIATURA (SIMULADO BASEADO EM REGRAS DE DESIGN) ---
  // A nota da thumb é calculada para incentivar a falta de texto e o uso de rostos.
  let thumbScore = 50 + (hash % 40);

  // Se o título é muito curto e impactante, sugerimos que a thumb está "limpa"
  if (titleScore > 85) thumbScore += 10;
  
  // Penalidade simulada se o título for explicativo demais (sugere carga cognitiva alta)
  if (title.length > 60) thumbScore -= 10;

  thumbScore = Math.min(Math.max(thumbScore, 20), 97);

  // --- SCORE DE CONTEÚDO ---
  const contentScore = 70 + (hash % 25);

  return {
    titleScore,
    thumbScore,
    contentScore
  };
}
