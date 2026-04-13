"use client";

import { useState } from "react";
import styles from "./comparador.module.css";

export default function ComparadorPage() {
  const [channelA, setChannelA] = useState("");
  const [channelB, setChannelB] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleDuel = async () => {
    if (!channelA || !channelB) {
      alert("Por favor, preencha os dois canais para iniciar o duelo.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      // Pequeno utilitário para extrair ID do link se necessário
      const getCleanId = (input: string) => {
        let clean = input.trim();
        if (clean.includes("youtube.com/channel/")) clean = clean.split("/channel/")[1].split("/")[0].split("?")[0];
        if (clean.includes("youtube.com/@")) clean = "@" + clean.split("/@")[1].split("/")[0].split("?")[0];
        if (clean.includes("youtu.be/")) clean = clean.split("youtu.be/")[1].split("/")[0].split("?")[0];
        return clean;
      };

      const res = await fetch("/api/analise/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          channelIdA: getCleanId(channelA), 
          channelIdB: getCleanId(channelB) 
        })
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao conectar com a Arena.");
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (val: string, max: number) => {
    const num = parseInt(val);
    if (isNaN(num)) return 5;
    const perc = (num / max) * 100;
    return Math.max(perc, 5);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Arena de Concorrentes ⚔️</h1>
        <p className={styles.subtitle}>Coloque dois perfis frente a frente e descubra quem realmente domina o algoritmo.</p>
      </header>

      <section className={styles.searchArena}>
        <div className={styles.searchBox}>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="ID ou Link do Canal A..." 
            value={channelA}
            onChange={(e) => setChannelA(e.target.value)}
          />
        </div>
        <div className={styles.vsCircle}>VS</div>
        <div className={styles.searchBox}>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="ID ou Link do Canal B..." 
            value={channelB}
            onChange={(e) => setChannelB(e.target.value)}
          />
        </div>
      </section>

      {!data && !loading && (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Digite os links dos canais acima para iniciar a análise estratégica.</p>
          <button className={`btn-primary ${styles.duelBtn}`} onClick={handleDuel}>
            INICIAR DUELO
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.fightOverlay}>
          <div className={styles.loadingText}>ANALISANDO DADOS... O MENTOR ESTÁ DECIDINDO O VENCEDOR...</div>
        </div>
      )}

      {error && <div className="error-card" style={{ marginBottom: '40px' }}>{error}</div>}

      {data && (
        <>
          <div className={styles.duelGrid}>
            {/* Canal A */}
            <div className={`glass-card ${styles.fighterCard} ${data.canalA.score > data.canalB.score ? styles.winnerEffect : ''}`}>
              {data.canalA.score > data.canalB.score && <span className={styles.winnerBadge}>Líder Viral</span>}
              <div className={styles.fighterHeader}>
                <img src={data.canalA.thumbnails} className={styles.avatar} alt="" />
                <span className={styles.fighterName}>{data.canalA.title}</span>
              </div>
              
              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <span>Inscritos</span>
                  <span>{parseInt(data.canalA.subscriberCount).toLocaleString('pt-BR')}</span>
                </div>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: '100%', background: '#9d4edd' }}></div></div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <span>Score Viral</span>
                  <span>{data.canalA.score}/100</span>
                </div>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${data.canalA.score}%`, background: '#00f2ff' }}></div></div>
              </div>
            </div>

            {/* Canal B */}
            <div className={`glass-card ${styles.fighterCard} ${data.canalB.score > data.canalA.score ? styles.winnerEffect : ''}`}>
               {data.canalB.score > data.canalA.score && <span className={styles.winnerBadge}>Líder Viral</span>}
              <div className={styles.fighterHeader}>
                <img src={data.canalB.thumbnails} className={styles.avatar} alt="" />
                <span className={styles.fighterName}>{data.canalB.title}</span>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <span>Inscritos</span>
                  <span>{parseInt(data.canalB.subscriberCount).toLocaleString('pt-BR')}</span>
                </div>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: '100%', background: '#9d4edd' }}></div></div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <span>Score Viral</span>
                  <span>{data.canalB.score}/100</span>
                </div>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${data.canalB.score}%`, background: '#00f2ff' }}></div></div>
              </div>
            </div>
          </div>

          <div className={`glass-card ${styles.card} ${styles.veredictoCard}`}>
            <div className={styles.veredictoHeader}>
              <span className={styles.veredictoIcon}>🏆</span>
              <h3 style={{ margin: 0 }}>Veredito da Arena (Insights IA)</h3>
            </div>
            
            <div className={styles.iaContent}>
              {data.analysis.split('\n').map((line: string, i: number) => (
                <p key={i} className={line.startsWith('#') || line.match(/^\d\./) ? styles.analysisHeading : styles.analysisLine}>
                  {line.replace(/[*#]/g, '')}
                </p>
              ))}
            </div>
          </div>

          <center style={{marginTop: '40px'}}>
             <button className="btn-secondary" onClick={() => setData(null)}>Novo Duelo</button>
          </center>
        </>
      )}
    </div>
  );
}
