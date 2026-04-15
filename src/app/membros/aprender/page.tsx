"use client";

import { useState } from "react";
import { BookOpen, PlayCircle, Clock, GraduationCap, Star, CheckCircle2, Search, Filter, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./aprender.module.css";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  thumbnail: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
}

export default function AprenderPage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const modules: Module[] = [
    {
      id: "mod1",
      title: "Fundamentos da Viralização",
      description: "Entenda a psicologia por trás dos vídeos que dominam o YouTube.",
      progress: 100,
      lessons: [
        { id: "l1", title: "O Código Secreto do Algoritmo", duration: "12 min", level: "Iniciante", thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800", completed: true },
        { id: "l2", title: "Psicologia do Clique (CTR)", duration: "15 min", level: "Iniciante", thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800", completed: true },
      ]
    },
    {
      id: "mod2",
      title: "Retenção Magnética",
      description: "Como prender a atenção do espectador do segundo zero ao final.",
      progress: 35,
      lessons: [
        { id: "l3", title: "Ganchos Irresistíveis", duration: "10 min", level: "Intermediário", thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800", completed: true },
        { id: "l4", title: "Storytelling para Canais de Nicho", duration: "22 min", level: "Intermediário", thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800", completed: false },
        { id: "l5", title: "Edição Invisível", duration: "18 min", level: "Avançado", thumbnail: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=800", completed: false },
      ]
    },
    {
      id: "mod3",
      title: "Dominação de Nicho",
      description: "Estratégias avançadas para se tornar a autoridade número 1.",
      progress: 0,
      lessons: [
        { id: "l6", title: "Análise de Concorrentes Pro", duration: "25 min", level: "Avançado", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800", completed: false },
        { id: "l7", title: "Escalando para 100k Inscritos", duration: "30 min", level: "Avançado", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800", completed: false },
      ]
    }
  ];

  const categories = [
    { id: "todos", name: "Todos as Aulas" },
    { id: "fundamentos", name: "Fundamentos" },
    { id: "estrategia", name: "Estratégia" },
    { id: "edicao", name: "Edição" },
    { id: "mentoria", name: "Mentoria" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.badge}>
            <GraduationCap size={16} /> 
            <span>ACADEMIA EFEITO VIRAL</span>
          </div>
          <h1 className={styles.title}>O que você quer dominar hoje?</h1>
          <p className={styles.subtitle}>
            Aulas exclusivas com as estratégias que levaram nossos membros do zero ao milhão.
          </p>
          
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Pesquisar por tema, aula ou estratégia..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.featuredModule}>
           <div className={styles.featuredContent}>
             <span className={styles.liveBadge}>RECOMENDADO PARA VOCÊ</span>
             <h2>Workshop: O Algoritmo de 2026</h2>
             <p>As mudanças silenciosas no YouTube que estão beneficiando canais pequenos este mês.</p>
             <button className={styles.startBtn}>
               Assistir Agora <PlayCircle size={18} />
             </button>
           </div>
           <div className={styles.featuredImage}>
             <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000" alt="Workshop" />
           </div>
        </div>
      </header>

      <section className={styles.progressSection}>
        <div className={styles.sectionHeader}>
          <h3>Seu Progresso</h3>
          <span>45% concluído</span>
        </div>
        <div className={styles.progressBar}>
          <motion.div 
            className={styles.progressFill} 
            initial={{ width: 0 }}
            animate={{ width: '45%' }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </section>

      <div className={styles.contentLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h4>Categorias</h4>
            <div className={styles.categoryList}>
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  className={`${styles.categoryBtn} ${activeTab === cat.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.achievementCard}>
            <div className={styles.medal}>🥇</div>
            <h4>Novo Conquistador</h4>
            <p>Assista mais 2 aulas para ganhar seu selo de Estrategista.</p>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.modulesGrid}>
            {modules.map((mod, idx) => (
              <motion.div 
                key={mod.id} 
                className={styles.moduleCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={styles.moduleHeader}>
                  <div>
                    <h4>Módulo {idx + 1}</h4>
                    <h3>{mod.title}</h3>
                  </div>
                  <div className={styles.moduleMeta}>
                    <BookOpen size={16} /> {mod.lessons.length} aulas
                  </div>
                </div>
                
                <p className={styles.moduleDesc}>{mod.description}</p>
                
                <div className={styles.lessonsList}>
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className={styles.lessonItem}>
                      <div className={styles.lessonThumb}>
                        <img src={lesson.thumbnail} alt={lesson.title} />
                        <div className={styles.playOverlay}>
                          <PlayCircle size={24} />
                        </div>
                      </div>
                      <div className={styles.lessonInfo}>
                        <div className={styles.lessonTop}>
                          <span className={styles.lessonLevel}>{lesson.level}</span>
                          <span className={styles.lessonDuration}><Clock size={12} /> {lesson.duration}</span>
                        </div>
                        <h5>{lesson.title}</h5>
                      </div>
                      {lesson.completed && (
                        <div className={styles.completedBadge}>
                          <CheckCircle2 size={18} color="#00ffcc" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className={styles.moduleBtn}>
                  {mod.progress === 100 ? "Rever Módulo" : "Continuar Módulo"} <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
