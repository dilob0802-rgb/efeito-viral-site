"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Eye,
  Users,
  Video,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import styles from "./concorrentes.module.css";
import { useSession } from "next-auth/react";

export default function ConcorrentesPage() {
  const { data: session } = useSession();
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [includeMyChannel, setIncludeMyChannel] = useState(true);
  const [normalizeData, setNormalizeData] = useState(true);
  const [activeMetric, setActiveMetric] = useState("Visualizações");
  const [timeRange, setTimeRange] = useState("60 Dias");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await fetch("/api/concorrentes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompetitors(data);
        
        // Se tiver competidores e nada selecionado, buscar vídeos do primeiro
        if (data.length > 0 && !selectedChannelId) {
            setSelectedChannelId(data[0].channelId);
            fetchVideos(data[0].channelId);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar concorrentes:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedChannelId]);

  const fetchVideos = async (channelId: string) => {
    setSelectedChannelId(channelId);
    try {
      const res = await fetch(`/api/concorrentes/videos?channelId=${channelId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideos(data.slice(0, 5)); // Mostrar top 5
      }
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const handleAddCompetitor = async () => {
    if (!searchQuery) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/concorrentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: searchQuery })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setSearchQuery("");
        fetchCompetitors();
      }
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      alert("Erro ao buscar o canal. Verifique o link ou @handle.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCompetitor = async (id: string, name: string) => {
    if (!confirm(`Deseja parar de seguir ${name}?`)) return;
    try {
      await fetch(`/api/concorrentes?id=${id}`, { method: "DELETE" });
      if (selectedChannelId === competitors.find(c => c.id === id)?.channelId) {
          setVideos([]);
          setSelectedChannelId(null);
      }
      fetchCompetitors();
    } catch (err) {
      console.error("Erro ao remover:", err);
    }
  };

  // Formatar dados para o gráfico
  const chartData = competitors.length > 0 && competitors[0].history ? competitors[0].history.map((h: any, i: number) => {
    const point: any = { name: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
    competitors.forEach(comp => {
        if (comp.history && comp.history[i]) {
            point[comp.name] = comp.history[i].subsCount;
        }
    });
    return point;
  }) : [];

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Concorrentes</h1>
      </header>

      <div className={styles.gridLayout}>
        <div className={styles.mainSection}>
          
          {/* Vídeos Mais Populares */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Vídeos mais populares dos concorrentes</h2>
              <div className={styles.filters}>
                <div className={styles.toggleWrapper}>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={includeMyChannel} onChange={() => setIncludeMyChannel(!includeMyChannel)} />
                    <span className={styles.slider}></span>
                  </label>
                  <span>Incluir meu canal</span>
                </div>
              </div>
            </div>

            <div className={styles.videoList}>
              {videos.length > 0 ? videos.map(video => (
                <div key={video.id} className={styles.videoItem}>
                  <img src={video.thumbnail} alt={video.title} className={styles.videoThumb} />
                  <div className={styles.videoInfo}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <p className={styles.videoMeta}>{new Date(video.publishedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className={styles.videoViews}>{parseInt(video.viewCount).toLocaleString('pt-BR')} visualizações</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <Video size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>Selecione um concorrente ao lado para ver seus vídeos mais populares.</p>
                </div>
              )}
            </div>
          </div>

          {/* Comparar Desempenho */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className={styles.cardTitle}>Comparar desempenho</h2>
                <HelpCircle size={16} color="#64748b" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'sub', label: 'Assinantes', icon: <Users size={16} /> },
                  { id: 'vis', label: 'Visualizações', icon: <Eye size={16} /> },
                ].map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => setActiveMetric(metric.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeMetric === metric.label ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: activeMetric === metric.label ? '#3b82f6' : '#94a3b8',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {metric.icon}
                    {metric.label}
                  </button>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div className={styles.filters} style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px' }}>
                        {["30 Dias", "60 Dias", "12 Meses"].map(range => (
                        <button 
                            key={range}
                            onClick={() => setTimeRange(range)}
                            style={{ 
                                padding: '6px 16px', 
                                border: 'none', 
                                background: timeRange === range ? 'rgba(255,255,255,0.06)' : 'transparent',
                                color: timeRange === range ? '#fff' : '#64748b',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            {range}
                        </button>
                        ))}
                    </div>
                  <div className={styles.toggleWrapper}>
                    <label className={styles.switch}>
                      <input type="checkbox" checked={normalizeData} onChange={() => setNormalizeData(!normalizeData)} />
                      <span className={styles.slider}></span>
                    </label>
                    <span>Normalizar</span>
                  </div>
                </div>

                <div className={styles.chartContainer}>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        {competitors.map((comp, idx) => (
                           <Line 
                            key={comp.id}
                            type="monotone" 
                            dataKey={comp.name} 
                            stroke={idx === 0 ? "#8b5cf6" : idx === 1 ? "#3b82f6" : idx === 2 ? "#ec4899" : "#10b981"} 
                            strokeWidth={3} 
                            dot={{ r: 4 }} 
                            activeDot={{ r: 6 }} 
                           />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '12px' }}>
                        <TrendingUp size={40} style={{ opacity: 0.2 }} />
                        <p>Aguardando dados de crescimento.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas do Canal */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className={styles.cardTitle}>Tabela Comparativa</h2>
              </div>
            </div>

            <div className={styles.statsTableWrapper}>
              <table className={styles.statsTable}>
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Inscritos</th>
                    <th>Views Totais</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((comp) => (
                    <tr key={comp.id} style={{ opacity: selectedChannelId === comp.channelId ? 1 : 0.8 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={comp.avatar || ""} className={styles.channelAvatar} alt="" />
                          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>{comp.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#fff' }}>{comp.subsCount?.toLocaleString('pt-BR')}</td>
                      <td style={{ color: '#fff' }}>{parseInt(comp.viewCount || "0").toLocaleString('pt-BR')}</td>
                      <td>
                        <button onClick={() => handleRemoveCompetitor(comp.id, comp.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                            <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Selector */}
        <aside className={styles.sidebarSelector}>
          <div className={styles.card} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem' }}>Adicionar Concorrente</h3>
            
            <div className={styles.search}>
              <Search className={styles.searchIcon} size={18} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Ex: @danielsaboya ou link do canal" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
              />
              <button 
                onClick={handleAddCompetitor}
                disabled={isAdding}
                style={{ 
                    position: 'absolute', 
                    right: '4px', 
                    top: '4px', 
                    bottom: '4px', 
                    background: '#3b82f6', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '0 12px', 
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    opacity: isAdding ? 0.7 : 1
                }}
              >
                {isAdding ? <Loader2 className="animate-spin" size={16} /> : <Plus size={18} />}
              </button>
            </div>

            <div>
                <h4 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Canais Monitorados</h4>
                <div className={styles.channelList}>
                {competitors.length > 0 ? competitors.map(channel => (
                    <div 
                        key={channel.id} 
                        className={`${styles.channelItem} ${selectedChannelId === channel.channelId ? styles.activeChannel : ""}`} 
                        onClick={() => fetchVideos(channel.channelId)}
                        style={{ border: selectedChannelId === channel.channelId ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent' }}
                    >
                    <img src={channel.avatar || ""} className={styles.channelAvatar} style={{ scale: '0.8', border: `2px solid #3b82f6` }} alt="" />
                    <div className={styles.channelInfo}>
                        <span className={styles.channelName}>{channel.name}</span>
                        <span className={styles.channelSubs}>{channel.subsCount?.toLocaleString('pt-BR')} subs</span>
                    </div>
                    </div>
                )) : (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '20px' }}>Nenhum canal monitorado.</p>
                )}
                </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
