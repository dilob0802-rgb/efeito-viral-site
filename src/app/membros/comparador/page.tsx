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
      const getCleanId = (input: string) => {
        let clean = input.trim();
        if (clean.includes("youtube.com/watch?v=")) {
          const match = clean.match(/v=([a-zA-Z0-9_-]+)/);
          if (match) return match[1];
        }
        if (clean.includes("youtube.com/channel/")) clean = clean.split("/channel/")[1].split("/")[0].split("?")[0];
        else if (clean.includes("youtube.com/@")) clean = "@" + clean.split("/@")[1].split("/")[0].split("?")[0];
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

  const getThumbnailUrl = (channelData: any) => {
    if (!channelData || !channelData.thumbnails) return "https://www.youtube.com/img/channel_avatar/placeholder.png";
    const thumbs = channelData.thumbnails;
    if (typeof thumbs === 'string') return thumbs;
    return thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || "https://www.youtube.com/img/channel_avatar/placeholder.png";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Arena de Concorrentes ⚔️</h1>
          <button 
            className={styles.infoBtn}
            onClick={() => setShowCriterios(true)}
            title="Ver critérios de análise"
          >?</button>
        </div>
        <p className={styles.subtitle}>Coloque dois perfis frente a frente e descubra quem realmente domina o algoritmo.</p>
      </header>

      <section className={styles.searchArena}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="ID ou Link do Canal A..." 
          value={channelA}
          onChange={(e) => setChannelA(e.target.value)}
        />
        <div className={styles.vsCircle}>VS</div>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="ID ou Link do Canal B..." 
          value={channelB}
          onChange={(e) => setChannelB(e.target.value)}
        />
      </section>

      {!data && !loading && (
        <div className={`${styles.placeholderCard} glass-card`}>
          <p className={styles.placeholderText}>Digite os links dos canais acima para iniciar a análise estratégica.</p>
          <button className={`btn-primary ${styles.duelBtn}`} onClick={handleDuel}>
            INICIAR DUELO
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.fightOverlay}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loadingText}>ANALISANDO DADOS... O MENTOR ESTÁ DECIDINDO O VENCEDOR...</div>
            <div className="loader"></div>
          </div>
        </div>
      )}

      {error && <div className="error-card" style={{ marginBottom: '40px' }}>{error}</div>}

      {data && (
        <>
          <div className={styles.duelGrid}>
            {/* Canal A */}
            <div className={`glass-card ${styles.fighterCard} ${data.winner === 'A' ? styles.winnerEffect : ''}`}>
              {data.winner === 'A' && (
                <div className={styles.winnerBadge}>
                  <span>🏆 VENCEDOR</span>
                </div>
              )}
              <div className={styles.fighterHeader}>
                <div className={styles.avatarWrapper}>
                  <img 
                    src={getThumbnailUrl(data.canalA)} 
                    className={styles.avatar} 
                    alt={data.canalA.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.youtube.com/img/channel_avatar/placeholder.png";
                    }}
                  />
                </div>
                <span className={styles.fighterName}>{data.canalA.title}</span>
              </div>

              <div className={styles.metricsSection}>
                <div className={styles.scoresGrid}>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Engajamento</p>
                    <p className={styles.scoreValue}>{data.analysisA?.scores?.engagement || 0}/10</p>
                  </div>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Consistência</p>
                    <p className={styles.scoreValue}>{data.analysisA?.scores?.consistency || 0}/10</p>
                  </div>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Base Total</p>
                    <p className={styles.scoreValue}>{data.analysisA?.scores?.growth || 0}/10</p>
                  </div>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Autoridade</p>
                    <p className={styles.scoreValue}>{data.analysisA?.scores?.authority || 0}/10</p>
                  </div>
                </div>

                <div className={styles.estimateBox}>
                  <p className={styles.estimateTitle}>CRESCIMENTO ESTIMADO</p>
                  <div className={styles.estimateGrid}>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Dia</span>
                      <span className={styles.estValue}>+{data.analysisA?.growthEstimate?.daily || 0}</span>
                    </div>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Semana</span>
                      <span className={styles.estValue}>+{data.analysisA?.growthEstimate?.weekly || 0}</span>
                    </div>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Mês</span>
                      <span className={styles.estValue}>+{data.analysisA?.growthEstimate?.monthly || 0}</span>
                    </div>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Ano</span>
                      <span className={styles.estValue}>+{data.analysisA?.growthEstimate?.yearly || 0}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.pointsList}>
                  <p className={styles.pointsTitlePos}>✓ Pontos Positivos</p>
                  <ul className={styles.ulList}>
                    {data.analysisA?.positives?.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    )) || <li>Sem dados suficientes</li>}
                  </ul>
                </div>

                <div className={styles.pointsList}>
                  <p className={styles.pointsTitleNeg}>✗ Pontos a Melhorar</p>
                  <ul className={styles.ulList}>
                    {data.analysisA?.negatives?.map((n: string, i: number) => (
                      <li key={i}>{n}</li>
                    )) || <li>Processo otimizado</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Canal B */}
            <div className={`glass-card ${styles.fighterCard} ${data.winner === 'B' ? styles.winnerEffect : ''}`}>
              {data.winner === 'B' && (
                <div className={styles.winnerBadge}>
                  <span>🏆 VENCEDOR</span>
                </div>
              )}
              <div className={styles.fighterHeader}>
                <div className={styles.avatarWrapper}>
                  <img 
                    src={getThumbnailUrl(data.canalB)} 
                    className={styles.avatar} 
                    alt={data.canalB.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.youtube.com/img/channel_avatar/placeholder.png";
                    }}
                  />
                </div>
                <span className={styles.fighterName}>{data.canalB.title}</span>
              </div>

              <div className={styles.metricsSection}>
                <div className={styles.scoresGrid}>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Engajamento</p>
                    <p className={styles.scoreValue}>{data.analysisB?.scores?.engagement || 0}/10</p>
                  </div>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Consistência</p>
                    <p className={styles.scoreValue}>{data.analysisB?.scores?.consistency || 0}/10</p>
                  </div>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Base Total</p>
                    <p className={styles.scoreValue}>{data.analysisB?.scores?.growth || 0}/10</p>
                  </div>
                  <div className={styles.scoreItem}>
                    <p className={styles.scoreLabel}>Autoridade</p>
                    <p className={styles.scoreValue}>{data.analysisB?.scores?.authority || 0}/10</p>
                  </div>
                </div>

                <div className={styles.estimateBox}>
                  <p className={styles.estimateTitle}>CRESCIMENTO ESTIMADO</p>
                  <div className={styles.estimateGrid}>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Dia</span>
                      <span className={styles.estValue}>+{data.analysisB?.growthEstimate?.daily || 0}</span>
                    </div>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Semana</span>
                      <span className={styles.estValue}>+{data.analysisB?.growthEstimate?.weekly || 0}</span>
                    </div>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Mês</span>
                      <span className={styles.estValue}>+{data.analysisB?.growthEstimate?.monthly || 0}</span>
                    </div>
                    <div className={styles.estimateItem}>
                      <span className={styles.estLabel}>Ano</span>
                      <span className={styles.estValue}>+{data.analysisB?.growthEstimate?.yearly || 0}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.pointsList}>
                  <p className={styles.pointsTitlePos}>✓ Pontos Positivos</p>
                  <ul className={styles.ulList}>
                    {data.analysisB?.positives?.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    )) || <li>Sem dados suficientes</li>}
                  </ul>
                </div>

                <div className={styles.pointsList}>
                  <p className={styles.pointsTitleNeg}>✗ Pontos a Melhorar</p>
                  <ul className={styles.ulList}>
                    {data.analysisB?.negatives?.map((n: string, i: number) => (
                      <li key={i}>{n}</li>
                    )) || <li>Processo otimizado</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={`glass-card ${styles.veredictoCard}`}>
            <div className={styles.veredictoHeader}>
              <span className={styles.veredictoIcon}>🏆</span>
              <h3 className={styles.veredictoTitle}>
                {data.winner === 'A' ? data.canalA.title : data.canalB.title} venceu o duelo!
              </h3>
            </div>
            
            <div className={styles.finalScores}>
              <div className={styles.finalScoreItem}>
                <p className={styles.finalScoreLabel}>Nota Final Canal A</p>
                <p className={styles.finalScoreValue}>{data.analysisA?.totalScore || 0}</p>
              </div>
              <div className={styles.finalScoreItem}>
                <p className={styles.finalScoreLabel}>Nota Final Canal B</p>
                <p className={styles.finalScoreValue}>{data.analysisB?.totalScore || 0}</p>
              </div>
            </div>
            
            <div className={styles.iaContent}>
              {data.analysis.split('\n').map((line: string, i: number) => (
                <p key={i} className={line.startsWith('#') || line.match(/^\d\./) ? styles.analysisHeading : styles.analysisLine}>
                  {line.replace(/[*#]/g, '')}
                </p>
              ))}
            </div>

            <center className={styles.newDuelBtn}>
              <button className="btn-secondary" onClick={() => setData(null)}>INICIAR NOVO DUELO</button>
            </center>
          </div>
        </>
      )}

      {showCriterios && (
        <div className={styles.modalOverlay} onClick={() => setShowCriterios(false)}>
          <div className={`glass-card ${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Critérios de Análise</h2>
              <button className={styles.closeBtn} onClick={() => setShowCriterios(false)}>×</button>
            </div>
            
            {Object.entries(criterios).map(([key, criterio]: [string, any]) => (
              <div key={key} className={styles.criterioItem}>
                <h3 className={styles.criterioTitle}>{criterio.titulo}</h3>
                <p className={styles.criterioDesc}>{criterio.descricao}</p>
                <div className={styles.notasGrid}>
                  {criterio.notas.map((n: any, i: number) => (
                    <div key={i} className={styles.notaRow}>
                      <span className={styles.notaBadge} style={{ 
                        background: n.nota >= 7 ? 'linear-gradient(135deg, #4ade80, #22c55e)' : n.nota >= 4 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #f87171, #ef4444)'
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
