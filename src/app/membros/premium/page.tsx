'use client';

import PaypalCheckout from "@/components/PaypalCheckout";
import Sidebar from "@/components/Sidebar";

export default function PremiumPage() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '16px' }}>Área VIP Efeito Viral</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
            Desbloqueie ferramentas exclusivas, análises ilimitadas e o curso completo da Academia.
          </p>
        </header>

        <div className="glass-card" style={{ 
          maxWidth: '400px', 
          width: '100%', 
          padding: '40px', 
          border: '1px solid rgba(0, 242, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '32px' }}>
             <span style={{ 
               background: 'linear-gradient(135deg, #00f2ff, #0066ff)', 
               padding: '8px 20px', 
               borderRadius: '30px', 
               fontSize: '0.8rem', 
               fontWeight: 'bold',
               color: '#000'
             }}>
               ACESSO VITALÍCIO
             </span>
          </div>
          
          <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>R$ 97,00</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Pagamento único, sem mensalidades.</p>
          
          <ul style={{ textAlign: 'left', marginBottom: '40px', listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#00f2ff' }}>✓</span> IA Otimizadora de Ganchos
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#00f2ff' }}>✓</span> Arena de Concorrentes Ilimitada
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#00f2ff' }}>✓</span> Acesso completo à Academia
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#00f2ff' }}>✓</span> Suporte Prioritário
            </li>
          </ul>

          <PaypalCheckout 
            amount="97.00" 
            description="Upgrade Premium - Efeito Viral" 
            onSuccess={(details) => {
              console.log('Pagamento realizado!', details);
              // Redirecionar ou atualizar UI
            }}
          />
          
          <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '20px' }}>
            Pagamento seguro processado pelo PayPal.
          </p>
        </div>
      </main>
    </div>
  );
}
