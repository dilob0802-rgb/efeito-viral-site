"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";
import { ArrowRight, ArrowLeft, Check, Target, Users, Zap, Brain, MessageSquare, TrendingUp } from "lucide-react";

const STEPS = [
  { id: "niche", title: "Qual o seu nicho?", subtitle: "Isso ajuda a IA a entender o seu mercado." },
  { id: "subscribers", title: "Quantos inscritos você tem?", subtitle: "Sua estratégia muda conforme o tamanho do canal." },
  { id: "goals", title: "Qual seu maior objetivo?", subtitle: "O que você quer alcançar nos próximos 6 meses?" },
  { id: "painPoints", title: "O que mais te trava hoje?", subtitle: "Selecione os principais desafios." }
];

const MENTORS = [
  { id: "lucas", name: "Lucas", expert: "NARRATIVA", desc: "Especialista em retenção e Storytelling viral.", icon: <Zap size={20} /> },
  { id: "jeff", name: "Jeff", expert: "ESTRATÉGIA", desc: "Focado em canais pequenos e crescimento rápido.", icon: <TrendingUp size={20} /> },
  { id: "paul", name: "Paul", expert: "ANALYTICS", desc: "O mestre dos dados e otimização de CTR.", icon: <Brain size={20} /> }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    niche: "",
    subscribers: "",
    mainGoals: [] as string[],
    painPoints: [] as string[],
    selectedMentor: ""
  });
  const [loading, setLoading] = useState(false);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish();
    }
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const finish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        router.push("/membros/dashboard?welcome=true");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    const step = STEPS[currentStep].id;
    if (step === "niche") return !!data.niche;
    if (step === "subscribers") return !!data.subscribers;
    if (step === "goals") return data.mainGoals.length > 0;
    if (step === "painPoints") return data.painPoints.length > 0;
    return false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.onboardingCard}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} 
        />
        
        <div className={styles.stepContent} key={currentStep}>
          <header className={styles.header}>
            <h1 className={styles.title}>{STEPS[currentStep].title}</h1>
            <p className={styles.subtitle}>{STEPS[currentStep].subtitle}</p>
          </header>

          {/* Passo 1: Nicho */}
          {STEPS[currentStep].id === "niche" && (
            <div className={styles.optionsGrid}>
              {["Marketing & Negócios", "Fitness & Saúde", "Games & Entretenimento", "Tecnologia", "Vlogs & Estilo de Vida", "Outro"].map(n => (
                <button 
                  key={n}
                  className={`${styles.optionButton} ${data.niche === n ? styles.selected : ""}`}
                  onClick={() => setData({ ...data, niche: n })}
                >
                  {n}
                  {data.niche === n && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          {/* Passo 2: Inscritos */}
          {STEPS[currentStep].id === "subscribers" && (
            <div className={styles.optionsGrid}>
              {["0 - 100", "100 - 1.000", "1.000 - 10.000", "10.000 - 100.000", "Mais de 100.000"].map(s => (
                <button 
                  key={s}
                  className={`${styles.optionButton} ${data.subscribers === s ? styles.selected : ""}`}
                  onClick={() => setData({ ...data, subscribers: s })}
                >
                  {s} inscritos
                  {data.subscribers === s && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          {/* Passo 3: Objetivos */}
          {STEPS[currentStep].id === "goals" && (
            <div className={styles.optionsGrid}>
              {[
                { id: "monetize", label: "Monetizar o canal", icon: <Zap size={18} /> },
                { id: "authority", label: "Virar autoridade", icon: <Target size={18} /> },
                { id: "community", label: "Criar comunidade engajada", icon: <Users size={18} /> },
                { id: "traffic", label: "Vender produtos/serviços", icon: <TrendingUp size={18} /> }
              ].map(g => (
                <button 
                  key={g.id}
                  className={`${styles.optionButton} ${data.mainGoals.includes(g.label) ? styles.selected : ""}`}
                  onClick={() => {
                    const exists = data.mainGoals.includes(g.label);
                    if (exists) {
                      setData({ ...data, mainGoals: data.mainGoals.filter(i => i !== g.label) });
                    } else {
                      setData({ ...data, mainGoals: [...data.mainGoals, g.label] });
                    }
                  }}
                >
                  <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {g.icon} {g.label}
                  </span>
                  {data.mainGoals.includes(g.label) && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          {/* Passo 4: Dores */}
          {STEPS[currentStep].id === "painPoints" && (
            <div className={styles.optionsGrid}>
              {["Falta de tempo", "Ter ideias novas", "Edição de vídeo", "Constância", "Falar para a câmera"].map(p => (
                <button 
                  key={p}
                  className={`${styles.optionButton} ${data.painPoints.includes(p) ? styles.selected : ""}`}
                  onClick={() => {
                    const exists = data.painPoints.includes(p);
                    if (exists) {
                      setData({ ...data, painPoints: data.painPoints.filter(i => i !== p) });
                    } else {
                      setData({ ...data, painPoints: [...data.painPoints, p] });
                    }
                  }}
                >
                  {p}
                  {data.painPoints.includes(p) && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          <footer className={styles.footer}>
            <button className={styles.backButton} onClick={back} disabled={currentStep === 0}>
              <ArrowLeft size={20} /> Voltar
            </button>
            <button 
              className={styles.nextButton} 
              onClick={next} 
              disabled={!isStepValid() || loading}
            >
              {loading ? "Salvando..." : currentStep === STEPS.length - 1 ? "Finalizar" : "Próximo"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
