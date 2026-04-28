import { useRouter } from "next/navigation";
import styles from "./ChannelCard.module.css";

interface ChannelCardProps {
  id: string;
  title: string;
  thumbnails: string;
  subscriberCount: string;
  videoCount: string;
  viewCount?: string;
  onSelect?: (id: string) => void;
}

export default function ChannelCard({ id, title, thumbnails, subscriberCount, videoCount, viewCount }: ChannelCardProps) {
  const router = useRouter();

  const formatNumber = (num: string) => {
    const val = parseInt(num);
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toString();
  };

  // Cálculo visual de Força Viral simulado
  const subValue = parseInt(subscriberCount) || 1;
  const powerSore = Math.min(100, Math.max(10, (Math.log10(subValue) / 8) * 100)); // Escala logaritmica onde 100M = 100%

  return (
    <div 
      className={`glass-card ${styles.card}`} 
      onClick={() => router.push(`/membros/analise/${id}`)}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className={styles.info} style={{ flex: 1 }}>
          <h3 className={styles.name}>{title}</h3>
          <div className={styles.stats}>
            <span>👥 {formatNumber(subscriberCount)} seguidores</span>
            <span>🎥 {formatNumber(videoCount)} vídeos</span>
            {viewCount && <span>👁️ {formatNumber(viewCount)} views</span>}
          </div>
        </div>
        <button className={styles.actionBtn}>Ver Raio-X</button>
      </div>

      {/* Barra de Crescimento / Poder Viral */}
      <div style={{ width: '100%', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Velocidade de Crescimento (IA)</span>
          <span style={{ color: 'var(--secondary)' }}>{powerSore.toFixed(1)}/100</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${powerSore}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 1s ease-out' }}></div>
        </div>
      </div>
    </div>
  );
}

