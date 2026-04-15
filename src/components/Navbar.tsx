import { useState } from 'react';
import styles from './Navbar.module.css';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Efeito Viral
        </Link>
        
        <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
          <a href="#metodo" className={styles.link} onClick={() => setIsOpen(false)}>Método</a>
          <a href="#ferramentas" className={styles.link} onClick={() => setIsOpen(false)}>Ferramentas</a>
          <Link href="/login" className={styles.link} onClick={() => setIsOpen(false)}>Área de Membros</Link>
          <Link href="#inscricao" className={`${styles.link} ${styles.cta}`} onClick={() => setIsOpen(false)}>
            Inscreva-se
          </Link>
        </nav>
      </div>
    </header>
  );
}
