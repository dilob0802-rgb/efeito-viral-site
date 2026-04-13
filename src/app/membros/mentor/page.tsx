import Link from "next/link";
import styles from "./mentor.module.css";

export default function MentorPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mentor de Crescimento IA 🧠</h1>
        <p className={styles.subtitle}>
          O cérebro do Efeito Viral pronto para transformar dados em visualizações.
        </p>
      </header>

      <div className={styles.grid}>
        <div className={`glass-card ${styles.mainCard}`}>
          <div className={styles.cardIcon}>⚡</div>
          <h2 className={styles.cardTitle}>Como ativar seu Mentor?</h2>
          <p className={styles.cardText}>
            A inteligência do Gemini precisa de <strong>referências reais</strong> para criar seus roteiros. 
            Ele analisa o que já deu certo para seus concorrentes e adapta para o seu nicho.
          </p>
          
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <span>Vá em <strong>Busca Viral</strong> e pesquise um concorrente.</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <span>Entre no <strong>Raio-X</strong> do canal escolhido.</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span>Clique no botão azul <strong>"Gerar Roteiro Estratégico"</strong>.</span>
            </div>
          </div>

          <Link href="/membros/analise" className="btn-primary" style={{marginTop: '32px', display: 'inline-block', width: 'auto', padding: '12px 40px'}}>
            Iniciar Nova Análise Agora
          </Link>
        </div>

        <div className={styles.statsContainer}>
          <div className={`glass-card ${styles.statCard}`}>
            <h4>Insights Gerados</h4>
            <span className={styles.statValue}>0</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <h4>Canais Analisados</h4>
            <span className={styles.statValue}>0</span>
          </div>
        </div>
      </div>

      <section className={styles.features}>
        <div className={styles.featureItem}>
          <span className={styles.featureIcon}>🪝</span>
          <div>
            <h4>Ganchos de Alta Retenção</h4>
            <p>O Gemini cria os 3 segundos iniciais baseados nos vídeos mais virais do mundo.</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <span className={styles.featureIcon}>📝</span>
          <div>
            <h4>Roteiros Estruturados</h4>
            <p>Esboços completos focados em manter o usuário assistindo até o final.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
