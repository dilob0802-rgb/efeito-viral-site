"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingPage from "./onboarding/page";
import styles from "./dashboard.module.css";
import { BarChart3, TrendingUp, Users, Video, Clock, Zap, Play } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Função para formatar números com segurança (lida com ranges como "0 - 100")
const safeFormatNumber = (val: any) => {
  if (!val) return "0";
  if (typeof val === 'number') return val.toLocaleString('pt-BR');
  
  // Se for uma string com range (ex: "0 - 100"), tenta pegar o número mais alto ou limpa
  const cleaned = String(val).replace(/[^0-9]/g, '');
  const num = parseInt(cleaned);
  return isNaN(num) ? "---" : num.toLocaleString('pt-BR');
};

const safeParseInt = (val: any, fallback = 0) => {
  if (!val) return fallback;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9]/g, '');
  const num = parseInt(cleaned);
  return isNaN(num) ? fallback : num;
};

// Funções para simular crescimento retroativo baseado no número atual
const generateMockData = (period: string, currentValue: number) => {
  const data = [];
  const points = period === 'Tempo Real' ? 12 : period === 'Diário' ? 24 : period === 'Semanal' ? 7 : period === 'Mensal' ? 30 : 12;
  
  // Gera labels e dados proporcionais
  const labels = [];
  const now = new Date();
  
  for (let i = points - 1; i >= 0; i--) {
    let label = '';
    const date = new Date(now);
    
    if (period === 'Tempo Real') {
      label = `${i * 5}m atrás`;
    } else if (period === 'Diário') {
      date.setHours(now.getHours() - i);
      label = `${date.getHours()}h`;
    } else if (period === 'Semanal') {
      const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      date.setDate(now.getDate() - i);
      label = dias[date.getDay()];
    } else if (period === 'Mensal') {
      date.setDate(now.getDate() - i);
      label = `${date.getDate()}/${date.getMonth() + 1}`;
    } else {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      date.setMonth(now.getMonth() - i);
      label = meses[date.getMonth()];
    }

    // Calcula um valor que cresce até o valor atual com variabilidade
    const progress = (points - i) / points;
    const baseValue = currentValue * 0.7; // Começa em 70% do valor atual
    const randomFactor = 0.85 + (Math.random() * 0.3); // Variabilidade de +-15%
    const val = Math.floor((baseValue + (currentValue - baseValue) * progress) * randomFactor);

    data.push({
      name: label,
      Val: i === 0 ? currentValue : val // O último ponto é sempre o valor real atual
    });
  }
  return data;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("Semanal");
  const [chartData, setChartData] = useState<any[]>([]);

  const [chartMetric, setChartMetric] = useState<"Visualizações"| "Inscritos" | "Vídeos">("Visualizações");
  const [useMockData, setUseMockData] = useState(false);
  const [projection, setProjection] = useState<any>(null);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const resProf = await fetch('/api/user/profile');
        if (resProf.ok) {
          const profData = await resProf.json();
          if (profData.profile) {
            setStats(profData.profile);
          }
        }

        const resAn = await fetch(`/api/user/analytics`);
        if (resAn.ok) {
          const anData = await resAn.json();
          if (anData.rows && anData.rows.length > 0 && anData.columnHeaders) {
            const viewIdx = anData.columnHeaders.findIndex((h: any) => h.name === "views");
            const subIdx = anData.columnHeaders.findIndex((h: any) => h.name === "subscribersGained");
            
            if (viewIdx >= 0 && subIdx >= 0) {
              const formatted = anData.rows.map((row: any) => ({
                name: row[0].split("-").slice(1).reverse().join("/"),
                val: chartMetric === "Visualizações" ? parseInt(row[viewIdx]) : parseInt(row[subIdx])
              }));
              
              const maxVal = Math.max(...formatted.map((d: any) => d.val));
              const profileTotal = stats?.viewCount ? parseInt(stats.viewCount) : 0;
              
              if (maxVal < 10 && profileTotal > 100) {
                setUseMockData(true);
              } else {
                setChartData(formatted);
                setUseMockData(false);
              }
            } else {
              setUseMockData(true);
            }
          } else if (anData.error) {
              console.error("Erro do Analytics:", anData.error);
              setUseMockData(true);
            } else {
              setUseMockData(true);
            }
        } else {
          setUseMockData(true);
        }
      } catch (e) { 
        console.error("Erro ao buscar dados:", e);
        setUseMockData(true);
      } finally {
        setLoadingStats(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, chartMetric]);

  useEffect(() => {
    async function fetchMyVideos() {
      if (status === "authenticated") {
        setLoadingVideos(true);
        try {
          const res = await fetch('/api/user/videos');
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMyVideos(data.slice(0, 5));
          } else {
            const user = session?.user as any;
            if (user?.youtubeChannelId) {
               const resPub = await fetch(`/api/analise/youtube?channelId=${user.youtubeChannelId}`);
               const dataPub = await resPub.json();
               if (dataPub.videos) setMyVideos(dataPub.videos.slice(0, 5));
            }
          }
        } catch (err) {
          console.error("Erro ao buscar vídeos:", err);
        } finally {
          setLoadingVideos(false);
        }
      }
    }
    fetchMyVideos();
  }, [session, status]);

  useEffect(() => {
    if (!stats) return;

    const totalViews = stats?.viewCount ? parseInt(stats.viewCount) : 0;
    const totalSubs = (stats?.subscriberCount || stats?.subscribers) ? parseInt(stats.subscriberCount || stats.subscribers) : 0;
    const videoCount = stats?.videoCount ? parseInt(stats.videoCount) : 0;
    const avgViewsPerVideo = videoCount > 0 ? Math.round(totalViews / videoCount) : 0;
    
    const engagementRate = totalSubs > 0 ? (avgViewsPerVideo / totalSubs) : 0;
    const consistencyScore = videoCount > 10 ? 1.15 : videoCount > 5 ? 1.10 : videoCount > 2 ? 1.05 : 1.02;
    
    const baseGrowthRate = engagementRate > 0.3 ? 0.12 : engagementRate > 0.1 ? 0.08 : engagementRate > 0.03 ? 0.05 : 0.02;
    const adjustedGrowthRate = baseGrowthRate * consistencyScore;
    
    const projections = [
      { periodo: "1 mês", visualizacoes: Math.round(avgViewsPerVideo * videoCount * (1 + adjustedGrowthRate)), inscritos: Math.round(totalSubs * (1 + adjustedGrowthRate)) },
      { periodo: "3 meses", visualizacoes: Math.round(avgViewsPerVideo * videoCount * Math.pow(1 + adjustedGrowthRate, 3)), inscritos: Math.round(totalSubs * Math.pow(1 + adjustedGrowthRate, 3)) },
      { periodo: "6 meses", visualizacoes: Math.round(avgViewsPerVideo * videoCount * Math.pow(1 + adjustedGrowthRate, 6)), inscritos: Math.round(totalSubs * Math.pow(1 + adjustedGrowthRate, 6)) },
      { periodo: "1 ano", visualizacoes: Math.round(avgViewsPerVideo * videoCount * Math.pow(1 + adjustedGrowthRate, 12)), inscritos: Math.round(totalSubs * Math.pow(1 + adjustedGrowthRate, 12)) },
    ];

    setProjection({
      atual: { visualizacoes: totalViews, inscrito: totalSubs, videos: videoCount, mediaPorVideo: avgViewsPerVideo },
      projections: projections
    });
  }, [stats]);

  useEffect(() => {
    if (!useMockData && chartData.length > 0) return;

    let currentValue = 0;
    const s = stats as any;
    if (chartMetric === "Visualizações") currentValue = safeParseInt(s?.viewCount, 8776);
    else if (chartMetric === "Inscritos") currentValue = safeParseInt(s?.subscriberCount || s?.subscribers, 57);
    else currentValue = safeParseInt(s?.videoCount, 47);
 
    setChartData(generateMockData(chartPeriod, currentValue));
    setUseMockData(true);
  }, [stats, chartMetric, chartPeriod, loadingStats, useMockData]);
  
  if (status === "loading") return <div className={styles.loading}>Carregando...</div>;

  if (!(session?.user as any)?.onboardingComplete) {
    return <OnboardingPage />;
  }

  const handleVideoClick = (id: string) => {
    window.open(`https://youtube.com/watch?v=${id}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Bem-vindo, {session.user?.name}! 👋</h1>
          <p className={styles.subtitle}>Aqui está o desempenho do seu canal hoje.</p>
        </div>
        <div className={styles.channelBadge}>
          { (stats?.youtubeChannelAvatar || (session.user as any)?.youtubeChannelAvatar || stats?.thumbnails) ? (
            <img 
              src={stats?.youtubeChannelAvatar || (session.user as any).youtubeChannelAvatar || stats?.thumbnails} 
              alt="Canal" 
              className={styles.avatar} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((session.user as any).youtubeChannelName || stats?.title || "Canal")}&background=9d4edd&color=fff`;
              }}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {((session.user as any).youtubeChannelName || stats?.title || "C").charAt(0)}
            </div>
          )}
          <span>{(session.user as any)?.youtubeChannelName || stats?.title || (loadingStats ? "Carregando..." : "Meu Canal")}</span>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Visualizações</span>
            <BarChart3 size={20} color="#9d4edd" />
          </div>
          <p className={styles.statValue}>
            {loadingStats && !stats ? "..." : safeFormatNumber(stats?.viewCount)}
          </p>
          <span className={styles.statTrend}>Total acumulado</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Inscritos</span>
            <Users size={20} color="#00ffcc" />
          </div>
          <p className={styles.statValue}>
            {loadingStats && !stats ? "..." : safeFormatNumber(stats?.subscriberCount || stats?.subscribers)}
          </p>
          <span className={styles.statTrend}>Inscritos atuais</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Vídeos Publicados</span>
            <Play size={20} color="#ff9e00" />
          </div>
          <p className={styles.statValue}>
            {loadingStats && !stats ? "..." : safeFormatNumber(stats?.videoCount)}
          </p>
          <span className={styles.statTrend}>Conteúdo no ar</span>
        </div>
      </div>

      <div className={styles.mainContent}>
        {myVideos.length > 0 && (
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Video size={24} color="#9d4edd" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Meus Vídeos Recentes</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {myVideos.map((video: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleVideoClick(video.id)}
                  style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }}
                >
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                      {video.duration || "0:00"}
                    </span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                      {video.title}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      {parseInt(video.viewCount || 0).toLocaleString()} visualizações
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <h3 style={{ color: '#00ffcc', fontSize: '1rem', marginBottom: '16px' }}>Análise Rápida do Canal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {(() => {
                  const subs = parseInt(stats?.subscriberCount || stats?.subscribers || 0);
                  const views = parseInt(stats?.viewCount || 0);
                  const videos = parseInt(stats?.videoCount || 0);
                  const avgViews = videos > 0 ? Math.round(views / videos) : 0;
                  const viewToSubRatio = subs > 0 ? (avgViews / subs) * 100 : 0;
                  
                  const getScore = (value: number, ranges: number[]) => {
                    if (value >= ranges[0]) return 10;
                    if (value >= ranges[1]) return 7;
                    if (value >= ranges[2]) return 4;
                    return 1;
                  };
                  
                  const scores = { engajamento: getScore(viewToSubRatio, [10, 3, 0.5]), autoridade: getScore(viewToSubRatio, [20, 10, 3]) };
                  const getColor = (score: number) => score >= 7 ? '#4ade80' : score >= 4 ? '#fbbf24' : '#f87171';
                  
                  return (
                    <>
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Efeito de Engajamento</p>
                          <p style={{ color: getColor(scores.engajamento), fontSize: '1.2rem', fontWeight: 'bold' }}>{scores.engajamento}/10</p>
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Autoridade do Canal</p>
                          <p style={{ color: getColor(scores.autoridade), fontSize: '1.2rem', fontWeight: 'bold' }}>{scores.autoridade}/10</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <div className={styles.insightsCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Zap size={24} color="#9d4edd" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Análise IA de Hoje</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            Estamos terminando de processar os dados do seu nicho (**{(session?.user as any)?.niche}**). 
            Em breve você verá sugestões de títulos e ganchos personalizados aqui.
          </p>
          <div className={styles.emptyState}>
            Aguardando novos dados de performance...
          </div>
        </div>
      </div>
    </div>
  );
}
