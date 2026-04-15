"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import styles from "../coaching/coaching.module.css";
import { Send, Zap, Target, BookOpen, User as UserIcon, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MentorPage() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou seu Mentor de IA. Já analisei seu perfil e estou pronto para te ajudar a dominar o algoritmo. Sobre o que vamos falar hoje?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/coaching/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages,
          userProfile: {
            niche: (session?.user as any)?.niche,
            mainGoal: (session?.user as any)?.mainGoal,
            painPoints: (session?.user as any)?.painPoints
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      console.error("Erro no chat:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Área de Chat */}
      <div className={styles.chatArea}>
        <header className={styles.chatHeader}>
          <div className={styles.mentorAvatar}>
            <Bot color="white" size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Mentor de Estratégia</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>IA Online</span>
            </div>
          </div>
        </header>

        <div className={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.userMessage : styles.mentorMessage}`}>
              {m.content}
            </div>
          ))}
          {isTyping && (
            <div className={styles.typing}>
              O Mentor está analisando
              <div className={styles.typingDots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input
            className={styles.input}
            placeholder="Pergunte qualquer coisa sobre seu canal..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={handleSend} disabled={isTyping}>
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar de Contexto */}
      <aside className={styles.sidebar}>
        <div className={styles.sideCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={18} color="#9d4edd" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Seu Perfil</h3>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Nicho</p>
            <span className={styles.tag}>{(session?.user as any)?.niche || "Carregando..."}</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Principais Objetivos</p>
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{(session?.user as any)?.mainGoal || "Carregando..."}</p>
          </div>

          <div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Desafio Atual</p>
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{(session?.user as any)?.painPoints || "Carregando..."}</p>
          </div>
        </div>

        <div className={styles.sideCard} style={{ background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(123, 44, 191, 0.05) 100%)', borderColor: 'rgba(157, 78, 221, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={18} color="#9d4edd" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Dica do Dia</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.4' }}>
            Baseado no seu objetivo de **{(session?.user as any)?.mainGoal?.split(',')[0]}**, foque em títulos que gerem curiosidade imediata nos primeiros 3 segundos.
          </p>
        </div>
      </aside>
    </div>
  );
}
