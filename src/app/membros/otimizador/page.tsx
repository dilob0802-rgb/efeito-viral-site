"use client";

import { useState } from "react";
import styles from "./otimizador.module.css";

interface AuditResult {
  video: {
    title: string;
    thumbnail: string;
    stats: {
      viewCount: string;
    };
  };
  audit: {
    seoScore: number;
    missingTags: string[];
    optimizedDescription: string;
    justification: string;
  };
}

export default function OtimizadorPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    if (!videoUrl) return;
    setLoading(true);
    setError("");
    
    try {
      // Extrair ID do vídeo
      let videoId = videoUrl;
      if (videoUrl.includes("v=")) videoId = videoUrl.split("v=")[1].split("&")[0];
      if (videoUrl.includes("youtu.be/")) videoId = videoUrl.split("youtu.be/")[1].split("?")[0];

      const res = await fetch("/api/analise/otimizador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Falha na auditoria técnica.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Topo estilo vidIQ */}
      <div className={styles.statsHeader}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Assinantes</span>
          <div className={styles.statValue}>12.4K</div>
          <div className={styles.statProgress}><div className={styles.progressFill} style={{ width: '65%', background: '#9d4edd' }}></div></div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Visualizações (28d)</span>
          <div className={styles.statValue}>84.2K</div>
          <div className={styles.statProgress}><div className={styles.progressFill} style={{ width: '40%', background: '#00f2ff' }}></div></div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tempo de Exibição</span>
          <div className={styles.statValue}>3.1K h</div>
          <div className={styles.statProgress}><div className={styles.progressFill} style={{ width: '80%', background: '#ffea00' }}></div></div>
        </div>
      </div>

      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Otimizador de Resultados 🛠️</h1>
        <p style={{ color: 'var(--text-muted)' }}>Cole o link do seu vídeo para uma auditoria completa de SEO e Viralização.</p>
        
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Link do seu vídeo do YouTube (ex: https://youtube.com/watch?v=...)" 
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button className="btn-primary" onClick={handleAudit} disabled={loading}>
            {loading ? "Auditando..." : "Analisar Vídeo"}
          </button>
        </div>
      </header>

      {error && <div className="error-card" style={{ marginBottom: '32px' }}>{error}</div>}

      {result && (
        <div className={styles.auditCard}>
          <div className={styles.seoScore}>
            <span className={styles.scoreValue}>{result.audit.seoScore}</span>
            <span className={styles.scoreLabel}>SEO SCORE</span>
          </div>

          <div className={styles.videoInfo}>
            <img src={result.video.thumbnail} className={styles.thumbnail} alt="" />
            <div>
              <h2 className={styles.videoTitle}>{result.video.title}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{parseInt(result.video.stats.viewCount).toLocaleString('pt-BR')} visualizações</p>
            </div>
          </div>

          <div className={styles.insightGrid}>
            <div className={styles.insightItem}>
              <div className={styles.insightHeader}>🕵️ Tags Sugeridas (Faltantes)</div>
              <div className={styles.tagCloud}>
                {result.audit.missingTags.map(tag => (
                  <span key={tag} className={styles.tag}>+ {tag}</span>
                ))}
              </div>
            </div>

            <div className={styles.insightItem}>
              <div className={styles.insightHeader}>✍️ Descrição Otimizada (Sugestão)</div>
              <div className={styles.descriptionBox}>
                {result.audit.optimizedDescription}
              </div>
              <button 
                className="btn-secondary" 
                style={{ marginTop: '16px', fontSize: '0.8rem' }}
                onClick={() => {
                  navigator.clipboard.writeText(result.audit.optimizedDescription);
                  alert("Descrição copiada! 🔥");
                }}
              >
                Copiar nova descrição
              </button>
            </div>

            <div className={styles.insightItem} style={{ borderLeftColor: '#ffea00' }}>
              <div className={styles.insightHeader}>💡 Veredito Estratégico</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{result.audit.justification}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
