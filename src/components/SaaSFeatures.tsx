import styles from './Solution.module.css';

export default function SaaSFeatures() {
  return (
    <section id="ferramentas" className={styles.section} style={{ background: 'var(--background)' }}>
      <div className={styles.glowRight} style={{ right: 'auto', left: '-200px', top: '50%', background: 'radial-gradient(circle, rgba(157, 78, 221, 0.1) 0%, rgba(5, 5, 8, 0) 70%)' }} />
      <div className={styles.contentWrapper}>
        
        <div className={styles.rowReverse}>
          <div className={styles.textContent}>
            <div className={styles.label}>Ecossistema Integrado</div>
            <h2 className={styles.title}>Seu Próprio Laboratório Viral</h2>
            <p className={styles.description}>
              Nós não te entregamos apenas aulas. Ao entrar, você ganha acesso exclusivo ao software Efeito Viral, projetado para eliminar 90% do seu trabalho operacional.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Radar de Visualizações (VPH):</strong> Monitore os vídeos dos concorrentes em tempo real e saiba exatamente o que está em alta antes de todo mundo.
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Inteligência Artificial Nativa:</strong> Gere roteiros validados e ganchos de alta retenção baseados nos vídeos que estão performando hoje.
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Calendário Sem Fricção:</strong> Organize toda sua produção, revise roteiros e acompanhe o status de gravação e edição num só lugar.
                </div>
              </li>
            </ul>
          </div>
          <div className={styles.visualContent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'center' }}>
            <div className="glass-card" style={{height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
               <h4 style={{color: '#fff', fontSize: '1.5rem', textAlign: 'center'}}>Estúdio IA</h4>
            </div>
            <div className="glass-card" style={{height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
               <h4 style={{color: '#fff', fontSize: '1.5rem', textAlign: 'center'}}>Radar VPH</h4>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
