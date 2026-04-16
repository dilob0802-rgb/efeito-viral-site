import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LandingPagesIndex() {
  const session = await getServerSession(authOptions);
  
  return (
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Diretório de Landing Pages</h1>
      <p style={{ opacity: 0.7 }}>Esta pasta conterá todas as variações de LPs do Efeito Viral.</p>
      
      <div style={{ marginTop: '40px', display: 'grid', gap: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #1f1f2e', borderRadius: '12px', background: '#14141f' }}>
          <h3>Empresas & Negócios</h3>
          <p>Foco: Vendas, autoridade e branding corporativo.</p>
          <span style={{ color: '#00ffcc' }}>Em breve...</span>
        </div>
        
        <div style={{ padding: '20px', border: '1px solid #1f1f2e', borderRadius: '12px', background: '#14141f' }}>
          <h3>Influenciadores</h3>
          <p>Foco: Viralização, retenção e crescimento de audiência.</p>
          <span style={{ color: '#00ffcc' }}>Em breve...</span>
        </div>

        <div style={{ padding: '20px', border: '1px solid #1f1f2e', borderRadius: '12px', background: '#14141f' }}>
          <h3>Iniciantes</h3>
          <p>Foco: Começar do zero, primeiros passos e remoção de travas.</p>
          <span style={{ color: '#00ffcc' }}>Em breve...</span>
        </div>
      </div>
    </div>
  );
}
