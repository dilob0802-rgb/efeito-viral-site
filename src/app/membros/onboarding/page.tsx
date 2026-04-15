"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";
import { ArrowRight, ArrowLeft, Check, Target, Users, Zap, Search, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

const STEPS = [
  { id: "channel", title: "Conecte seu Canal", subtitle: "Cole o link ou digite o nome do seu canal do YouTube." },
  { id: "niche", title: "Qual o seu nicho?", subtitle: "Isso ajuda a IA a entender o seu mercado." },
  { id: "subscribers", title: "Quantos inscritos você tem?", subtitle: "Sua estratégia muda conforme o tamanho do canal." },
  { id: "goals", title: "Qual seu maior objetivo?", subtitle: "O que você quer alcançar nos próximos 6 meses?" },
  { id: "painPoints", title: "O que mais te trava hoje?", subtitle: "Selecione os principais desafios." }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  
  const [data, setData] = useState({
    youtubeChannelId: "",
    youtubeChannelName: "",
    youtubeChannelAvatar: "",
    niche: "",
    subscribers: "",
    mainGoals: [] as string[],
    painPoints: [] as string[]
  });

  const [channelSearch, setChannelSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  // Busca automática se logado via Google
  useEffect(() => {
    const autoFetch = async () => {
      setIsAutoFetching(true);
      try {
        const res = await fetch("/api/analise/youtube?mine=true");
        if (res.ok) {
          const channel = await res.json();
          if (channel && channel.id) {
            setData(prev => ({
              ...prev,
              youtubeChannelId: channel.id,
              youtubeChannelName: channel.title,
              youtubeChannelAvatar: channel.thumbnails,
              subscribers: channel.subscriberCount // Já pega os inscritos reais!
            }));
            // Pula as etapas automáticas
            setCurrentStep(1); 
          }
        }
      } catch (err) {
        console.error("Erro ao buscar canal automaticamente:", err);
      } finally {
        setIsAutoFetching(false);
      }
    };

    autoFetch();
  }, []);

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

  const findChannel = async () => {
    let query = channelSearch.trim();
    if (!query) return;

    if (query.includes("youtube.com/")) {
      if (query.includes("/@")) {
        query = "@" + query.split("/@")[1].split("/")[0].split("?")[0];
      } else if (query.includes("/channel/")) {
        query = query.split("/channel/")[1].split("/")[0].split("?")[0];
      }
    }

    setSearchLoading(true);
    setSearchError("");
    
    try {
      const res = await fetch(`/api/analise/youtube?q=${encodeURIComponent(query)}&type=channel`);
      const results = await res.json();
      
      if (results && results.length > 0) {
        const topChannel = results[0];
        setData({
          ...data,
          youtubeChannelId: topChannel.id,
          youtubeChannelName: topChannel.title,
          youtubeChannelAvatar: topChannel.thumbnails
        });
      } else {
        setSearchError("Canal não encontrado. Tente digitar apenas o @ ou o nome.");
      }
    } catch (err) {
      setSearchError("Erro ao buscar canal. Verifique sua conexão.");
    } finally {
      setSearchLoading(false);
    }
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
        // ESTRELA DO FIX: Avisa o navegador que os dados mudaram!
        await update({ 
          onboardingComplete: true,
          youtubeChannelId: data.youtubeChannelId,
          youtubeChannelName: data.youtubeChannelName,
          youtubeChannelAvatar: data.youtubeChannelAvatar,
          niche: data.niche
        });
        
        // Redireciona com um reload completo para garantir limpeza de cache
        window.location.href = "/membros?welcome=true";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    const step = STEPS[currentStep].id;
    if (step === "channel") return !!data.youtubeChannelId;
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
            <p className={styles.subtitle}>
              {isAutoFetching ? "Buscando dados do seu canal Google..." : STEPS[currentStep].subtitle}
            </p>
          </header>

          {isAutoFetching && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
               <div className={styles.loader}></div> 
            </div>
          )}

          {!isAutoFetching && STEPS[currentStep].id === "channel" && (
            <div className={styles.optionsGrid}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <input 
                  className={styles.input} 
                  placeholder="Nome do canal ou link"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findChannel()}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
                <button 
                  onClick={findChannel} 
                  disabled={searchLoading}
                  style={{ background: '#9d4edd', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: 'white' }}
                >
                  {searchLoading ? "..." : <Search size={20} />}
                </button>
              </div>

              {searchError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {searchError}
                </div>
              )}

              {data.youtubeChannelId && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid #9d4edd', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <img 
                    src={data.youtubeChannelAvatar} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.youtubeChannelName) + "&background=9d4edd&color=fff";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{data.youtubeChannelName}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Canal Confirmado ✅</p>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {STEPS[currentStep].id === "goals" && (
            <div className={styles.optionsGrid}>
              {[
                { id: "monetize", label: "Monetizar o canal", icon: <Zap size={18} /> },
                { id: "authority", label: "Virar autoridade", icon: <Target size={18} /> },
                { id: "community", label: "Criar comunidade engajada", icon: <Users size={18} /> },
                { id: "traffic", label: "Vender produtos/serviços", icon: <AlertCircle size={18} /> }
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
