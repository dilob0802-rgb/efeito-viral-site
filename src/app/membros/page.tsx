import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MembrosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050508', color: '#fff', padding: '120px 24px' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '48px', borderRadius: '24px', border: '1px solid rgba(157, 78, 221, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.875rem', marginBottom: '16px' }}>
                Bem-vindo ao Cofre
              </h4>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>
                Olá, Lobato
              </h1>
            </div>
            <div style={{ background: 'rgba(157, 78, 221, 0.1)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--primary)' }}>
              ACESSO VITALÍCIO
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px' }}>
            Seu ecossistema de inteligência está pronto. Utilize as ferramentas abaixo para dominar o algoritmo e escalar sua audiência.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📚</div>
              <h3 style={{ marginBottom: '12px' }}>Treinamentos</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '20px' }}>Acesse as aulas e metodologias gravadas do Efeito Viral.</p>
              <button disabled style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}>Em breve</button>
            </div>

            <Link href="/membros/ideias" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '24px', background: 'rgba(157, 78, 221, 0.05)', border: '1px solid rgba(157, 78, 221, 0.2)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>💡</div>
                <h3 style={{ marginBottom: '12px', color: '#fff' }}>Ideias Diárias</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '20px' }}>Gere sugestões de vídeos virais baseadas em IA (estilo vidIQ).</p>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Acessar agora →</span>
              </div>
            </Link>

            <Link href="/membros/analise" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s' }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ marginBottom: '12px', color: '#fff' }}>Radar de Concorrentes</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '20px' }}>Analise o que está funcionando para os canais do seu nicho.</p>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Iniciar busca →</span>
              </div>
            </Link>

            <Link href="/membros/otimizador" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '24px', background: 'rgba(0, 242, 255, 0.05)', border: '1px solid rgba(0, 242, 255, 0.2)', transition: 'transform 0.2s' }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🛠️</div>
                <h3 style={{ marginBottom: '12px', color: '#fff' }}>Otimizador Pro</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '20px' }}>Faça uma auditoria de SEO completa no seu vídeo (estilo vidIQ).</p>
                <span style={{ color: '#00f2ff', fontWeight: 600 }}>Auditar agora →</span>
              </div>
            </Link>
          </div>

          <div style={{ marginTop: '64px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
             <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                ← Voltar para o site principal
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
