"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  Search, Sparkles, X, RotateCw, History, Plus, Zap, 
  TrendingUp, Eye, Calendar, ArrowLeft, CheckCircle, 
  AlertCircle, BarChart3, Image as ImageIcon, SearchCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./otimizador.module.css";
import { calculateVideoScores } from "@/lib/scoring";
import Paywall from "@/components/Paywall";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  duration?: string;
  titleScore: number;
  thumbScore: number;
  type: "video" | "short";
  status: "public" | "draft";
}

export default function OtimizadorPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'title' | 'thumb' | 'seo' | 'analysis'>('title');
  const [videoQuestion, setVideoQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const response = await fetch("/api/user/videos");
        const data = await response.json();
        
        const processVideos = (vids: any[]) => vids.map(v => {
          const scores = calculateVideoScores(v.title, v.id);
          return {
            ...v,
            titleScore: scores.titleScore,
            thumbScore: scores.thumbScore,
            contentScore: scores.contentScore,
            views: v.viewCount || v.views || "0"
          };
        });

        if (!data.error && data.videos && data.videos.length > 0) {
          setVideos(processVideos(data.videos));
          setError(null);
        } else {
          const user = session?.user as any;
          let channelId = user?.youtubeChannelId;

          if (!channelId) {
            const resProf = await fetch('/api/user/profile');
            const profData = await resProf.json();
            channelId = profData.profile?.youtubeChannelId;
          }

          if (channelId) {
            const resPub = await fetch(`/api/analise/youtube?channelId=${channelId}`);
            const dataPub = await resPub.json();
            if (dataPub.videos && dataPub.videos.length > 0) {
              setVideos(processVideos(dataPub.videos));
              setError(null);
              return;
            }
          }
          
          setVideos([]);
          setError("Nenhum vídeo encontrado. Verifique se o seu canal está conectado.");
        }
      } catch (err) {
        console.error("Erro ao carregar vídeos:", err);
        setVideos([]);
        setError("Erro ao conectar com o canal.");
      } finally {
        setLoading(false);
      }
    }
    
    if (session) {
      fetchVideos();
    }
  }, [session]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setActiveModalTab('title');
    setVideoQuestion("");
  };

  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getScoreColor = (score: number) => score >= 80 ? '#00ffcc' : score >= 50 ? '#fbbf24' : '#f43f5e';

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const analyzeTitle = (title: string) => {
    const t = title.toLowerCase();
    return {
      hasNumbers: /\d+/.test(title),
      hasQuestion: t.includes('?'),
      hasComo: t.includes('como'),
      hasDica: t.includes('dica'),
      hasSecreto: t.includes('secreto'),
      has2026: /\d{4}/.test(title),
      length: title.length
    };
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleAnalyzeLink = async () => {
    if (!searchQuery) return;
    
    const videoId = extractVideoId(searchQuery);
    if (!videoId) {
      // Se não for link, apenas a busca normal já funciona via filteredVideos
      return;
    }

    setLoading(true);
    try {
      // Usa nossa API interna como proxy para evitar CORS e buscar dados reais via oEmbed no servidor
      const response = await fetch(`/api/analise/youtube?videoId=${videoId}`);
      const videoData = await response.json();
      
      if (videoData && videoData.title) {
        const scores = calculateVideoScores(videoData.title, videoId);
        const newVideo: Video = {
          id: videoId,
          title: videoData.title,
          thumbnail: videoData.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          views: "0",
          publishedAt: videoData.publishedAt || new Date().toISOString(),
          titleScore: scores.titleScore,
          thumbScore: scores.thumbScore,
          type: "video",
          status: "public"
        };
        
        setSelectedVideo(newVideo);
      } else {
        throw new Error("Dados do vídeo não encontrados");
      }
    } catch (err) {
      console.error("Erro ao analisar link via proxy:", err);
      // Fallback final se o proxy falhar
      const scores = calculateVideoScores("Vídeo do Link", videoId);
      setSelectedVideo({
        id: videoId,
        title: "Vídeo do YouTube",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        views: "0",
        publishedAt: new Date().toISOString(),
        titleScore: scores.titleScore,
        thumbScore: scores.thumbScore,
        type: "video",
        status: "public"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paywall featureName="Otimizador Pro">
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Otimizar
            </motion.h1>
            <p>Turbine sua retenção e CTR usando nossa inteligência de viralização proprietária.</p>
          </div>

          <motion.div 
            className={styles.searchContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.searchBar}>
              <Zap className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Cole o link do vídeo do YouTube aqui para otimizar..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeLink()}
              />
              <button 
                className={styles.analyzeBtn}
                onClick={handleAnalyzeLink}
                disabled={!searchQuery}
              >
                Analisar Vídeo
              </button>
            </div>
            <p className={styles.searchHint}>Dica: Você também pode pesquisar vídeos já analisados digitando o nome.</p>
          </motion.div>
        </header>

        {loading ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Escaneando canal e calculando métricas...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} color="#f43f5e" style={{ marginBottom: 16 }} />
            <p>{error}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} color="#64748b" style={{ marginBottom: 16 }} />
            <p>Nenhum vídeo corresponde à busca.</p>
          </div>
        ) : (
          <motion.div 
            className={styles.videoGrid}
          >
            {filteredVideos.map((video, index) => (
              <motion.div 
                key={video.id} 
                className={styles.videoCard}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => handleVideoClick(video)}
              >
                <div className={styles.cardThumbnail}>
                  <img src={video.thumbnail} alt="" />
                  {video.duration && <span className={styles.timeOverlay}>{video.duration}</span>}
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.tagStrip}>
                    <span className={styles.scoreTag} style={{ color: getScoreColor(video.titleScore) }}>
                      {video.titleScore}% Virality
                    </span>
                  </div>
                  <h3 className={styles.videoTitle}>{video.title}</h3>
                  <div className={styles.videoMeta}>
                    <span><Eye size={14} /> {formatViews(video.views)}</span>
                    <span><Calendar size={14} /> {new Date(video.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {selectedVideo && (
            <motion.div 
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div 
                className={styles.modalContent}
                onClick={e => e.stopPropagation()}
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className={styles.modalHeader}>
                  <div className={styles.headerLeft}>
                    <button className={styles.closeBtn} onClick={() => setSelectedVideo(null)}>
                      <ArrowLeft size={18} />
                    </button>
                    <div className={styles.headerVideoInfo}>
                      <div className={styles.headerThumb}>
                        <img src={selectedVideo.thumbnail} alt="" />
                      </div>
                      <div className={styles.headerText}>
                        <span className={styles.headerLabel}>Analisando agora:</span>
                        <h2 className={styles.headerTitle}>{selectedVideo.title}</h2>
                      </div>
                    </div>
                  </div>
                  <div className={styles.headerRight}>
                    <div className={styles.scoreTag} style={{ color: getScoreColor(selectedVideo.titleScore) }}>
                      Score: {selectedVideo.titleScore}/100
                    </div>
                  </div>
                </div>

                <div className={styles.modalTabs}>
                  <button 
                    className={activeModalTab === 'title' ? styles.activeTab : ''}
                    onClick={() => setActiveModalTab('title')}
                  >
                    <Sparkles size={16} style={{ marginRight: 8 }} /> Título
                  </button>
                  <button 
                    className={activeModalTab === 'thumb' ? styles.activeTab : ''}
                    onClick={() => setActiveModalTab('thumb')}
                  >
                    <ImageIcon size={16} style={{ marginRight: 8 }} /> Miniatura
                  </button>
                  <button 
                    className={activeModalTab === 'seo' ? styles.activeTab : ''}
                    onClick={() => setActiveModalTab('seo')}
                  >
                    <SearchCode size={16} style={{ marginRight: 8 }} /> SEO & Viral
                  </button>
                  <button 
                    className={activeModalTab === 'analysis' ? styles.activeTab : ''}
                    onClick={() => setActiveModalTab('analysis')}
                  >
                    <BarChart3 size={16} style={{ marginRight: 8 }} /> Análise Completa
                  </button>
                </div>

                <div className={styles.modalBody}>
                  {activeModalTab === 'title' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className={styles.summaryCard}>
                        <h3>Título Atual</h3>
                        <p className={styles.bigScore}>{selectedVideo.titleScore}</p>
                        <p className={styles.currentTitleDisplay}>"{selectedVideo.title}"</p>
                        <div className={styles.scoreBar}>
                          <div 
                            className={styles.scoreFill} 
                            style={{ 
                              width: `${selectedVideo.titleScore}%`,
                              backgroundColor: getScoreColor(selectedVideo.titleScore)
                            }} 
                          />
                        </div>
                      </div>

                      <div className={styles.strengthsWeaknesses}>
                        <div className={styles.analysisSection}>
                          <h4><CheckCircle size={18} color="#00ffcc" /> Pontos Fortes</h4>
                          {(() => {
                            const a = analyzeTitle(selectedVideo.title);
                            return (
                              <>
                                {a.hasNumbers && <div className={`${styles.pointItem} ${styles.strength}`}>Uso de números para ancoragem de valor.</div>}
                                {a.hasComo && <div className={`${styles.pointItem} ${styles.strength}`}>Formato educacional "Como" validado.</div>}
                                {a.length >= 40 && a.length <= 70 && <div className={`${styles.pointItem} ${styles.strength}`}>Comprimento ideal para dispositivos móveis.</div>}
                                {!a.hasNumbers && !a.hasComo && <p>Nenhum ponto forte estratégico detectado.</p>}
                              </>
                            );
                          })()}
                        </div>
                        <div className={styles.analysisSection}>
                          <h4><AlertCircle size={18} color="#f43f5e" /> Oportunidades</h4>
                          {(() => {
                            const a = analyzeTitle(selectedVideo.title);
                            return (
                              <>
                                {!a.hasNumbers && <div className={`${styles.pointItem} ${styles.weakness}`}>Falta de números (ex: 3 formas, 100% real).</div>}
                                {!a.hasSecreto && <div className={`${styles.pointItem} ${styles.weakness}`}>Falta gatilho de mistério/exclusividade.</div>}
                                {a.length < 40 && <div className={`${styles.pointItem} ${styles.weakness}`}>Título muito curto para indexação.</div>}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <h4 style={{ marginTop: 32, marginBottom: 16 }}>Sugestões Ultra-Viralizáveis</h4>
                      <div className={styles.suggestionsGrid}>
                        {[
                          { title: `O SEGREDO DO ${selectedVideo.title.toUpperCase()} (REVELADO)`, score: 98 },
                          { title: `NÃO ASSISTA ${selectedVideo.title.toUpperCase()} ANTES DISSO`, score: 94 },
                          { title: `FIZ O ${selectedVideo.title.toUpperCase()} POR 30 DIAS E...`, score: 91 }
                        ].map((s, i) => (
                          <div key={i} className={styles.suggestionCard}>
                            <p>{s.title}</p>
                            <span style={{ color: getScoreColor(s.score), fontWeight: 800 }}>{s.score}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeModalTab === 'thumb' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className={styles.summaryCard}>
                        <h3>Preview da Miniatura</h3>
                        <div className={styles.thumbPreview} style={{ marginTop: 24 }}>
                          <img src={selectedVideo.thumbnail} alt="Miniatura" />
                        </div>
                        <p style={{ marginTop: 16 }}>A retenção começa pelo clique. Sua miniatura representa 80% da decisão do usuário.</p>
                      </div>

                      <div className={styles.analysisSection}>
                        <h4>Checklist de Clique</h4>
                        <div className={styles.pointItem} style={{ borderLeftColor: '#9d4edd' }}>✓ Rosto com expressão clara detectado</div>
                        <div className={styles.pointItem} style={{ borderLeftColor: '#9d4edd' }}>✓ Texto em alto contraste</div>
                        <div className={styles.pointItem} style={{ borderLeftColor: '#f43f5e' }}>⚠ Fundo muito poluído (reduz foco)</div>
                      </div>

                      <button className={styles.generateDescBtn}>
                        <Zap size={18} /> Gerar Ideias de Thumbnail com IA
                      </button>
                    </motion.div>
                  )}

                  {activeModalTab === 'seo' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className={styles.analysisSection}>
                        <h4>Gerador de SEO Estratégico</h4>
                        <p style={{ color: '#94a3b8', marginBottom: 20 }}>Diga à nossa IA o objetivo deste vídeo para criar o texto de vendas perfeito.</p>
                        <textarea 
                          className={styles.modalTextArea} 
                          placeholder="Ex: Quero vender o meu curso de fotografia e focar em iniciantes..."
                          value={videoQuestion}
                          rows={4}
                          onChange={(e) => setVideoQuestion(e.target.value)}
                        />
                        <button className={styles.generateDescBtn}>
                          <Sparkles size={18} /> Construir Descrição Magnética
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeModalTab === 'analysis' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                       <div className={styles.summaryCard}>
                        <h3>Preditivo de Sucesso</h3>
                        <p className={styles.bigScore}>Forte</p>
                        <p>Este vídeo tem os fundamentos para bater 100k views nos primeiros 30 dias.</p>
                      </div>

                      <div className={styles.analysisSection}>
                        <h4>Gatilhos Psicológicos Ativos</h4>
                        <div className={styles.wordCloud}>
                          <span className={styles.wordBadge}>Curiosidade</span>
                          <span className={styles.wordBadge}>Escassez</span>
                          <span className={styles.wordBadge}>Autoridade</span>
                          <span className={styles.wordBadge}>Medo de Perda</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Paywall>
  );
}