"use client";

import { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Eye,
  Users,
  Video,
  ChevronDown
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

// MOCK DATA
const mockVideos = [
  {
    id: "1",
    title: "Por Que Quem Cresce Incomoda Quem Não Quer Crescer - Claudio Duarte",
    channel: "Pr Claudio Duarte",
    subs: "1,6 mi subs",
    views: "14.100",
    time: "2 dias atrás",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    id: "2",
    title: "Assista o vídeo completo no link abaixo 👇",
    channel: "Fe Alves",
    subs: "1,4 mi subs",
    views: "838",
    time: "um dia atrás",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    id: "3",
    title: "Dica de ouro para crescer no Youtube",
    channel: "Victor Benecke :)",
    subs: "1 mil assinantes",
    views: "606",
    time: "2 dias atrás",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  }
];

const mockChartData = [
  { name: "02/17", alvaro: 10, lisandro: 5, amanda: 20 },
  { name: "03/04", alvaro: 15, lisandro: 25, amanda: 40 },
  { name: "03/18", alvaro: 12, lisandro: 15, amanda: 30 },
  { name: "04/01", alvaro: 35, lisandro: 20, amanda: 80 },
  { name: "04/13", alvaro: 25, lisandro: 45, amanda: 50 },
];

const mockCompetitors = [
  { id: "1", name: "Álvaro Medeiros", subs: "5,5 mil assinantes", color: "#8b5cf6" },
  { id: "2", name: "LISANDRO DIAS", subs: "368 assinantes", color: "#3b82f6" },
  { id: "3", name: "Amanda Fitas", subs: "161 mil assinantes", color: "#ec4899" },
  { id: "4", name: "Isabela Louzada", subs: "1,6 mil assinantes", color: "#10b981" },
  { id: "5", name: "Mariana Vabo", subs: "235 mil assinantes", color: "#f59e0b" },
];

const mockStats = [
  { name: "Pr Claudio Duarte", totalViews: "104 mi", weekly: "188 mil", trend: "+8,9%", up: true },
  { name: "Fe Alves", totalViews: "65 mi", weekly: "615 mil", trend: "+11,1%", up: true },
  { name: "Mariana Vabo", totalViews: "55 mi", weekly: "66 mil", trend: "+2,7%", up: true },
  { name: "Meta Mente", totalViews: "1,6 mi", weekly: "21 mil", trend: "-3,8%", up: false },
];

export default function ConcorrentesPage() {
  const [includeMyChannel, setIncludeMyChannel] = useState(true);
  const [normalizeData, setNormalizeData] = useState(true);
  const [activeMetric, setActiveMetric] = useState("Visualizações");
  const [timeRange, setTimeRange] = useState("60 Dias");

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
              <h2 className={styles.cardTitle}>Vídeos mais populares dos seus concorrentes</h2>
              <div className={styles.filters}>
                <div className={styles.toggleWrapper}>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={includeMyChannel} onChange={() => setIncludeMyChannel(!includeMyChannel)} />
                    <span className={styles.slider}></span>
                  </label>
                  <span>Incluir meu canal</span>
                </div>
                <div className="dropdown-dummy" style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Visualizações <ChevronDown size={14} />
                </div>
                <div className="dropdown-dummy" style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Esta semana <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className={styles.videoList}>
              {mockVideos.map(video => (
                <div key={video.id} className={styles.videoItem}>
                  <img src={video.thumb} alt={video.title} className={styles.videoThumb} />
                  <div className={styles.videoInfo}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <p className={styles.videoMeta}>{video.channel} • {video.subs}</p>
                    <p className={styles.videoMeta}>{video.time}</p>
                  </div>
                  <div className={styles.videoViews}>{video.views}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparar Desempenho */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className={styles.cardTitle}>Comparar desempenho</h2>
                <HelpCircle size={16} color="#64748b" />
              </div>
              <div className={styles.filters}>
                {["30 Dias", "60 Dias", "12 Meses"].map(range => (
                  <button 
                    key={range}
                    className={`${styles.chartTab} ${timeRange === range ? styles.chartTabActive : ""}`}
                    onClick={() => setTimeRange(range)}
                    style={{ background: 'none', border: 'none', outline: 'none' }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'vis', label: 'Visualizações', icon: <Eye size={16} /> },
                  { id: 'sub', label: 'Assinantes', icon: <Users size={16} /> },
                  { id: 'vid', label: 'Vídeos públicos', icon: <Video size={16} /> },
                  { id: 'avg_vis', label: 'Média diária de visualizações' },
                  { id: 'avg_sub', label: 'Média de assinantes / dia' },
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
                      color: activeMetric === metric.label ? '#3b82f6' : '#64748b',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className={styles.filters} style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px' }}>
                    {["Diariamente", "Cumulativo", "Total"].map(t => (
                      <button key={t} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: t === "Diariamente" ? 'rgba(255,255,255,0.05)' : 'transparent', color: t === "Diariamente" ? '#fff' : '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>{t}</button>
                    ))}
                  </div>
                  <div className={styles.toggleWrapper}>
                    <label className={styles.switch}>
                      <input type="checkbox" checked={normalizeData} onChange={() => setNormalizeData(!normalizeData)} />
                      <span className={styles.slider}></span>
                    </label>
                    <span>Normalizar dados</span>
                    <HelpCircle size={14} color="#64748b" />
                  </div>
                </div>

                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="alvaro" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="lisandro" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="amanda" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas do Canal */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className={styles.cardTitle}>Estatísticas do canal</h2>
                <HelpCircle size={16} color="#64748b" />
              </div>
            </div>
            <div className="filter-chip" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 'fit-content', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              Visualizações <ChevronDown size={14} />
            </div>

            <div className={styles.statsTableWrapper}>
              <table className={styles.statsTable}>
                <thead>
                  <tr>
                    <th>Canal <ChevronDown size={14} /></th>
                    <th>Visualizações totais <ChevronDown size={14} /></th>
                    <th>Esta semana <ChevronDown size={14} /></th>
                    <th>vs. Semana anterior <ChevronDown size={14} /></th>
                  </tr>
                </thead>
                <tbody>
                  {mockStats.map((stat, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className={styles.channelAvatar}></div>
                          <span style={{ color: '#fff', fontWeight: '600' }}>{stat.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#fff' }}>{stat.totalViews}</td>
                      <td>
                        <div className={stat.up ? styles.trendUp : styles.trendDown}>
                          {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {stat.weekly}
                        </div>
                      </td>
                      <td>
                        <div className={stat.up ? styles.trendUp : styles.trendDown}>
                          {stat.trend}
                        </div>
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
          <div className={styles.card} style={{ padding: '20px' }}>
            <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '20px' }}>Adicionar concorrentes</h3>
            
            <div className={styles.search}>
              <Search className={styles.searchIcon} size={18} />
              <input type="text" className={styles.searchInput} placeholder="Canais de pesquisa..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', marginBottom: '16px' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>Selecionar tudo</span>
            </div>

            <div className={styles.channelList}>
              {mockCompetitors.map(channel => (
                <div key={channel.id} className={styles.channelItem}>
                  <input type="checkbox" defaultChecked />
                  <div className={styles.channelAvatar} style={{ background: channel.color + '22', border: `1px solid ${channel.color}` }}></div>
                  <div className={styles.channelInfo}>
                    <span className={styles.channelName}>{channel.name}</span>
                    <span className={styles.channelSubs}>{channel.subs}</span>
                  </div>
                  <MoreHorizontal size={18} color="#64748b" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
