"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, CheckCircle2, AlertCircle, TrendingUp, Bell } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Ícones SVG Inline para garantir compatibilidade e cores oficiais
const InstagramIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const TiktokIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export default function SocialStatsForm() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [showReminder, setShowReminder] = useState(false);

  const [formData, setFormData] = useState({
    instagramUsername: (session?.user as any)?.instagramUsername || "",
    instagramFollowers: (session?.user as any)?.instagramFollowers || "",
    tiktokUsername: (session?.user as any)?.tiktokUsername || "",
    tiktokFollowers: (session?.user as any)?.tiktokFollowers || "",
    youtubeUsername: (session?.user as any)?.youtubeChannelName || "",
    youtubeFollowers: (session?.user as any)?.subscribers || "",
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/user/social-stats/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        
        // Verifica se precisa de lembrete (se não atualizou este mês)
        const now = new Date();
        const thisMonth = now.getMonth() + 1;
        const thisYear = now.getFullYear();
        
        const hasCurrentMonth = data.some((item: any) => {
          const itemDate = new Date(item.fullDate);
          return itemDate.getMonth() + 1 === thisMonth && itemDate.getFullYear() === thisYear;
        });
        
        setShowReminder(!hasCurrentMonth);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/social-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        await update(); // Atualiza a sessão local
        fetchHistory(); // Recarrega o gráfico
        setShowReminder(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Erro ao salvar os dados. Tente novamente.");
      }
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '12px', border: '1px solid rgba(157, 78, 221, 0.3)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      {/* Banner de Lembrete */}
      {showReminder && (
        <div style={{ 
          background: 'linear-gradient(90deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 255, 204, 0.1) 100%)', 
          border: '1px solid rgba(157, 78, 221, 0.3)', 
          padding: '16px 24px', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <div style={{ background: '#9d4edd', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', margin: 0 }}>Hora de atualizar seus números! 📈</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Mantenha seus dados atualizados para acompanhar seu crescimento real este mês.</p>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(157, 78, 221, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <CheckCircle2 size={24} color="#9d4edd" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>Configure seu Ecossistema</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Insira seus nomes de usuário e seguidores atuais.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Instagram */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <InstagramIcon size={18} color="#E1306C" />
              <span style={{ fontWeight: '600', color: '#fff' }}>Instagram</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="@usuario"
                value={formData.instagramUsername}
                onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}
              />
              <input
                type="text"
                placeholder="Seguidores (ex: 10.5k)"
                value={formData.instagramFollowers}
                onChange={(e) => setFormData({ ...formData, instagramFollowers: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* YouTube */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <YoutubeIcon size={18} color="#FF0000" />
              <span style={{ fontWeight: '600', color: '#fff' }}>YouTube</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Nome do Canal"
                value={formData.youtubeUsername}
                onChange={(e) => setFormData({ ...formData, youtubeUsername: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}
              />
              <input
                type="text"
                placeholder="Inscritos (ex: 50k)"
                value={formData.youtubeFollowers}
                onChange={(e) => setFormData({ ...formData, youtubeFollowers: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* TikTok */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TiktokIcon size={18} color="#00ffcc" />
              <span style={{ fontWeight: '600', color: '#fff' }}>TikTok</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="@usuario"
                value={formData.tiktokUsername}
                onChange={(e) => setFormData({ ...formData, tiktokUsername: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}
              />
              <input
                type="text"
                placeholder="Seguidores (ex: 1M)"
                value={formData.tiktokFollowers}
                onChange={(e) => setFormData({ ...formData, tiktokFollowers: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
            {error && <div style={{ color: '#ff4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> {error}</div>}
            {success && <div style={{ color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Dados salvos com sucesso!</div>}
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: '#9d4edd', 
                color: '#fff', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '12px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              {loading ? "Salvando..." : <><Save size={18} /> Salvar Ecossistema</>}
            </button>
          </div>
        </form>
      </div>

      {/* Gráfico de Evolução */}
      {history.length > 1 && (
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={24} color="#00ffcc" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>Evolução do Ecossistema</h2>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Line 
                  name="Instagram" 
                  type="monotone" 
                  dataKey="instagram" 
                  stroke="#E1306C" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#E1306C", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  name="YouTube" 
                  type="monotone" 
                  dataKey="youtube" 
                  stroke="#FF0000" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#FF0000", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  name="TikTok" 
                  type="monotone" 
                  dataKey="tiktok" 
                  stroke="#00ffcc" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#00ffcc", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.01); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
