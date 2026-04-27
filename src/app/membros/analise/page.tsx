"use client";

import { useState } from "react";
import styles from "./analise.module.css";
import ChannelCard from "@/components/ChannelCard";
import { calculateVideoScores } from "@/lib/scoring";
import Paywall from "@/components/Paywall";

export default function AnalisePage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pesquisa" | "canaisTop" | "videosTop" | "trends">("pesquisa");
  const [nicheQuery, setNicheQuery] = useState("");
  const [videoNicheQuery, setVideoNicheQuery] = useState("");

  const handleSearch = async (e?: React.FormEvent, type: string = "pesquisa") => {
    if (e) e.preventDefault();
    if (type === "pesquisa" && !query) return;
    
    setSearching(true);
    setError("");
    setResults([]);
    setVideoResults([]);

    try {
      let url = `/api/analise/youtube?query=${encodeURIComponent(query || nicheQuery || videoNicheQuery)}`;
      if (type === "canaisTop") {
        url = nicheQuery 
          ? `/api/analise/youtube?query=${encodeURIComponent(nicheQuery)}` 
          : `/api/analise/youtube?trend=channels`;
      }
      if (type === "videosTop") {
        url = videoNicheQuery
          ? `/api/analise/youtube?trend=videos&query=${encodeURIComponent(videoNicheQuery)}`
          : `/api/analise/youtube?trend=videos`;
      }

      if (type === "trends") {
        url = `/api/analise/youtube?trend=videos`; // Reutiliza a lógica de vídeos em alta para trends globais
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      } else {
        if (type === "videosTop" || type === "trends") {
          setVideoResults(data);
        } else {
          setResults(data);
        }
      }
    } catch (err: any) {
      setError(err.message || "Falha na conexão com o servidor.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Paywall featureName="Busca Viral Ilimitada">
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Busca Viral</h1>
          <p className={styles.subtitle}>Encontre concorrentes ou descubra tendências que já estão dominando o YouTube.</p>
          <div className={styles.tabContainer}>
            <button 
              className={activeTab === "pesquisa" ? "btn-primary" : "btn-secondary"} 
              onClick={() => setActiveTab("pesquisa")}
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              Pesquisa Livre
            </button>
            <button 
              className={activeTab === "canaisTop" ? "btn-primary" : "btn-secondary"} 
              onClick={() => { setActiveTab("canaisTop"); handleSearch(undefined, "canaisTop"); }}
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              ⭐ Canais em Alta {nicheQuery ? `em ${nicheQuery}` : ""}
            </button>
            <button 
              className={activeTab === "videosTop" ? "btn-primary" : "btn-secondary"} 
              onClick={() => { setActiveTab("videosTop"); handleSearch(undefined, "videosTop"); }}
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              🔥 Vídeos em Alta {videoNicheQuery ? `em ${videoNicheQuery}` : ""}
            </button>
            <button 
              className={activeTab === "trends" ? "btn-primary" : "btn-secondary"} 
              onClick={() => { setActiveTab("trends"); handleSearch(undefined, "trends"); }}
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              🚀 Trends
            </button>
          </div>
        </header>

        {activeTab === "canaisTop" && (
          <section className={styles.searchSection} style={{ marginBottom: '24px' }}>
            <form onSubmit={(e) => handleSearch(e, "canaisTop")} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.searchIcon}>🏷️</span>
                <input
                  type="text"
                  placeholder="Filtrar canais em alta por nicho (ex: Games, Finanças...)"
                  value={nicheQuery}
                  onChange={(e) => setNicheQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={searching}>
                {searching ? "Refinando..." : "Filtrar por Nicho"}
              </button>
              {nicheQuery && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => { setNicheQuery(""); setTimeout(() => handleSearch(undefined, "canaisTop"), 0); }}
                  style={{ borderRadius: '12px' }}
                >
                  Limpar
                </button>
              )}
            </form>
          </section>
        )}
        {activeTab === "videosTop" && (
          <section className={styles.searchSection} style={{ marginBottom: '24px' }}>
            <form onSubmit={(e) => handleSearch(e, "videosTop")} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.searchIcon}>🎥</span>
                <input
                  type="text"
                  placeholder="Filtrar vídeos em alta por nicho (ex: Minecraft, Receitas...)"
                  value={videoNicheQuery}
                  onChange={(e) => setVideoNicheQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={searching}>
                {searching ? "Buscando virais..." : "Filtrar por Nicho"}
              </button>
              {videoNicheQuery && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => { setVideoNicheQuery(""); setTimeout(() => handleSearch(undefined, "videosTop"), 0); }}
                  style={{ borderRadius: '12px' }}
                >
                  Limpar
                </button>
              )}
            </form>
          </section>
        )}

        {activeTab === "pesquisa" && (
          <section className={styles.searchSection}>
            <form onSubmit={(e) => handleSearch(e, "pesquisa")} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Digite o nome de um canal ou @username do YouTube..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={searching}>
                {searching ? "Buscando..." : "Analisar Estratégia"}
              </button>
            </form>
          </section>
        )}

        {error && <div className="error-card" style={{ marginBottom: '24px' }}>{error}</div>}

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            {searching ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                 <h3 className="text-gradient">Minerando dados...</h3>
              </div>
            ) : results.length > 0 ? (
              <div className={styles.resultsList}>
                {results.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    id={channel.id}
                    title={channel.title}
                    thumbnails={channel.thumbnails}
                    subscriberCount={channel.subscriberCount}
                    videoCount={channel.videoCount}
                    viewCount={channel.viewCount}
                    onSelect={(id) => alert(`Iniciando Raio-X do canal: ${id}`)}
                  />
                ))}
              </div>
            ) : videoResults.length > 0 ? (
              <div className={styles.videoGrid}>
                {videoResults.map((video) => (
                  <article key={video.id} className={styles.videoCard}>
                    <div className={styles.videoThumbWrapper}>
                      <img 
                        src={video.thumbnails} 
                        alt={video.title} 
                        className={styles.videoThumb} 
                      />
                    </div>
                    <div className={styles.videoInfo}>
                      {(() => {
                        const scores = calculateVideoScores(video.title, video.id);
                        const getScoreColor = (s: number) => s >= 80 ? '#4ade80' : s >= 50 ? '#fbbf24' : '#f87171';
                        
                        return (
                          <div className={styles.tagStrip}>
                            <span className={styles.scoreTag} style={{ borderColor: getScoreColor(scores.titleScore) }}>
                              Título <span style={{ color: getScoreColor(scores.titleScore) }}>{scores.titleScore}</span>
                            </span>
                            <span className={styles.scoreTag} style={{ borderColor: getScoreColor(scores.thumbScore) }}>
                              Miniat. <span style={{ color: getScoreColor(scores.thumbScore) }}>{scores.thumbScore}</span>
                            </span>
                            <span className={styles.scoreTag} style={{ borderColor: '#9d4edd' }}>
                              Conteúdo <span style={{ color: '#9d4edd' }}>{scores.contentScore}</span>
                            </span>
                          </div>
                        );
                      })()}
                      <h4 className={styles.videoTitle}>{video.title}</h4>
                      <div className={styles.videoMeta}>
                        <div className={`${styles.metaItem} ${styles.viewsCount}`}>
                          <span className={styles.metaIcon}>👁️</span>
                          {parseInt(video.viewCount).toLocaleString('pt-BR')}
                        </div>
                        <div className={`${styles.metaItem} ${styles.likesCount}`}>
                          <span className={styles.metaIcon}>👍</span>
                          {parseInt(video.likeCount).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              (activeTab === "pesquisa" || activeTab === "canaisTop" || activeTab === "videosTop" || activeTab === "trends") && (
                <div className={`glass-card ${styles.emptyState}`}>
                  <div className={styles.emptyIcon}>{activeTab === "trends" ? "🚀" : activeTab === "videosTop" ? "🔥" : activeTab === "canaisTop" ? "⭐" : "🧪"}</div>
                  <h3>{activeTab === "trends" ? "Tendências do Momento" : activeTab === "videosTop" ? "Descubra Vídeos Virais" : activeTab === "canaisTop" ? "Descubra Canais em Alta" : "Comece agora"}</h3>
                  <p>{activeTab === "trends" ? "Veja o que está dominando o YouTube em tempo real agora mesmo." : activeTab === "videosTop" ? "Veja os vídeos que estão bombando ou filtre por um nicho acima." : activeTab === "canaisTop" ? "Clique no botão Filtrar ou digite um nicho acima para ver quem está dominando o YouTube." : "Insira um perfil acima para iniciar o Raio-X de estratégia com IA."}</p>
                  <div className={styles.suggestions}>
                    <span>Sugestões:</span>
                    <button onClick={() => { if(activeTab === "videosTop") { setVideoNicheQuery("marketing"); } else if(activeTab === "canaisTop") { setNicheQuery("marketing"); } else { setQuery("marketing"); } }} className={styles.tag}>#marketing</button>
                    <button onClick={() => { if(activeTab === "videosTop") { setVideoNicheQuery("fitness"); } else if(activeTab === "canaisTop") { setNicheQuery("fitness"); } else { setQuery("fitness"); } }} className={styles.tag}>#fitness</button>
                    <button onClick={() => { if(activeTab === "videosTop") { setVideoNicheQuery("viagem"); } else if(activeTab === "canaisTop") { setNicheQuery("viagem"); } else { setQuery("viagem"); } }} className={styles.tag}>#viagem</button>
                  </div>
                </div>
              )
            )}
          </div>

          <aside className={styles.recentSearches}>
            <h3 className={styles.sideTitle}>Como usar a Busca Viral?</h3>
            <p className={styles.mutedText} style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
              Navegue pelos canais que mais crescem no Brasil atualmente ou pesquise seus próprios concorrentes pra descobrir como eles dominam as visualizações.
            </p>
          </aside>
        </div>
      </div>
    </Paywall>
  );
}
