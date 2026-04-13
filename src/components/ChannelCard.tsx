import { useRouter } from "next/navigation";
import styles from "./ChannelCard.module.css";

interface ChannelCardProps {
  id: string;
  title: string;
  thumbnails: string;
  subscriberCount: string;
  videoCount: string;
  onSelect?: (id: string) => void;
}

export default function ChannelCard({ id, title, thumbnails, subscriberCount, videoCount }: ChannelCardProps) {
  const router = useRouter();

  const formatNumber = (num: string) => {
    const val = parseInt(num);
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toString();
  };

  return (
    <div 
      className={`glass-card ${styles.card}`} 
      onClick={() => router.push(`/membros/analise/${id}`)}
    >
      <img src={thumbnails} alt={title} className={styles.avatar} />
      <div className={styles.info}>
        <h3 className={styles.name}>{title}</h3>
        <div className={styles.stats}>
          <span>👥 {formatNumber(subscriberCount)} seguidores</span>
          <span>🎥 {formatNumber(videoCount)} vídeos</span>
        </div>
      </div>
      <button className={styles.actionBtn}>Ver Raio-X</button>
    </div>
  );
}

