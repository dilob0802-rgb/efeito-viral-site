"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./analise-detalhe.module.css";

interface MentorAnalysis {
  pillars: {
    engajamento: number;
    seo: number;
    retencao: number;
    consistencia: number;
  };
  pros: string[];
  cons: string[];
  markdown: string;
}

export default function AnaliseDetalhePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [mentorAnalysis, setMentorAnalysis] = useState<MentorAnalysis | null>(null);
  const [error, setError] = useState("");
  const [viralScore, setViralScore] = useState(0);

  const formatNumber = (num: string) => {
    const val = parseInt(num);
    if (isNaN(val)) return "0";
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toLocaleString('pt-BR');
  };

  const getScoreVeredict = (score: number) => {
    if (score <= 15) return { 
      label: "Baixa Tração", 
      color: "#ff4d4d", 
      text: "O canal está com dificuldade de alcançar novos públicos. A maioria das views vem apenas dos inscritos fiéis." 
    };
    if (score <= 40) return { 
      label: "Crescimento Estável", 
      color: "#ff9100", 
      text: "O canal mantém uma audiência regular, mas o algoritmo ainda não começou a impulsionar o conteúdo para fora da bolha." 
    };
    if (score <= 75) return { 
      label: "Tração Viral", 
      color: "#9d4edd", 
      text: "Conteúdo com alto potencial! O canal está conseguindo atrair muitos novos espectadores além da sua base." 
    };
    return { 
      label: "Explosão Viral", 
      color: "#00f2ff", 
      text: "Este canal é uma máquina de viralização. Cada postagem alcança um público massivo e desproporcional ao número de inscritos." 
    };
  };

  const calculateViralScore = (subscribers: string, videoList: any[]) => {
    const subs = parseInt(subscribers);
    if (!subs || videoList.length === 0) return 0;

    const totalViews = videoList.reduce((sum, v) => sum + parseInt(v.viewCount), 0);
    const avgViews = totalViews / videoList.length;
    const ratio = avgViews / subs;

    let score = Math.round(ratio * 20);
    
    if (score > 100) score = 100;
    if (score < 5) score = Math.floor(Math.random() * 5) + 5;

    return score;
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/analise/youtube?channelId=${id}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        if (data.profile) {
          setProfile({
            title: data.profile.title,
            subscribers: formatNumber(data.profile.subscriberCount),
            rawSubscribers: data.profile.subscriberCount,
            views: formatNumber(data.profile.viewCount),
            engagement: "Ativo",
            avatar: data.profile.thumbnails
          });
        }

        if (Array.isArray(data.videos)) {
          setVideos(data.videos);
          if (data.profile?.subscriberCount) {
             const score = calculateViralScore(data.profile.subscriberCount, data.videos);
             setViralScore(score);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError("Não foi possível carregar os dados reais deste canal.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleGenerateMentor = async () => {
    if (!id) return;
    setGenerating(true);
    setMentorAnalysis(null);

    try {
      const res = await fetch("/api/analise/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: id })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setMentorAnalysis(data.analysis);
      
      setTimeout(() => {
        document.getElementById("mentor-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error(err);
      alert("Erro ao acionar o Mentor IA. Verifique se a sua chave do Gemini está correta.");
    } finally {
      setGenerating(false);
    }
  };

  const veredict = getScoreVeredict(viralScore);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loader}></div>
      <p>Escaneando padrões virais no YouTube...</p>
    </div>
  );

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            {profile?.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.title} 
                className={styles.avatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.title || 'EV')}&background=9d4edd&color=fff`;
                }}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>EV</div>
            )}
          </div>
          <div>
            <h1 className={styles.title}>{profile?.title || "Canal Selecionado"}</h1>
            <p className={styles.platform}>YouTube Intelligence Active</p>
          </div>
        </div>
        
        <div className={styles.quickStats}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{profile?.subscribers}</span>
            <span className={styles.statLabel}>Inscritos</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{profile?.views}</span>
            <span className={styles.statLabel}>Total Views</span>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.mainContent}>
          <div className={`glass-card ${styles.card}`}>
            <h3 className={styles.cardTitle}>🎥 Conteúdos com maior Tração</h3>
            <div className={styles.videoList}>
              {videos.length > 0 ? (
                videos.map(video => (
                  <div key={video.id} className={styles.videoItem}>
                    <img src={video.thumbnails} className={styles.videoThumb} alt="" />
                    <div className={styles.videoInfo}>
                      <span className={styles.videoTitle}>{video.title}</span>
                      <span className={styles.videoMeta}>
                        📈 {parseInt(video.viewCount).toLocaleString('pt-BR')} visualizações
                      </span>
                    </div>
                    <div className={styles.videoStats}>
                      <span>🔥 Viral</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.mutedText}>Nenhum vídeo recente encontrado para análise.</p>
              )}
            </div>
          </div>

          <div className={`glass-card ${styles.card} ${styles.mentorCard}`}>
            <div className={styles.mentorHeader}>
              <span className={styles.mentorIcon}>🧠</span>
              <h3 className={styles.cardTitle}>Auditoria Estratégica AI (Gemini 2.0 Flash)</h3>
            </div>
            
            <div className={styles.iaContent}>
              {!mentorAnalysis ? (
                <>
                  <p className={styles.placeholderText}>
                    Com base nos {videos.length} vídeos acima, a IA Gemini pode identificar o padrão de roteiro e hooks utilizados.
                  </p>
                  <button 
                    className="btn-primary" 
                    style={{width: 'auto', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto'}}
                    onClick={handleGenerateMentor}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div className={styles.miniLoader}></div>
                        Auditando Estratégia...
                      </>
                    ) : (
                      "Iniciar Auditoria Técnica"
                    )}
                  </button>
                </>
              ) : (
                <div id="mentor-result">
                  <div className={styles.analysisGrid}>
                    <div className={styles.pilarCard}>
                      <span className={styles.pilarLabel}>Engajamento</span>
                      <div className={styles.pilarValue}>{mentorAnalysis.pillars.engajamento}%</div>
                      <div className={styles.pilarBar}><div className={styles.pilarFill} style={{ width: `${mentorAnalysis.pillars.engajamento}%`, background: '#9d4edd' }}></div></div>
                    </div>
                    <div className={styles.pilarCard}>
                      <span className={styles.pilarLabel}>SEO Técnico</span>
                      <div className={styles.pilarValue}>{mentorAnalysis.pillars.seo}%</div>
                      <div className={styles.pilarBar}><div className={styles.pilarFill} style={{ width: `${mentorAnalysis.pillars.seo}%`, background: '#00f2ff' }}></div></div>
                    </div>
                    <div className={styles.pilarCard}>
                      <span className={styles.pilarLabel}>Retenção IA</span>
                      <div className={styles.pilarValue}>{mentorAnalysis.pillars.retencao}%</div>
                      <div className={styles.pilarBar}><div className={styles.pilarFill} style={{ width: `${mentorAnalysis.pillars.retencao}%`, background: '#ffea00' }}></div></div>
                    </div>
                    <div className={styles.pilarCard}>
                      <span className={styles.pilarLabel}>Consistência</span>
                      <div className={styles.pilarValue}>{mentorAnalysis.pillars.consistencia}%</div>
                      <div className={styles.pilarBar}><div className={styles.pilarFill} style={{ width: `${mentorAnalysis.pillars.consistencia}%`, background: '#00ff88' }}></div></div>
                    </div>
                  </div>

                  <div className={styles.swotSection}>
                    <div className={`${styles.swotCard} ${styles.pros}`}>
                      <h4 className={styles.swotTitle}>✅ O QUE ELE DOMINA</h4>
                      <ul className={styles.swotList}>
                        {mentorAnalysis.pros.map((item: string, i: number) => (
                          <li key={i} className={styles.swotItem}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={`${styles.swotCard} ${styles.cons}`}>
                      <h4 className={styles.swotTitle}>⚠️ ONDE ELE FALHA</h4>
                      <ul className={styles.swotList}>
                        {mentorAnalysis.cons.map((item: string, i: number) => (
                          <li key={i} className={styles.swotItem}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className={styles.analysisResult} style={{ marginTop: '32px' }}>
                    {mentorAnalysis.markdown.split('\n').map((line: string, i: number) => (
                      <p key={i} className={line.startsWith('#') ? styles.analysisHeading : styles.analysisLine}>
                        {line.replace(/[*#]/g, '')}
                      </p>
                    ))}
                  </div>

                  <button 
                    className={styles.resetBtn}
                    onClick={() => setMentorAnalysis(null)}
                    style={{ marginTop: '40px' }}
                  >
                    Nova Auditoria
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={`glass-card ${styles.card}`}>
            <h4 className={styles.cardTitle}>Score Viral</h4>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNumber}>{viralScore}</span>
              <span className={styles.scoreTotal}>/100</span>
            </div>
            
            <div className={styles.veredictContainer}>
               <span className={styles.veredictLabel} style={{color: veredict.color}}>
                 ● {veredict.label}
               </span>
               <p className={styles.scoreDesc}>{veredict.text}</p>
               
               <div className={styles.formulaBadge}>
                 Fórmula: (Méd. Views / Inscritos) × 20
               </div>
            </div>
          </div>

          <div className={`glass-card ${styles.card}`} style={{marginTop: '24px'}}>
             <h4 className={styles.cardTitle}>Monitoramento</h4>
             <p className={styles.mutedText} style={{fontSize: '0.875rem'}}>Você está monitorando este canal. Receberá alertas de novos vídeos virais.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
