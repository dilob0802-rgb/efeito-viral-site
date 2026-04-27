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

  const [showHelp, setShowHelp] = useState(false);

  // Busca automática desativada conforme solicitação
  useEffect(() => {
    setIsAutoFetching(false);
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
    // Simulação de confirmação manual
    if (channelSearch.trim()) {
      // Tenta extrair o nome limpo se for um link
      let name = channelSearch;
      if (name.includes("@")) {
        name = name.split("@")[1];
      } else if (name.includes("youtube.com/channel/")) {
        name = name.split("youtube.com/channel/")[1];
      } else if (name.includes("youtube.com/c/")) {
        name = name.split("youtube.com/c/")[1];
      }

      setData({
        ...data,
        youtubeChannelId: "manual-" + Date.now(),
        youtubeChannelName: name,
        youtubeChannelAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9d4edd&color=fff&size=128`
      });
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
                  style={{ background: '#9d4edd', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
                >
                  Confirmar
                </button>
              </div>

              {/* Barra Recolhível de Ajuda */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowHelp(!showHelp)}
                  style={{ background: 'none', border: 'none', color: '#9d4edd', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '5px 0' }}
                >
                  <Search size={14} />
                  Onde encontro o link do meu canal?
                  {showHelp ? <ArrowRight size={14} style={{ transform: 'rotate(-90deg)' }} /> : <ArrowRight size={14} style={{ transform: 'rotate(90deg)' }} />}
                </button>
                
                {showHelp && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '15px', 
                    backgroundColor: 'rgba(157, 78, 221, 0.05)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(157, 78, 221, 0.2)',
                    fontSize: '0.85rem',
                    color: '#94a3b8',
                    lineHeight: '1.5',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <p style={{ marginBottom: '10px', color: '#fff', fontWeight: '600' }}>Siga estes passos:</p>
                    <ol style={{ paddingLeft: '18px' }}>
                      <li style={{ marginBottom: '8px' }}>Acesse o <b>YouTube</b> pelo computador ou celular.</li>
                      <li style={{ marginBottom: '8px' }}>Clique na sua <b>foto de perfil</b>.</li>
                      <li style={{ marginBottom: '8px' }}>Vá em <b>"Seu canal"</b> (ou Visualizar canal).</li>
                      <li>Copie o link que aparece no topo (ex: youtube.com/@seu-nome).</li>
                    </ol>
                  </div>
                )}
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
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: '2px solid #9d4edd',
                    backgroundColor: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={data.youtubeChannelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.youtubeChannelName)}&background=9d4edd&color=fff`} 
                      alt="Avatar" 
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.youtubeChannelName) + "&background=9d4edd&color=fff";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{data.youtubeChannelName}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#00ffcc' }}>Canal Confirmado ✅</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {STEPS[currentStep].id === "niche" && (
            <div className={styles.optionsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {[
                "Saúde", "Finanças", "Educação", "Tecnologia", "Entretenimento", 
                "Games", "Beleza e estética", "Moda", "Fitness e esportes", 
                "Alimentação / culinária", "Viagem e turismo", "Relacionamentos", 
                "Desenvolvimento pessoal", "Negócios / empreendedorismo", 
                "Marketing digital", "Lifestyle (estilo de vida)", "Notícias / política", 
                "Música", "Automóveis", "Família / maternidade", "Outro"
              ].map(n => (
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
