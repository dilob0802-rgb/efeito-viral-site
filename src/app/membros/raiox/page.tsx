export default function RaioXPage() {
  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Raio-X de Conteúdo</h1>
      <p style={{ color: 'var(--text-muted)' }}>Analise vídeos específicos e descubra os ganchos virais que eles utilizaram.</p>
      
      <div className="glass-card" style={{ marginTop: '40px', padding: '100px', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', opacity: 0.2 }}>🎥</span>
        <h2>Em breve no seu ecossistema</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '16px auto' }}>
          Estamos finalizando o motor de transcrição e análise de ganchos com IA para esta ferramenta.
        </p>
      </div>
    </div>
  );
}
