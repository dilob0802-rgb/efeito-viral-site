"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./ideias.module.css";

interface Idea {
  title: string;
  prediction: "VERY HIGH" | "HIGH" | "MEDIUM";
  why: string;
}

export default function IdeiasPage() {
  const { data: session } = useSession();
  const [nicho, setNicho] = useState<string>("");
  
  // Update state once session is loaded
  useEffect(() => {
    // Mantendo vazio por padrão conforme solicitação do usuário
    // if (session?.user) {
    //   setNicho((session.user as any).niche || (session.user as any).youtubeChannelName || "");
    // }
  }, [session]);

  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState("");

  const [scriptLoading, setScriptLoading] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setScripts({});
    
    try {
      const res = await fetch("/api/analise/ideias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicho: nicho || "Geral" })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setIdeas(data.ideas);
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o motor de ideias.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência! 🔥");
  };

  const handleGenerateScript = async (ideaTitle: string) => {
    if (scripts[ideaTitle] || scriptLoading === ideaTitle) return;
    setScriptLoading(ideaTitle);
    try {
      const res = await fetch("/api/analise/roteiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: ideaTitle, nicho: nicho || "Geral" })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setScripts(prev => ({ ...prev, [ideaTitle]: data.script }));
    } catch (err: any) {
      alert(err.message || "Erro ao gerar o roteiro.");
    } finally {
      setScriptLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ideias Diárias 💡</h1>
        <p className={styles.subtitle}>Sugestões personalizadas pela IA com base nas tendências do seu nicho.</p>
      </header>

      <section className={styles.searchSection}>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Qual é o seu nicho? (ex: Minecraft, Finanças, Culinária...)" 
          value={nicho}
          onChange={(e) => setNicho(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? "Gerando..." : "Gerar Ideias"}
        </button>
      </section>

      {loading && (
        <div className={styles.loadingWrapper}>
          <div className={styles.loader}></div>
          <p className={styles.subtitle}>Escaneando o algoritmo em busca de brechas...</p>
        </div>
      )}

      {error && <div className="error-card" style={{ marginBottom: '24px' }}>{error}</div>}

      <div className={styles.feed}>
        {ideas.length > 0 ? (
          ideas.map((idea, index) => (
            <div key={index} className={styles.ideaCardWrapper} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.ideaCard}>
                <div className={styles.ideaMain}>
                  <span className={`${styles.predictionBadge} ${
                    idea.prediction === "VERY HIGH" ? styles.vh : 
                    idea.prediction === "HIGH" ? styles.h : styles.m
                  }`}>
                    POTENCIAL {
                      idea.prediction === "VERY HIGH" ? "MÁXIMO" : 
                      idea.prediction === "HIGH" ? "ALTO" : "MÉDIO"
                    }
                  </span>
                  <span className={styles.ideaTitle}>{idea.title}</span>
                  <p className={styles.why}>✨ {idea.why}</p>
                </div>
                
                <div className={styles.actions}>
                  <button 
                    className={styles.generateBtn} 
                    onClick={() => handleGenerateScript(idea.title)}
                    disabled={scriptLoading === idea.title || !!scripts[idea.title]}
                  >
                    {scriptLoading === idea.title ? "Gerando..." : (scripts[idea.title] ? "Roteiro Pronto" : "Gerar Roteiro")}
                  </button>
                  <button 
                    className={styles.copyBtn} 
                    title="Copiar Título"
                    onClick={() => copyToClipboard(idea.title)}
                  >
                    📋
                  </button>
                </div>
              </div>
              
              {scripts[idea.title] && (
                <div className={styles.scriptBox}>
                  <div className={styles.scriptHeader}>
                    <span>📝 Estrutura do Roteiro</span>
                    <button onClick={() => copyToClipboard(scripts[idea.title])} className={styles.copyScriptBtn}>Copiar Tudo</button>
                  </div>
                  <div className={styles.scriptContent}>
                    {scripts[idea.title].split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('#') ? styles.scriptTitle : styles.scriptLine}>
                        {line.replace(/[*#]/g, '')}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : !loading && (
          <div className={styles.emptyState}>
            <p>Seu feed está vazio. Digite seu nicho acima para começar.</p>
          </div>
        )}
      </div>

      {ideas.length > 0 && !loading && (
        <center style={{ marginTop: '40px' }}>
          <button className="btn-secondary" onClick={() => setIdeas([])}>Limpar Feed</button>
        </center>
      )}
    </div>
  );
}
