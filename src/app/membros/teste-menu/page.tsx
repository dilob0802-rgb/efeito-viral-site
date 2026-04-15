"use client";

import SidebarOld from "@/components/SidebarOld";

export default function TesteMenuPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#050508" }}>
      <SidebarOld />
      <main style={{ marginLeft: "260px", padding: "40px", flex: 1 }}>
        <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: "20px" }}>Visualização do Menu Antigo</h1>
        <p style={{ color: "#8a8a98", fontSize: "1.1rem" }}>
          Esta página foi criada apenas para você lembrar como era a estrutura da Sidebar original.
          O novo menu (Deskboard) continua ativo em todas as outras páginas! 🚀
        </p>
        
        <div style={{ marginTop: "40px", padding: "24px", background: "rgba(157, 78, 221, 0.05)", borderRadius: "16px", border: "1px solid rgba(157, 78, 221, 0.2)" }}>
          <h2 style={{ color: "#9d4edd", marginBottom: "12px" }}>O que mudou?</h2>
          <ul style={{ color: "#fff", lineHeight: "2" }}>
            <li>• O novo menu é mais estreito (240px vs 260px)</li>
            <li>• O novo menu tem scroll para suportar mais ferramentas</li>
            <li>• Ícones agora são mais finos e elegantes</li>
            <li>• Adição de agrupamentos (Mais ferramentas)</li>
            <li>• Card de usuário com Avatar do canal no rodapé</li>
          </ul>
        </div>
        
        <button 
          onClick={() => window.location.href = '/membros'}
          style={{ 
            marginTop: "30px", 
            padding: "12px 24px", 
            background: "#9d4edd", 
            color: "#fff", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Voltar para o Novo Deskboard
        </button>
      </main>
    </div>
  );
}
