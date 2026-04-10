"use client";

import styles from './ApplicationForm.module.css';

export default function ApplicationForm() {
  return (
    <section id="inscricao" className={styles.section}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px' }}>Faça sua Inscrição</h2>
        <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
          Junte-se ao nosso ecossistema. Preencha sua inscrição abaixo detalhando o seu cenário atual para começarmos.
        </p>

        <div className={`glass-card ${styles.formBox}`}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nome Completo</label>
              <input type="text" className={styles.input} placeholder="Como devemos te chamar?" required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Link do seu perfil (Instagram/TikTok)</label>
              <input type="url" className={styles.input} placeholder="https://instagram.com/seuusuario" required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Conte sobre os seus desafios atuais com conteúdo:</label>
              <textarea className={styles.input} rows={4} placeholder="Estou estagnado em X views, não consigo rentabilizar os seguidores..." required />
            </div>
            <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
              Enviar Minha Inscrição
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
