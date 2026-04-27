/**
 * safe-call.ts
 * Utilitários para proteger a aplicação contra bloqueios de API e Rate Limiting.
 */

/**
 * Aguarda um tempo determinado em milisegundos.
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Adiciona um atraso aleatório (jitter) para simular comportamento humano.
 * @param min Tempo mínimo em ms (padrão 500)
 * @param max Tempo máximo em ms (padrão 1500)
 */
export const safeDelay = async (min = 500, max = 1500) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await sleep(delay);
};

/**
 * Adiciona uma variação aleatória a um número de base.
 */
export const withJitter = (base: number, percent = 0.2) => {
  const variation = base * percent;
  return base + (Math.random() * variation * 2 - variation);
};
