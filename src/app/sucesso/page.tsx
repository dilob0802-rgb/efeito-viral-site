"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Success.module.css';

export default function SuccessPage() {
  return (
    <main className={styles.container}>
      <div className={styles.glow} />
      
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className={styles.icon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          🚀
        </motion.div>
        
        <h1 className={styles.title}>Inscrição Confirmada!</h1>
        <p className={styles.text}>
          Seus dados foram enviados com sucesso para o nosso ecossistema. 
          Nossa equipe analisará seu perfil e entrará em contato em breve.
        </p>
        
        <div className={styles.actions}>
          <Link href="/" className="btn-primary">
            Voltar para Home
          </Link>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.btnSecondary}
          >
            Acompanhar no Instagram
          </a>
        </div>
      </motion.div>
    </main>
  );
}
