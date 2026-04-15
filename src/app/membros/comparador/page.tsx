"use client";

import { useState } from "react";
import styles from "./comparador.module.css";

const criterios = {
  engajamento: {
    titulo: "Engajamento",
    descricao: "Taxa de visualização média em relação aos inscritos",
    notas: [
      { nota: 10, texto: "Excelente taxa de engajamento (>10%)" },
      { nota: 7, texto: "Bom engajamento (5-10%)" },
      { nota: 4, texto: "Engajamento abaixo da média (2-5%)" },
      { nota: 1, texto: "Engajamento baixo (<2%)" },
    ]
  },
  consistencia: {
    titulo: "Consistência",
    descricao: "Frequência de postagem do canal",
    notas: [
      { nota: 10, texto: "Alta frequência de postagem (>5 vídeos)" },
      { nota: 7, texto: "Postagem consistente (2-5 vídeos)" },
      { nota: 4, texto: "Baixa frequência de postagem (1 vídeo)" },
      { nota: 1, texto: "Inativo (sem vídeos)" },
    ]
  },
  crescimento: {
    titulo: "Base Total",
    descricao: "Tamanho atual da base de inscritos do canal",
    notas: [
      { nota: 10, texto: "Grande base de inscritos (>100k)" },
      { nota: 7, texto: "Bom crescimento (10k-100k)" },
      { nota: 5, texto: "Crescimento em progresso (1k-10k)" },
      { nota: 3, texto: "Poucos inscritos (<1k)" },
    ]
  },
  autoridade: {
    titulo: "Autoridade",
    descricao: "Média de visualizações por vídeo",
    notas: [
      { nota: 10, texto: "Alta média de visualizações (>100k)" },
      { nota: 7, texto: "Boas visualizações por vídeo (10k-100k)" },
      { nota: 5, texto: "Visualizações moderadas (1k-10k)" },
      { nota: 2, texto: "Baixa média de visualizações (<1k)" },
    ]
  }
};

export default function ComparadorPage() {
  const [channelA, setChannelA] = useState("");
  const [channelB, setChannelB] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [showCriterios, setShowCriterios] = useState(false);

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
        // URL completa do tipo youtube.com/watch?v=xxxxx
        if (clean.includes("youtube.com/watch?v=")) {
          const match = clean.match(/v=([a-zA-Z0-9_-]+)/);
          if (match) return match[1];
        }
        // Channel URL
        if (clean.includes("youtube.com/channel/")) clean = clean.split("/channel/")[1].split("/")[0].split("?")[0];
        // Handle URL
        else if (clean.includes("youtube.com/@")) clean = "@" + clean.split("/@")[1].split("/")[0].split("?")[0];
        // Short URL
        else if (clean.includes("youtu.be/")) clean = clean.split("youtu.be/")[1].split("/")[0].split("?")[0];
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <h1 className={styles.title}>Arena de Concorrentes ⚔️</h1>
          <button 
            onClick={() => setShowCriterios(true)}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '50%', 
              width: '32px', 
              height: '32px', 
              color: '#fff', 
              fontSize: '1rem',
              cursor: 'pointer'
            }}
            title="Ver critérios de análise"
          >?</button>
        </div>
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
            <div className={`glass-card ${styles.fighterCard} ${data.winner === 'A' ? styles.winnerEffect : ''}`}>
              {data.winner === 'A' && <span className={styles.winnerBadge}>🏆 Vencedor</span>}
              <div className={styles.fighterHeader}>
                <img src={data.canalA.thumbnails || "https://www.youtube.com/img/channel_avatar/placeholder.png"} className={styles.avatar} alt="" />
                <span className={styles.fighterName}>{data.canalA.title}</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                {/* Notas */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Engajamento</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisA?.scores?.engagement || 0}/10</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Consistência</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisA?.scores?.consistency || 0}/10</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Base Total</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisA?.scores?.growth || 0}/10</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Autoridade</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisA?.scores?.authority || 0}/10</p>
                  </div>
                </div>

                {/* Crescimento Estimado */}
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,242,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ color: '#00ffcc', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>CRESCIMENTO ESTIMADO</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Dia</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisA?.growthEstimate?.daily || 0}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Semana</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisA?.growthEstimate?.weekly || 0}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Mês</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisA?.growthEstimate?.monthly || 0}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Ano</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisA?.growthEstimate?.yearly || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Pontos Positivos */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>✓ Pontos Positivos</p>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {data.analysisA?.positives?.map((p: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{p}</li>
                    )) || <li style={{ color: '#64748b' }}>Sem dados</li>}
                  </ul>
                </div>

                {/* Pontos Negativos */}
                <div>
                  <p style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>✗ Pontos a Melhorar</p>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {data.analysisA?.negatives?.map((n: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{n}</li>
                    )) || <li style={{ color: '#64748b' }}>Nenhum</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Canal B */}
            <div className={`glass-card ${styles.fighterCard} ${data.winner === 'B' ? styles.winnerEffect : ''}`}>
              {data.winner === 'B' && <span className={styles.winnerBadge}>🏆 Vencedor</span>}
              <div className={styles.fighterHeader}>
                <img src={data.canalB.thumbnails || "https://www.youtube.com/img/channel_avatar/placeholder.png"} className={styles.avatar} alt="" />
                <span className={styles.fighterName}>{data.canalB.title}</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                {/* Notas */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Engajamento</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisB?.scores?.engagement || 0}/10</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Consistência</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisB?.scores?.consistency || 0}/10</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Base Total</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisB?.scores?.growth || 0}/10</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Autoridade</p>
                    <p style={{ color: '#00ffcc', fontSize: '1.2rem', fontWeight: 'bold' }}>{data.analysisB?.scores?.authority || 0}/10</p>
                  </div>
                </div>

                {/* Crescimento Estimado */}
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,242,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ color: '#00ffcc', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>CRESCIMENTO ESTIMADO</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Dia</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisB?.growthEstimate?.daily || 0}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Semana</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisB?.growthEstimate?.weekly || 0}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Mês</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisB?.growthEstimate?.monthly || 0}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Ano</p>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>+{data.analysisB?.growthEstimate?.yearly || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Pontos Positivos */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>✓ Pontos Positivos</p>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {data.analysisB?.positives?.map((p: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{p}</li>
                    )) || <li style={{ color: '#64748b' }}>Sem dados</li>}
                  </ul>
                </div>

                {/* Pontos Negativos */}
                <div>
                  <p style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>✗ Pontos a Melhorar</p>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {data.analysisB?.negatives?.map((n: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{n}</li>
                    )) || <li style={{ color: '#64748b' }}>Nenhum</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={`glass-card ${styles.card} ${styles.veredictoCard}`}>
            <div className={styles.veredictoHeader}>
              <span className={styles.veredictoIcon}>🏆</span>
              <h3 style={{ margin: 0 }}>
                {data.winner === 'A' ? data.canalA.title : data.canalB.title } é o Vencedor!
              </h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nota Final A</p>
                <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{data.analysisA?.totalScore || 0}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nota Final B</p>
                <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{data.analysisB?.totalScore || 0}</p>
              </div>
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

      {showCriterios && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowCriterios(false)}>
          <div className="glass-card" style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#fff' }}>Critérios de Análise</h2>
              <button 
                onClick={() => setShowCriterios(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >×</button>
            </div>
            
            {Object.entries(criterios).map(([key, criterio]: [string, any]) => (
              <div key={key} style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#00ffcc', marginBottom: '8px', fontSize: '1rem' }}>{criterio.titulo}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px' }}>{criterio.descricao}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {criterio.notas.map((n: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                      <span style={{ 
                        background: n.nota >= 7 ? '#4ade80' : n.nota >= 4 ? '#fbbf24' : '#f87171',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}>{n.nota}</span>
                      <span style={{ color: '#94a3b8' }}>{n.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
