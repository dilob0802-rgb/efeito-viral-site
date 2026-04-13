"use client";

import { useState } from "react";
import styles from "./analise.module.css";
import ChannelCard from "@/components/ChannelCard";

export default function AnalisePage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setSearching(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(`/api/analise/youtube?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        if (data.error.includes("YOUTUBE_API_KEY")) {
          setError("A chave da API do YouTube ainda não foi configurada no sistema.");
        } else {
          setError("Ocorreu um erro na busca. Tente novamente.");
        }
      } else {
        setResults(data);
      }
    } catch (err) {
      setError("Falha na conexão com o servidor.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectChannel = (id: string) => {
    // Futura navegação para o detalhe do perfil
    alert(`Iniciando Raio-X do canal: ${id}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Busca Viral</h1>
        <p className={styles.subtitle}>Encontre concorrentes e descubra os padrões que os fazem crescer.</p>
      </header>

      <section className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
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
        {error && <p className={styles.errorMessage}>{error}</p>}
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainContent}>
          {results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  title={channel.title}
                  thumbnails={channel.thumbnails}
                  subscriberCount={channel.subscriberCount}
                  videoCount={channel.videoCount}
                  onSelect={handleSelectChannel}
                />
              ))}
            </div>
          ) : (
            <div className={`glass-card ${styles.emptyState}`}>
              <div className={styles.emptyIcon}>🧪</div>
              <h3>Comece agora</h3>
              <p>Insira um perfil acima para iniciar o Raio-X de estratégia com IA.</p>
              <div className={styles.suggestions}>
                <span>Tente buscar por:</span>
                <button onClick={() => setQuery("marketing")} className={styles.tag}>#marketing</button>
                <button onClick={() => setQuery("fitness")} className={styles.tag}>#fitness</button>
                <button onClick={() => setQuery("viagem")} className={styles.tag}>#viagem</button>
              </div>
            </div>
          )}
        </div>

        <aside className={styles.recentSearches}>
          <h3 className={styles.sideTitle}>Buscas Recentes</h3>
          <p className={styles.mutedText}>Nenhuma busca recente encontrada.</p>
        </aside>
      </div>
    </div>
  );
}
