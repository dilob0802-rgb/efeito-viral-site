"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Filter, Play, Info, CheckCircle2, AlertCircle, Wand2, Upload, X, RotateCcw, RotateCw, History, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./otimizador.module.css";

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
  status: "public" | "draft" | "unlisted";
}

export default function OtimizadorPage() {
  const [activeTab, setActiveTab] = useState<"video" | "short">("video");
  const [filter, setFilter] = useState<"all" | "public" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [activeModalTab, setActiveModalTab] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/videos");
        const data = await response.json();
        
        if (data.error || !data.videos || data.videos.length === 0) {
          if (data.error) setError(data.error);
          
          // Fallback para demonstração se a API falhar
          const mockVideos: Video[] = [
            { id: '1', title: 'Como crescer no YouTube usando IA em 2026', thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop', views: '12500', publishedAt: new Date().toISOString(), titleScore: 85, thumbScore: 42, type: 'video', status: 'public' },
            { id: '2', title: 'Dica rápida de edição de shorts viral', thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop', views: '45000', publishedAt: new Date().toISOString(), titleScore: 92, thumbScore: 88, type: 'short', status: 'public' },
            { id: '3', title: 'Por que seus vídeos não estão sendo recomendados?', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop', views: '8900', publishedAt: new Date().toISOString(), titleScore: 65, thumbScore: 35, type: 'video', status: 'public' },
          ];
          setVideos(mockVideos);
          if (!data.error) setError("Modo de Demonstração: Conexão com YouTube instável.");
        } else {
          setVideos(data.videos);
          setError(null);
        }
      } catch (err) {
        setError("Erro ao conectar com o YouTube. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = async (video: Video) => {
    setSelectedVideo(video);
    setIsAuditing(true);
    setAuditData(null);
    
    try {
      const res = await fetch("/api/analise/otimizador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuditData(data.audit);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (isNaN(num)) return views;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getScoreClass = (score: number) => {
    if (score >= 80) return styles.high;
    if (score >= 50) return styles.medium;
    return styles.low;
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = v.type === activeTab;
    const matchesFilter = filter === "all" || v.status === filter;
    return matchesSearch && matchesTab && matchesFilter;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Otimizar
          </motion.h1>
          <p>Analise e turbine o desempenho dos seus vídeos com IA</p>
        </div>

        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar vídeos..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} /> Carregar
        </button>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-card" 
          style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
          {error.includes("não conectado") && (
            <button 
              className="btn-secondary" 
              style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
              onClick={() => window.location.href = '/membros/perfil'}
            >
              Conectar Canal
            </button>
          )}
        </motion.div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'video' ? styles.active : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Vídeos
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'short' ? styles.active : ''}`}
            onClick={() => setActiveTab('short')}
          >
            Shorts
          </div>
        </div>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'public' ? styles.active : ''}`}
            onClick={() => setFilter('public')}
          >
            Público
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'draft' ? styles.active : ''}`}
            onClick={() => setFilter('draft')}
          >
            Rascunhos
          </button>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.videoGrid}
          >
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`${styles.videoCard} ${styles.skeleton}`} style={{ height: '350px' }} />
            ))}
          </motion.div>
        ) : filteredVideos.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.videoGrid}
          >

            {filteredVideos.map((video) => (
              <motion.div 
                key={video.id} 
                className={styles.videoCard}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleVideoClick(video)}
                layout
              >
                <div className={styles.cardThumbnail}>

                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt="" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop';
                      }}
                    />
                  ) : (
                    <div className={styles.skeleton} style={{ width: '100%', height: '100%' }} />
                  )}
                  {video.duration && <span className={styles.timeOverlay}>{video.duration}</span>}
                  
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.scoresList}>
                    <div className={`${styles.scoreBadge} ${getScoreClass(video.titleScore)}`}>
                      Título {video.titleScore}
                    </div>
                    <div className={`${styles.scoreBadge} ${getScoreClass(video.thumbScore)}`}>
                      Miniatura {video.thumbScore}
                    </div>
                    <button className={styles.optimizeBtn}>
                      <Wand2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className={styles.videoTitle}>{video.title}</h3>

                  <div className={styles.cardFooter}>
                    <span>{formatViews(video.views)} visualizações</span>
                    <span>•</span>
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.emptyState}
          >
            <AlertCircle size={48} />
            <h3>Nenhum vídeo encontrado</h3>
            <p>Tente ajustar sua pesquisa ou filtros.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Análise */}
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.headerLeft}>
                  <button className={styles.iconBtn} onClick={() => setSelectedVideo(null)}><X size={20} /></button>
                  <div className={styles.historyActions}>
                    <button className={styles.iconBtn} disabled><RotateCcw size={18} /></button>
                    <button className={styles.iconBtn} disabled><RotateCw size={18} /></button>
                  </div>
                </div>
                
                <h2 className={styles.mainTitle}>Otimizar vídeo</h2>
                
                <button className={styles.saveBtn}>Guardar alterações</button>
              </div>

              <div className={styles.modalTabs}>
                <button 
                  className={`${styles.modalTab} ${activeModalTab === 'title' ? styles.active : ''}`}
                  onClick={() => setActiveModalTab('title')}
                >
                  Título <span className={styles.tabScore}>{selectedVideo.titleScore}</span>
                </button>
                <button 
                  className={`${styles.modalTab} ${activeModalTab === 'thumb' ? styles.active : ''}`}
                  onClick={() => setActiveModalTab('thumb')}
                >
                  Miniatura <span className={styles.tabScore} style={{color: '#f87171'}}>{selectedVideo.thumbScore}</span>
                </button>
                <button 
                  className={`${styles.modalTab} ${activeModalTab === 'seo' ? styles.active : ''}`}
                  onClick={() => setActiveModalTab('seo')}
                >
                  SEO
                </button>
                <button 
                  className={`${styles.modalTab} ${activeModalTab === 'analysis' ? styles.active : ''}`}
                  onClick={() => setActiveModalTab('analysis')}
                >
                  Análise
                </button>
              </div>

              <div className={styles.modalMainLayout}>
                <div className={styles.modalBody}>
                  {isAuditing ? (
                    <div className={styles.modalLoading}>
                      <div className={styles.spinner}></div>
                      <p>A IA está auditando seu vídeo estrategicamente...</p>
                    </div>
                  ) : (
                    <div className={styles.tabContent}>
                      {activeModalTab === 'title' && (
                        <div className={styles.titleSection}>
                          <div className={styles.inputGroup}>
                            <div className={styles.inputHeader}>
                              <label>Título atual</label>
                              <span className={styles.charCount}>{selectedVideo.title.length} of 100</span>
                            </div>
                            <div className={styles.inputWrapper}>
                              <textarea 
                                defaultValue={selectedVideo.title}
                                className={styles.modalTextArea}
                                rows={2}
                              />
                              <div className={styles.inputActions}>
                                <span className={styles.scoreBadgeTiny}>{selectedVideo.titleScore}</span>
                                <button className={styles.historyBtn}><History size={16} /></button>
                              </div>
                            </div>
                          </div>

                          <div className={styles.suggestionsHeader}>
                            <h3>Sugestões</h3>
                            <button className={styles.regenerateBtn}>
                              <RotateCw size={14} /> Regenerado <Sparkles size={14} /> 3
                            </button>
                          </div>

                          <div className={styles.suggestionsGrid}>
                            {auditData?.sugestoesTitulos?.map((sugestao: any, idx: number) => (
                              <div key={idx} className={styles.suggestionCard}>
                                <div className={styles.suggestionThumbWrapper}>
                                  <img src={selectedVideo.thumbnail} alt="Preview" />
                                </div>
                                <div className={styles.suggestionInfo}>
                                  <p className={styles.suggestionText}>{sugestao.titulo}</p>
                                  <div className={styles.suggestionFooter}>
                                    <div className={styles.channelInfo}>
                                      <div className={styles.tinyAvatar}>L</div>
                                      <span>Lobato</span>
                                    </div>
                                    <span className={styles.suggestionScore}>{Math.floor(Math.random() * 20) + 80}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeModalTab === 'thumb' && (
                        <div className={styles.thumbSection}>
                          <div className={styles.thumbPreview}>
                            <img src={selectedVideo.thumbnail} alt="Miniatura" />
                          </div>
                          <div className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                              <span>Justificativa da IA</span>
                              <span className={styles.badge}>{selectedVideo.thumbScore}/100</span>
                            </div>
                            <p className={styles.justificationText}>
                              {auditData?.justificativaMiniatura || "Analisando elementos visuais da imagem para aumentar sua taxa de cliques..."}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeModalTab === 'seo' && (
                        <div className={styles.seoSection}>
                          <div className={styles.inputGroup}>
                            <div className={styles.inputHeader}>
                              <label>Descrição</label>
                              <div className={styles.inputActionIcons}>
                                 <Sparkles size={16} />
                                 <RotateCw size={16} />
                                 <span>1</span>
                              </div>
                            </div>
                            <div className={styles.inputWrapper}>
                              <textarea 
                                defaultValue={`Descubra o poder do amor incondicional...`}
                                className={styles.modalTextArea}
                                rows={6}
                              />
                              <div className={styles.inputActions}>
                                <span className={styles.charCount}>325 of 5000</span>
                                <button className={styles.historyBtn}><History size={16} /></button>
                              </div>
                            </div>
                          </div>

                          <div className={styles.tagsSection}>
                            <label>Etiquetas</label>
                            <div className={styles.tagsContainer}>
                              {['romance', 'amor', 'motivação', 'motivacional'].map(tag => (
                                <div key={tag} className={styles.tagItem}>
                                  <span className={styles.tagScore} data-high="true">65</span>
                                  {tag}
                                  <X size={12} />
                                </div>
                              ))}
                              <div className={styles.addTag}>Adicionar etiquetas</div>
                            </div>
                            <span className={styles.charCount}>66 of 500</span>
                          </div>

                          <div className={styles.suggestionsTags}>
                            <div className={styles.suggestionsHeader}>
                              <h3>Sugestões</h3>
                              <div className={styles.suggestIcons}>
                                <Search size={16} />
                                <RotateCw size={16} />
                              </div>
                            </div>
                            <div className={styles.tagCloud}>
                              {auditData?.tagsSugeridas?.map((tag: string) => (
                                <div key={tag} className={styles.suggestTag}>
                                  <span className={styles.tagScore} data-med="true">{Math.floor(Math.random() * 20) + 60}</span>
                                  {tag}
                                  <Plus size={14} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeModalTab === 'analysis' && (
                        <div className={styles.auditDetails}>
                          <div className={styles.analysisGrid}>
                            <div className={styles.analysisCard} data-type="positive">
                              <h4><CheckCircle2 size={16} color="#4ade80" /> Pontos Positivos</h4>
                              <ul>
                                {auditData?.pontosPositivos?.length > 0 ? (
                                  auditData.pontosPositivos.map((p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                  ))
                                ) : (
                                  <>
                                    <li>O título contém gatilhos mentais fortes.</li>
                                    <li>A miniatura tem bom contraste.</li>
                                  </>
                                )}
                              </ul>
                            </div>
                            <div className={styles.analysisCard} data-type="negative">
                              <h4><AlertCircle size={16} color="#f87171" /> Pontos Negativos</h4>
                              <ul>
                                {auditData?.pontosNegativos?.length > 0 ? (
                                  auditData.pontosNegativos.map((p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                  ))
                                ) : (
                                  <>
                                    <li>Falta uma promessa mais clara no início.</li>
                                    <li>Algumas tags estão saturadas demais.</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className={styles.tagsBox}>
                            <h4>Etiquetas Recomendadas</h4>
                            <div className={styles.tagCloud}>
                              {auditData?.tagsOuro?.map((tag: string) => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.modalSidebar}>
                  <div className={styles.previewCard}>
                    <img src={selectedVideo.thumbnail} alt="Preview" className={styles.sidebarThumb} />
                    <div className={styles.sidebarInfo}>
                      <div className={styles.sidebarChannel}>
                         <div className={styles.sidebarAvatar}>L</div>
                         <p className={styles.sidebarTitle}>{selectedVideo.title}</p>
                      </div>
                      <p className={styles.sidebarMeta}>6 months ago • {formatViews(selectedVideo.views)} Views</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


