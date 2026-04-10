import styles from './Solution.module.css';

export default function Solution() {
  return (
    <section id="metodo" className={styles.section}>
      <div className={styles.glowRight} />
      <div className={styles.contentWrapper}>
        
        <div className={styles.row}>
          <div className={styles.textContent}>
            <div className={styles.label}>O Método</div>
            <h2 className={styles.title}>Sistema Estruturado de Viralização</h2>
            <p className={styles.description}>
              Nós estruturamos a viralidade através de dados. Em vez de adivinhar o que vai dar certo, você constrói seus vídeos baseados nas métricas reais que a plataforma já validou.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Engenharia Reversa:</strong> Mapeamos o que funciona nos seus concorrentes.
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Gancho Hipnótico:</strong> Retenção absoluta nos primeiros 3 segundos de vídeo.
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Conversão Invisível:</strong> Transformação de views em clientes de High-Ticket sem o desgaste de parecer estar vendendo.
                </div>
              </li>
            </ul>
          </div>
          <div className={styles.visualContent}>
            {/* Bloco abstrato de representação */}
            <div className="glass-card" style={{height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderColor: 'rgba(0,255,204,0.2)'}}>
              <span style={{color: 'var(--secondary)', fontSize: '4rem', marginBottom: '16px'}}>📈</span>
              <h3 style={{color: '#fff'}}>Previsibilidade</h3>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
