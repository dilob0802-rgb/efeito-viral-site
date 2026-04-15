"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./perfil.module.css";
import { User, Target, Zap, Shield, Camera, Video, RefreshCw } from "lucide-react";

export default function PerfilPage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega os dados reais do banco/YouTube ao montar a página
  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        // Atualiza a sessão para que o restante do app (sidebar, etc) use os dados novos
        updateSession(data.profile);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil real:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session?.user?.email]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.spin} />
        <p>Carregando seu perfil real...</p>
      </div>
    );
  }

  // Se não carregou do perfil ainda, usa o da sessão como fallback
  const displayUser = profile || (session?.user as any);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className={styles.title}>Meu Perfil</h1>
            <p className={styles.subtitle}>Dados reais sincronizados com seu canal.</p>
          </div>
          <button 
            className={`${styles.refreshButton} ${refreshing ? styles.spinning : ''}`} 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Sincronizar dados do YouTube agora"
          >
            <RefreshCw size={18} />
            <span>{refreshing ? "Sincronizando..." : "Atualizar"}</span>
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Card de Identidade */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User className={styles.cardIcon} />
            <h2>Identidade de Membro</h2>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.avatarLarge}>
              <img 
                src={displayUser?.youtubeChannelAvatar || displayUser?.image} 
                alt={displayUser?.name} 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser?.name || "U")}&background=9d4edd&color=fff`;
                }}
              />
            </div>
            <div className={styles.details}>
              <h3>{displayUser?.name}</h3>
              <p>{displayUser?.email}</p>
              <span className={styles.badge}>Membro Ativo</span>
            </div>
          </div>
        </div>

        {/* Card Canal Conectado */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Video className={styles.cardIcon} color="#ff0000" />
            <h2>Canal Conectado</h2>
          </div>
          <div className={styles.channelDetails}>
             <div className={styles.channelRow}>
                <span>Nome</span>
                <strong>{displayUser?.youtubeChannelName || "Não detectado"}</strong>
             </div>
             <div className={styles.channelRow}>
                <span>ID do Canal</span>
                <code style={{ fontSize: '0.7rem' }}>{displayUser?.youtubeChannelId || "---"}</code>
             </div>
             <div className={styles.channelRow}>
                <span>Inscritos Reais</span>
                <strong className={styles.highlight}>
                  {displayUser?.subscribers?.toLocaleString('pt-BR') || "0"}
                </strong>
             </div>
          </div>
        </div>

        {/* Card Estratégia */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Target className={styles.cardIcon} color="#9d4edd" />
            <h2>Minha Estratégia</h2>
          </div>
          <div className={styles.strategyGrid}>
             <div className={styles.strategyItem}>
                <label>Nicho de Atuação</label>
                <div>{displayUser?.niche || "Defina sua estratégia"}</div>
             </div>
             <div className={styles.strategyItem}>
                <label>Objetivos (IA)</label>
                <div>{displayUser?.mainGoal || "Defina sua estratégia"}</div>
             </div>
             <div className={styles.strategyItem}>
                <label>Desafio Atual</label>
                <div>{displayUser?.painPoints || "Defina sua estratégia"}</div>
             </div>
          </div>
          {!displayUser?.niche && (
             <button className={styles.setupButton} onClick={() => window.location.href='/membros/mentor'}>
                Configurar Estratégia
             </button>
          )}
        </div>

        {/* Card Suporte */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Shield className={styles.cardIcon} color="#00f2ff" />
            <h2>Segurança</h2>
          </div>
          <p className={styles.cardText}>
            Seus dados do YouTube são lidos via Google API oficial. Nunca temos acesso à sua senha.
          </p>
          <div className={styles.authBadge}>
             <span className={styles.dotActive}></span>
             Conectado via Google OAuth
          </div>
        </div>
      </div>
    </div>
  );
}
