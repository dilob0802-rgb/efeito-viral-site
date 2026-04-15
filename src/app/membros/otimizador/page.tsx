"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, X, RotateCw, History, Plus, Zap, TrendingUp } from "lucide-react";
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
  status: "public" | "draft";
}

const mockVideos: Video[] = [
  { id: '1', title: 'COMO CRESCER no YouTube usando IA em 2026', thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop', views: '12540', publishedAt: new Date().toISOString(), titleScore: 85, thumbScore: 42, type: 'video', status: 'public' },
  { id: '2', title: 'Dica rápida de edição de SHORT VIRAL', thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop', views: '45200', publishedAt: new Date().toISOString(), titleScore: 92, thumbScore: 88, type: 'short', status: 'public' },
  { id: '3', title: 'Por que seus vídeos NÃO SÃO RECOMENDADOS?', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop', views: '8910', publishedAt: new Date().toISOString(), titleScore: 65, thumbScore: 35, type: 'video', status: 'public' },
  { id: '4', title: 'A ESTRATÉGIA SECRETA dos canais de 1M', thumbnail: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=400&auto=format&fit=crop', views: '15600', publishedAt: new Date().toISOString(), titleScore: 78, thumbScore: 91, type: 'video', status: 'public' },
];

export default function OtimizadorPage() {
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
        
        if (!data.error && data.videos && data.videos.length > 0) {
          setVideos(data.videos);
          setError(null);
        } else {
          setVideos(mockVideos);
          setError("Vídeos de demonstração");
        }
      } catch (err) {
        setVideos(mockVideos);
        setError("Modo de demonstração");
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

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

  const getScoreColor = (score: number) => score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
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
      </header>

      {loading ? (
        <div className={styles.loadingText}>Carregando...</div>
      ) : filteredVideos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum vídeo encontrado</p>
        </div>
      ) : (
        <motion.div 
          className={styles.videoGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredVideos.map((video) => (
            <motion.div 
              key={video.id} 
              className={styles.videoCard}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleVideoClick(video)}
            >
              <div className={styles.cardThumbnail}>
                <img src={video.thumbnail} alt="" />
                {video.duration && <span className={styles.timeOverlay}>{video.duration}</span>}
              </div>
              <div className={styles.cardInfo}>
                <h3>{video.title}</h3>
                <p>{formatViews(video.views)} visualizações</p>
                <div className={styles.cardScores}>
                  <span style={{ color: getScoreColor(video.titleScore) }}>Título: {video.titleScore}</span>
                  <span style={{ color: getScoreColor(video.thumbScore) }}>Thumb: {video.thumbScore}</span>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className={styles.modalHeader}>
                <button onClick={() => setSelectedVideo(null)}><X size={20} /></button>
                <h2>Otimizar vídeo</h2>
              </div>

              <div className={styles.modalTabs}>
                <button 
                  className={activeModalTab === 'title' ? styles.activeTab : ''}
                  onClick={() => setActiveModalTab('title')}
                >
                  Título <span style={{ color: getScoreColor(selectedVideo.titleScore) }}>{selectedVideo.titleScore}</span>
                </button>
                <button 
                  className={activeModalTab === 'thumb' ? styles.activeTab : ''}
                  onClick={() => setActiveModalTab('thumb')}
                >
                  Miniatura <span style={{ color: getScoreColor(selectedVideo.thumbScore) }}>{selectedVideo.thumbScore}</span>
                </button>
                <button 
                  className={activeModalTab === 'seo' ? styles.activeTab : ''}
                  onClick={() => setActiveModalTab('seo')}
                >
                  SEO
                </button>
                <button 
                  className={activeModalTab === 'analysis' ? styles.activeTab : ''}
                  onClick={() => setActiveModalTab('analysis')}
                >
                  Análise
                </button>
              </div>

              <div className={styles.modalBody}>
                {activeModalTab === 'title' && (
                  <div>
                    <div className={styles.inputGroup}>
                      <label>Título atual ({selectedVideo.title.length}/100)</label>
                      <textarea 
                        defaultValue={selectedVideo.title}
                        className={styles.modalTextArea}
                        rows={2}
                      />
                    </div>

                    <div className={styles.analysisBox}>
                      <h4>Análise do Título</h4>
                      <div className={styles.scoreBar}>
                        <div 
                          className={styles.scoreFill} 
                          style={{ 
                            width: `${selectedVideo.titleScore}%`,
                            backgroundColor: getScoreColor(selectedVideo.titleScore)
                          }} 
                        />
                      </div>
                      <div className={styles.scoreLabels}>
                        <span>Fraco</span><span>Médio</span><span>Forte</span>
                      </div>
                      
                      {(() => {
                        const a = analyzeTitle(selectedVideo.title);
                        return (
                          <div className={styles.strengthsWeaknesses}>
                            <div className={styles.strengths}>
                              <h5>O que funciona:</h5>
                              <ul>
                                {a.hasNumbers && <li>✓ Tem números (aumenta curiosidade)</li>}
                                {a.hasQuestion && <li>✓ Formato de pergunta</li>}
                                {a.hasComo && <li>✓ "Como" é fórmula comprovada</li>}
                                {a.length >= 40 && a.length <= 70 && <li>✓ Comprimento ideal</li>}
                              </ul>
                            </div>
                            <div className={styles.weaknesses}>
                              <h5>Pode melhorar:</h5>
                              <ul>
                                {!a.hasNumbers && <li>⚠ Adicione números</li>}
                                {!a.hasDica && <li>⚠ Adicione "dica" ou "guia"</li>}
                                {!a.hasSecreto && <li>⚠ Use gatilho de curiosidade</li>}
                                {a.length < 40 && <li>⚠ Título muito curto</li>}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <h4>Títulos Sugeridos</h4>
                    <div className={styles.suggestionsGrid}>
                      {[
                        { title: selectedVideo.title.toUpperCase(), score: 95 },
                        { title: `COMO FAZER ${selectedVideo.title.slice(0, 40)}`, score: 90 },
                        { title: `${selectedVideo.title} [GUIA COMPLETO]`, score: 88 }
                      ].map((s, i) => (
                        <div key={i} className={styles.suggestionCard}>
                          <p>{s.title}</p>
                          <span style={{ color: getScoreColor(s.score) }}>{s.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModalTab === 'thumb' && (
                  <div>
                    <div className={styles.thumbPreview}>
                      <img src={selectedVideo.thumbnail} alt="Miniatura" />
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <span>Score da Miniatura</span>
                        <span className={styles.badge} style={{ backgroundColor: getScoreColor(selectedVideo.thumbScore) }}>
                          {selectedVideo.thumbScore}/100
                        </span>
                      </div>
                      <p>Analise os elementos visuais para aumentar o CTR...</p>
                    </div>
                  </div>
                )}

                {activeModalTab === 'seo' && (
                  <div>
                    <div className={styles.seoIntro}>
                      <h3>Otimização SEO</h3>
                      <p>Responda para criar uma descrição imperdível:</p>
                    </div>
                    
                    <div className={styles.seoQuestionBox}>
                      <label>Sobre o que é este vídeo?</label>
                      <textarea 
                        className={styles.seoQuestionInput}
                        placeholder="Ex: Este vídeo ensina como fazer um setup..."
                        value={videoQuestion}
                        onChange={(e) => setVideoQuestion(e.target.value)}
                      />
                    </div>

                    <button className={styles.generateDescBtn}>
                      <Sparkles size={18} /> Gerar Descrição com IA
                    </button>

                    <div className={styles.generatedDescBox}>
                      <h4>Descrição Gerada</h4>
                      <div className={styles.descContent}>
                        <p>👋 <strong>E aí!</strong> Se você quer {videoQuestion || 'aprender mais sobre isso'}, este vídeo é pra você!</p>
                        <p>🎯 <strong>O que você vai aprender:</strong></p>
                        <ul>
                          <li>✅ Passo a passo completo</li>
                          <li>✅ Os erros para evitar</li>
                          <li>✅ Dicas que funcionam</li>
                        </ul>
                        <p>🔔 <strong>INSCREVA-SE e ative o sininho!</strong></p>
                        <p>💬 Deixa nos comentários sua dúvida!</p>
                      </div>
                    </div>

                    <div className={styles.viralTagsSection}>
                      <h4><Zap size={16} /> Tags em Alta</h4>
                      <div className={styles.viralTagsGrid}>
                        {[
                          { name: 'tutorial', score: 92 },
                          { name: 'como fazer', score: 88 },
                          { name: '2026', score: 85 },
                          { name: 'dica', score: 78 },
                          { name: 'viral', score: 72 },
                          { name: 'ia', score: 68 },
                        ].map((tag, i) => (
                          <div key={i} className={styles.viralTagCard}>
                            <span>{tag.name}</span>
                            <span style={{ color: getScoreColor(tag.score) }}>{tag.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === 'analysis' && (
                  <div>
                    {(() => {
                      const a = analyzeTitle(selectedVideo.title);
                      const totalScore = selectedVideo.titleScore;
                      return (
                        <>
                          <div className={styles.summaryCard}>
                            <h3>Resumo Executive</h3>
                            <span className={styles.bigScore} style={{ color: getScoreColor(totalScore) }}>
                              {totalScore}
                            </span>
                            <p>
                              {totalScore >= 80 
                                ? 'Excelente! Título com alto potencial de conversão.' 
                                : totalScore >= 50 
                                  ? 'Bom título, mas pode melhorar com mais gatilhos.' 
                                  : 'Título fraco. Adicione gatilhos emocionais.'}
                            </p>
                          </div>

                          <div className={styles.analysisSection}>
                            <h4>Palavras-Chave</h4>
                            <div className={styles.wordCloud}>
                              {selectedVideo.title.split(' ').map((w, i) => (
                                <span key={i} className={styles.wordBadge}>{w}</span>
                              ))}
                            </div>
                          </div>

                          <div className={styles.analysisSection}>
                            <h4>Gatilhos Emocionais</h4>
                            {a.hasSecreto && <div className={styles.triggerCard}>Mistério/Secreto (9/10)</div>}
                            {a.hasDica && <div className={styles.triggerCard}>Utilidade (8/10)</div>}
                            {!a.hasSecreto && !a.hasDica && <p style={{ color: '#64748b' }}>Nenhum detectado. Considere adicionar.</p>}
                          </div>

                          <div className={styles.finalRecommendations}>
                            <h4>Recomendações Finais</h4>
                            <ol>
                              {totalScore < 80 && <li>Adicione números ao título</li>}
                              {totalScore < 80 && <li>Use gatilho de curiosidade</li>}
                              {a.length < 50 && <li>Adicione promessa de valor</li>}
                              <li>Mantenha 50-70 caracteres</li>
                              <li>Teste variações antes de publicar</li>
                            </ol>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}