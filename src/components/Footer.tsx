import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <p className={styles.cta}>Agende uma análise gratuita</p>
          <div className={styles.divider} />
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Efeito Viral. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
