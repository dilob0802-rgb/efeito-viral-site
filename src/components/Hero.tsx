import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.badge}>Acesso Restrito</div>
        <h1 className={styles.title}>
          O Método para Viralizar
        </h1>
        <p className={styles.subtitle}>
          Pare de depender de &quot;dancinhas&quot; ou sorte. Tenha acesso ao ecossistema fechado que os maiores criadores usam para hackear algoritmos e escalar audiências.
        </p>
        <div className={styles.actions}>
          <a href="#inscricao" className="btn-primary">
            Fazer minha Inscrição
          </a>
        </div>
      </div>
    </section>
  );
}
