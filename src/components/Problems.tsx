import { TrendingDown, Brain, Users } from 'lucide-react';
import styles from './Problems.module.css';

const problems = [
  {
    icon: <TrendingDown size={32} />,
    title: "Views Estagnadas",
    description: "Você posta com consistência, mas seus vídeos não passam daquela mesma média frustrante de visualizações. O algoritmo parece ignorar o seu conteúdo.",
  },
  {
    icon: <Brain size={32} />,
    title: "Bloqueio Criativo",
    description: "Passar horas olhando para uma tela em branco sem saber o que gravar. Quando grava, sente que é mais do mesmo e não prende a atenção.",
  },
  {
    icon: <Users size={32} />,
    title: "Seguidores Vazios",
    description: "Mesmo quando um vídeo vai bem, ele atrai o público errado. Pessoas curiosas, mas que não compram e não engajam com seu negócio de verdade.",
  }
];

export default function Problems() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Identifica algum <span>destes cenários?</span>
        </h2>
        <p className={styles.subtitle}>
          A culpa não é sua. As regras do jogo mudaram, e as dancinhas e dicas rasas não sustentam mais o crescimento de negócios sérios.
        </p>
      </div>

      <div className={styles.grid}>
        {problems.map((prob, idx) => (
          <div key={idx} className="glass-card">
            <div className={styles.icon}>{prob.icon}</div>
            <h3 className={styles.cardTitle}>{prob.title}</h3>
            <p className={styles.cardText}>{prob.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
