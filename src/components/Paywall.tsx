"use client";

import { useSession } from "next-auth/react";
import { Lock, Zap, CheckCircle2, Crown } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PaywallProps {
  children: React.ReactNode;
  featureName?: string;
}

export default function Paywall({ children, featureName = "esta ferramenta" }: PaywallProps) {
  const { data: session, status, update } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = (session?.user as any)?.isPremium;

  if (status === "loading") return null;

  if (isPremium) {
    return <>{children}</>;
  }

  const handleCapture = async (orderID: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID })
      });
      const data = await res.json();
      
      if (data.status === "COMPLETED") {
        // Atualiza a sessão para refletir o status premium
        await update(); 
        window.location.reload(); // Recarrega para garantir que os estados globais se atualizem
      } else {
        throw new Error("O pagamento não foi concluído.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Conteúdo borrado ao fundo para efeito visual */}
      <div style={{ filter: 'blur(8px)', pointerEvents: 'none', opacity: 0.3 }}>
        {children}
      </div>

      {/* Modal de Upgrade */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(157, 78, 221, 0.3)',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center',
        zIndex: 50,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(157, 78, 221, 0.2)'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'linear-gradient(135deg, #9d4edd 0%, #00ffcc 100%)', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          boxShadow: '0 0 20px rgba(157, 78, 221, 0.4)'
        }}>
          <Crown color="#fff" size={32} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Acesso Restrito ao Plano Pro
        </h2>
        
        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
          Para acessar o <strong>{featureName}</strong> e outras ferramentas exclusivas, você precisa do plano Efeito Viral Pro.
        </p>

        <div style={{ textAlign: 'left', marginBottom: '32px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#00ffcc" /> Otimizador Pro (Análise Completa)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#00ffcc" /> Busca Viral Ilimitada
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#00ffcc" /> Gerador de Ideias e Roteiros IA
          </div>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px', padding: '10px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '8px' }}>{error}</div>}

        <div style={{ background: '#fff', borderRadius: '12px', padding: '10px' }}>
          <PayPalScriptProvider options={{ 
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
            currency: "BRL" 
          }}>
            <PayPalButtons 
              style={{ layout: "vertical", shape: "rect", label: "subscribe" }}
              disabled={isProcessing}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: "49.90", // Valor de exemplo para o plano mensal
                      currency_code: "BRL"
                    },
                    description: "Efeito Viral Pro - Assinatura Mensal"
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return handleCapture(data.orderID);
              }}
            />
          </PayPalScriptProvider>
        </div>

        <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#64748b' }}>
          Pagamento processado com segurança pelo PayPal.<br/>Cancele a qualquer momento.
        </p>
      </div>
    </div>
  );
}
