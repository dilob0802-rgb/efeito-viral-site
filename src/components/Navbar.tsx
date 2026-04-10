import styles from './Navbar.module.css';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Efeito Viral
        </Link>
        <nav className={styles.nav}>
          <a href="#metodo" className={styles.link}>Método</a>
          <a href="#ferramentas" className={styles.link}>Ferramentas</a>
          <Link href="#inscricao" className={styles.link} style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Inscreva-se
          </Link>
        </nav>
      </div>
    </header>
  );
}
