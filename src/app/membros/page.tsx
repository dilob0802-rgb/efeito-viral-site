"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingPage from "./onboarding/page";
import styles from "./dashboard.module.css";
import { BarChart3, TrendingUp, Users, Video, Clock, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Funções para simular crescimento retroativo baseado no número atual
const generateMockData = (period: string, currentValue: number) => {
  const data = [];
  const baseValue = Math.max(10, currentValue * 0.4); // começar de algo menor
  const volatility = period === 'Diário' || period === 'Tempo Real' ? 0.05 : 0.15;
  
  let points = 7;
  let labels = [];
  
  if (period === 'Tempo Real') { points = 10; labels = ['-9m', '-8m', '-7m', '-6m', '-5m', '-4m', '-3m', '-2m', '-1m', 'Agora']; }
  else if (period === 'Diário') { points = 24; labels = Array.from({length: 24}, (_, i) => `${i}h`); }
  else if (period === 'Semanal') { points = 7; labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']; }
  else if (period === 'Mensal') { points = 4; labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']; }
  else if (period === 'Anual') { points = 12; labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; }

  let currentPoint = baseValue;
  const growthPerStep = (currentValue - baseValue) / points;

  for (let i = 0; i < points; i++) {
    const isLast = i === points - 1;
    if (isLast) {
      currentPoint = currentValue;
    } else {
      currentPoint += growthPerStep + (Math.random() * growthPerStep * volatility * (Math.random() > 0.5 ? 1 : -1));
    }
    
    data.push({
      name: labels[i],
      Val: Math.floor(currentPoint)
    });
  }
  return data;
};

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("Semanal");
  const [chartData, setChartData] = useState<any[]>([]);

  const [chartMetric, setChartMetric] = useState<"Visualizações" | "Inscritos" | "Vídeos">("Visualizações");
  const [realAnalytics, setRealAnalytics] = useState<any>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [projection, setProjection] = useState<any>(null);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      const user = session?.user as any;
      const channelId = user?.youtubeChannelId;
      
      if (channelId) {
        setLoadingStats(true);
        try {
          // Busca dados REAIS (Stats básicas)
          const res = await fetch(`/api/analise/youtube?id=${channelId}`);
          const data = await res.json();
          
          if (data && data.profile) {
            setStats(data.profile);
          }

          // Busca dados ANALYTICS (Gráfico)
          try {
            const resAn = await fetch(`/api/user/analytics`);
            if (resAn.ok) {
              const anData = await resAn.json();
              if (anData.rows && anData.rows.length > 0) {
                const formatted = anData.rows.map((row: any) => ({
                  name: row[0].split("-").slice(1).reverse().join("/"),
                  Val: parseInt(chartMetric === "Visualizações" ? row[1] : row[4])
                }));
                setChartData(formatted);
                setUseMockData(false);
              }
            } else {
              const anError = await resAn.json();
              console.log("Analytics API error:", anError);
            }
          } catch (e) { console.log("Analytics ainda não disponível"); }

        } catch (err) {
          console.error("Erro ao buscar stats:", err);
        } finally {
          setLoadingStats(false);
        }
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [session, status, chartMetric]);

  // Função para navegar para otimizador com o vídeo
  const handleVideoClick = (videoId: string) => {
    router.push(`/membros/otimizador?videoId=${videoId}`);
  };

  // Buscar vídeos do canal
  useEffect(() => {
    async function fetchMyVideos() {
      const user = session?.user as any;
      const channelId = user?.youtubeChannelId;
      
      if (channelId) {
        setLoadingVideos(true);
        try {
          const res = await fetch(`/api/analise/youtube?channelId=${channelId}`);
          const data = await res.json();
          if (data.videos) {
            setMyVideos(data.videos.slice(0, 5)); // Pegar os 5 primeiros
          }
        } catch (err) {
          console.error("Erro ao buscar vídeos:", err);
        } finally {
          setLoadingVideos(false);
        }
      }
    }

    if (status === "authenticated") {
      fetchMyVideos();
    }
  }, [session, status]);

  // Calcula projeção baseada nos dados reais
  useEffect(() => {
    if (!stats || loadingStats) return;

    const totalViews = stats?.viewCount ? parseInt(stats.viewCount) : 0;
    const totalSubs = stats?.subscriberCount ? parseInt(stats.subscriberCount) : 0;
    const videoCount = stats?.videoCount ? parseInt(stats.videoCount) : 0;
    const avgViewsPerVideo = videoCount > 0 ? Math.round(totalViews / videoCount) : 0;
    
    // Taxa média de crescimento (estimada baseada em dados típicos)
    const monthlyGrowthRate = 0.08; // 8% ao mês média
    
    const projections = [
      { periodo: "1 mês", visualizacoes: Math.round(totalViews * (1 + monthlyGrowthRate)), inscritos: Math.round(totalSubs * (1 + monthlyGrowthRate)) },
      { periodo: "3 meses", visualizacoes: Math.round(totalViews * Math.pow(1 + monthlyGrowthRate, 3)), inscritos: Math.round(totalSubs * Math.pow(1 + monthlyGrowthRate, 3)) },
      { periodo: "6 meses", visualizacoes: Math.round(totalViews * Math.pow(1 + monthlyGrowthRate, 6)), inscritos: Math.round(totalSubs * Math.pow(1 + monthlyGrowthRate, 6)) },
      { periodo: "1 ano", visualizacoes: Math.round(totalViews * Math.pow(1 + monthlyGrowthRate, 12)), inscritos: Math.round(totalSubs * Math.pow(1 + monthlyGrowthRate, 12)) },
    ];

    setProjection({
      atual: { visualizacoes: totalViews, inscrito: totalSubs, videos: videoCount, mediaPorVideo: avgViewsPerVideo },
      projections
    });
  }, [stats, loadingStats]);

  // Fallback suave para o gráfico se não houver dados históricos
  useEffect(() => {
    if (chartData.length > 0 && !loadingStats) return;

    let currentValue = 0;
    if (chartMetric === "Visualizações") currentValue = stats?.viewCount ? parseInt(stats.viewCount) : 1000;
    else if (chartMetric === "Inscritos") currentValue = stats?.subscriberCount ? parseInt(stats.subscriberCount) : 100;
    else currentValue = stats?.videoCount ? parseInt(stats.videoCount) : 10;

    if (currentValue > 0) {
      setChartData(generateMockData(chartPeriod, currentValue));
      setUseMockData(true);
    }
  }, [stats, chartMetric, chartPeriod, loadingStats]);
  
  if (status === "loading") return <div className={styles.loading}>Carregando...</div>;

  if (!(session?.user as any)?.onboardingComplete) {
    return <OnboardingPage />;
  }

  const periods = ['Tempo Real', 'Diário', 'Semanal', 'Mensal', 'Anual'];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Bem-vindo, {session.user?.name}! 👋</h1>
          <p className={styles.subtitle}>Aqui está o desempenho do seu canal hoje.</p>
        </div>
        <div className={styles.channelBadge}>
          { ((session.user as any)?.youtubeChannelAvatar || stats?.thumbnails) ? (
            <img 
              src={(session.user as any).youtubeChannelAvatar || stats?.thumbnails} 
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
        <div 
          className={styles.statCard} 
          onClick={() => setChartMetric("Visualizações")}
          style={{ cursor: 'pointer', border: chartMetric === 'Visualizações' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', transition: 'border 0.3s' }}
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Visualizações</span>
            <BarChart3 size={20} color={chartMetric === 'Visualizações' ? '#00ffcc' : '#9d4edd'} />
          </div>
          <p className={styles.statValue}>
            {loadingStats ? "..." : stats?.viewCount ? Number(stats.viewCount).toLocaleString('pt-BR') : "---"}
          </p>
          <span className={styles.statTrend}>Monitorando tempo real</span>
        </div>

        <div 
          className={styles.statCard}
          onClick={() => setChartMetric("Inscritos")}
          style={{ cursor: 'pointer', border: chartMetric === 'Inscritos' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', transition: 'border 0.3s' }}
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Inscritos</span>
            <Users size={20} color={chartMetric === 'Inscritos' ? '#00ffcc' : '#9d4edd'} />
          </div>
          <p className={styles.statValue}>
            {loadingStats ? "..." : stats?.subscriberCount ? Number(stats.subscriberCount).toLocaleString('pt-BR') : (session?.user as any)?.subscribers || "---"}
          </p>
          <span className={styles.statTrend}>Crescimento Viral</span>
        </div>

        <div 
          className={styles.statCard}
          onClick={() => setChartMetric("Vídeos")}
          style={{ cursor: 'pointer', border: chartMetric === 'Vídeos' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', transition: 'border 0.3s' }}
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Vídeos Publicados</span>
            <Video size={20} color={chartMetric === 'Vídeos' ? '#00ffcc' : '#9d4edd'} />
          </div>
          <p className={styles.statValue}>
            {loadingStats ? "..." : stats?.videoCount || "---"}
          </p>
          <span className={styles.statTrend}>Frequência de Postagem</span>
        </div>
      </div>

      <div className={styles.mainContent}>
        
        {/* GRÁFICO DE CRESCIMENTO */}
        <div className="glass-card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} color={useMockData ? "#ff6b6b" : "#00ffcc"} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Projeção Estratégica (IA): <span style={{ color: 'var(--primary)' }}>{chartMetric}</span></h2>
            </div>
            {useMockData && (
              <span style={{ fontSize: '0.75rem', color: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,107,107,0.3)' }}>
                ⚠️ Dados simulados (habilite YouTube Analytics API)
              </span>
            )}
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {periods.map(p => (
                <button 
                  key={p} 
                  onClick={() => setChartPeriod(p)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    backgroundColor: chartPeriod === p ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: chartPeriod === p ? '#000' : 'var(--text-muted)',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: chartPeriod === p ? 'bold' : 'normal',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartMetric === 'Visualizações' ? '#9d4edd' : chartMetric === 'Inscritos' ? '#00ffcc' : '#ff007f'} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9d4edd" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} 
                         tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#13131c', border: `1px solid ${chartMetric === 'Inscritos' ? '#00ffcc' : '#9d4edd'}`, borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="Val" stroke={chartMetric === 'Visualizações' ? '#9d4edd' : chartMetric === 'Inscritos' ? '#00ffcc' : '#ff007f'} strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {loadingStats ? "Carregando dados..." : "Nenhum canal conectado ainda."}
              </div>
            )}
          </div>
        </div>

        {/* TABELA DE PROJEÇÃO */}
        {projection && (
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <TrendingUp size={24} color="#00ffcc" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Projeção de Crescimento</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Visualizações.atual</p>
                <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{projection.atual.visualizacoes.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Inscritos.atual</p>
                <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{projection.atual.inscrito.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Média/Vídeo</p>
                <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{projection.atual.mediaPorVideo.toLocaleString()}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: '500' }}>Período</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9d4edd', fontWeight: '500' }}>Visualizações</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#00ffcc', fontWeight: '500' }}>Inscritos</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#94a3b8', fontWeight: '500' }}>Crescimento</th>
                </tr>
              </thead>
              <tbody>
                {projection.projections.map((proj: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px', color: '#fff' }}>{proj.periodo}</td>
                    <td style={{ textAlign: 'right', padding: '14px', color: '#fff' }}>{proj.visualizacoes.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '14px', color: '#fff' }}>{proj.inscritos.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '14px', color: idx === 0 ? '#4ade80' : idx === 1 ? '#facc15' : idx === 2 ? '#f97316' : '#ef4444' }}>
                      +{((idx + 1) * 8)}% ao mês
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MEUS VÍDEOS E ANÁLISE DE SCORES */}
        {myVideos.length > 0 && stats && (
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

            {/* Análise de Scores */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <h3 style={{ color: '#00ffcc', fontSize: '1rem', marginBottom: '16px' }}>Análise Rápida do Canal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {(() => {
                  const subs = parseInt(stats.subscriberCount || 0);
                  const views = parseInt(stats.viewCount || 0);
                  const videos = parseInt(stats.videoCount || 0);
                  const avgViews = videos > 0 ? Math.round(views / videos) : 0;
                  const viewToSubRatio = subs > 0 ? (avgViews / subs) * 100 : 0;
                  
                  const getScore = (value: number, ranges: number[]) => {
                    if (value >= ranges[0]) return 10;
                    if (value >= ranges[1]) return 7;
                    if (value >= ranges[2]) return 4;
                    return 1;
                  };
                  
                  const scores = {
                    engajamento: getScore(viewToSubRatio, [10, 3, 0.5]),
                    autoridade: getScore(viewToSubRatio, [20, 10, 3]),
                  };
                  
                  const getColor = (score: number) => score >= 7 ? '#4ade80' : score >= 4 ? '#fbbf24' : '#f87171';
                  
                  const getExplanation = (metric: string, score: number, value: number, unit: string) => {
                    if (metric === 'engajamento') {
                      if (score >= 7) return `Excelente! ${value.toFixed(1)}% dos inscritos assistem em média. Isso indica que seu conteúdo ressoa bem com sua audiência.`;
                      if (score >= 4) return `Bom. ${value.toFixed(1)}% dos inscritos assistem. Há espaço para melhorar o engajamento.`;
                      return `Baixo. Apenas ${value.toFixed(1)}% dos inscritos assistem. Considere trabalhar mais o gancho e Calls-to-Action.`;
                    }
                    if (metric === 'autoridade') {
                      if (score >= 7) return `Muito forte! Cada vídeo atinge ${value.toFixed(0)}% da sua base. Seu canal tem alto impacto.`;
                      if (score >= 4) return `Sólido. ${value.toFixed(0)}% da base alcançada por vídeo. Continue consistentemente.`;
                      return `Necesário grows. Apenas ${value.toFixed(0)}% alcançado. Foque em estratégias deDiscovery e retenção.`;
                    }
                    return '';
                  };
                  
                  return (
                    <>
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Taxa de Engajamento</p>
                          <p style={{ color: getColor(scores.engajamento), fontSize: '1.2rem', fontWeight: 'bold' }}>{scores.engajamento}/10</p>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '8px' }}>Média de visualizações por inscrito</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>
                          {getExplanation('engajamento', scores.engajamento, viewToSubRatio, '%')}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '8px', fontStyle: 'italic' }}>
                          {">10%"}excelente | 3-10%bom | {"<3%"}baixo
                        </p>
                      </div>
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Poder de Alcance</p>
                          <p style={{ color: getColor(scores.autoridade), fontSize: '1.2rem', fontWeight: 'bold' }}>{scores.autoridade}/10</p>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '8px' }}>Média por vídeo vsbase total</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>
                          {getExplanation('autoridade', scores.autoridade, viewToSubRatio, '%')}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '8px', fontStyle: 'italic' }}>
                          {">20%"}viral | 10-20%forte | {"<10%"}desenvolver
                        </p>
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
