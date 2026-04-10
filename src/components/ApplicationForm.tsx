"use client";

import { useState } from 'react';
import styles from './ApplicationForm.module.css';

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    nome: '',
    perfilSocial: '',
    desafios: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section id="inscricao" className={styles.section}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '64px 32px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Inscrição Recebida!</h2>
            <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: '32px' }}>
              Obrigado por confiar no Efeito Viral. Analisaremos seu perfil e entraremos em contato em breve.
            </p>
            <button 
              onClick={() => setStatus('idle')} 
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              Voltar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inscricao" className={styles.section}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px', textAlign: 'center' }}>Faça sua Inscrição</h2>
        <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          Junte-se ao nosso ecossistema. Preencha sua inscrição abaixo detalhando o seu cenário atual para começarmos.
        </p>

        <div className={`glass-card ${styles.formBox}`}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nome Completo</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Como devemos te chamar?" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required 
                disabled={status === 'sending'}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Link do seu perfil (Instagram/TikTok)</label>
              <input 
                type="url" 
                className={styles.input} 
                placeholder="https://instagram.com/seuusuario" 
                value={formData.perfilSocial}
                onChange={(e) => setFormData({...formData, perfilSocial: e.target.value})}
                required 
                disabled={status === 'sending'}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Conte sobre os seus desafios atuais com conteúdo:</label>
              <textarea 
                className={styles.input} 
                rows={4} 
                placeholder="Estou estagnado em X views, não consigo rentabilizar os seguidores..." 
                value={formData.desafios}
                onChange={(e) => setFormData({...formData, desafios: e.target.value})}
                required 
                disabled={status === 'sending'}
              />
            </div>
            
            {status === 'error' && (
              <p style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '0.875rem' }}>
                Ocorreu um erro ao enviar sua inscrição. Por favor, verifique sua conexão e tente novamente.
              </p>
            )}

            <button 
              type="submit" 
              className={`btn-primary ${styles.submitBtn}`}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar Minha Inscrição'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
