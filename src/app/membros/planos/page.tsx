"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Star, Flame, ChevronRight, Info, ShieldCheck, Sparkles, Video, Search, MessageSquare, LineChart, Target, ArrowRight } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import { useState } from "react";
import styles from "./planos.module.css";

export default function PlanosPage() {
  const { data: session, update } = useSession();
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isPremium = (session?.user as any)?.isPremium;

  const handleCapture = async (orderID: string) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID })
      });
      const data = await res.json();
      
      if (data.status === "COMPLETED") {
        await update();
        setMessage({ type: 'success', text: 'Parabéns! Sua assinatura Pro foi ativada com sucesso.' });
        setTimeout(() => window.location.href = '/membros', 2000);
      } else {
        throw new Error("O pagamento não foi concluído.");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erro ao processar pagamento." });
    } finally {
      setIsProcessing(false);
    }
  };

  const commonFeatures = [
    { icon: <Sparkles size={16} />, text: "Acesso total ao Otimizador de IA" },
    { icon: <Zap size={16} />, text: "Busca Viral Ilimitada" },
    { icon: <Target size={16} />, text: "Ideias de vídeo ilimitadas" },
    { icon: <Video size={16} />, text: "Thumbnails virais em segundos" },
    { icon: <MessageSquare size={16} />, text: "Mentor IA disponível 24h" },
    { icon: <LineChart size={16} />, text: "Insights profundos de concorrência" }
  ];

  const plans = [
    {
      id: "pro_mensal",
      name: "Pro Mensal",
      tagline: "Ideal para testar o poder da plataforma",
      price: "49,90",
      period: "/mês",
      savings: "Cancele a qualquer momento",
      buttonText: "Assinar Mensal",
      features: commonFeatures,
      color: "#3b82f6"
    },
    {
      id: "pro_anual",
      name: "Pro Anual",
      tagline: "Acelere seu crescimento com economia",
      price: "397,00",
      period: "/ano",
      savings: "Economize mais de R$ 200 por ano",
      buttonText: "Assinar Anual (PROMO)",
      highlight: true,
      badge: "MELHOR CUSTO-BENEFÍCIO",
      features: [
        ...commonFeatures,
        { icon: <Star size={16} color="#00ffcc" />, text: "Selo de Membro Pro no Perfil" },
        { icon: <ShieldCheck size={16} color="#00ffcc" />, text: "Suporte prioritário via WhatsApp" }
      ],
      color: "#2563eb"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topSpace} />
      
      <header className={styles.header}>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Assine o <span className="text-gradient">Efeito Viral Pro</span>
        </motion.h1>
        <p>Escolha o plano que melhor se adapta ao seu momento como criador.</p>
      </header>

      {message && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.toast}>
          {message.text}
        </motion.div>
      )}

      <div className={styles.grid}>
        {plans.map((plan) => (
          <div key={plan.id} className={`${styles.card} ${plan.highlight ? styles.cardHighlight : ''}`}>
            <div className={styles.cardInfo}>
              <div className={styles.pTitleRow}>
                <h2 className={styles.planName}>{plan.name}</h2>
                {plan.badge && <span className={styles.bestValueBadge}>{plan.badge}</span>}
              </div>
              <p className={styles.planTagline}>{plan.tagline}</p>
              
              <div className={styles.priceRow}>
                <span className={styles.priceSymbol}>R$</span>
                <span className={styles.priceValue}>{plan.price}</span>
                <span className={styles.pricePeriod}>{plan.period}</span>
              </div>
              
              <div className={styles.savingsText}>
                {plan.savings || <span style={{ opacity: 0 }}>placeholder</span>}
              </div>

              <div className={styles.actionArea}>
                {isPremium ? (
                  <button className={styles.currentPlanBtn} disabled>Plano Ativo</button>
                ) : selectedPlanForPayment === plan.id ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={styles.paypalContainer}>
                    <div className={styles.paypalSkeleton}>
                       <div className={styles.skeletonLine} />
                       <div className={styles.skeletonLineShort} />
                    </div>
                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "", currency: "BRL" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill", height: 44, color: plan.highlight ? "blue" : "gold" }}
                        createOrder={(data, actions) => actions.order.create({
                          purchase_units: [{ amount: { value: plan.price.replace(',', '.'), currency_code: "BRL" }, description: `Efeito Viral - ${plan.name}` }]
                        })}
                        onApprove={(data) => handleCapture(data.orderID)}
                      />
                    </PayPalScriptProvider>
                    <button className={styles.cancelLink} onClick={() => setSelectedPlanForPayment(null)}>Cancelar</button>
                  </motion.div>
                ) : (
                  <button 
                    className={`${styles.actionBtn} ${plan.highlight ? styles.actionBtnHighlight : ''}`}
                    onClick={() => setSelectedPlanForPayment(plan.id)}
                  >
                    {plan.buttonText}
                  </button>
                )}
                <p className={styles.cancelAnytime}>Ativação instantânea após a compra.</p>
              </div>
            </div>

            <div className={styles.featureList}>
              {plan.features.map((feature, idx) => (
                <div key={idx} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                  <span className={styles.featureText}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.enterpriseFooter}>
        Dúvidas sobre os planos? <span className={styles.enterpriseLink}>Fale com nosso suporte</span>
      </div>
    </div>
  );
}
