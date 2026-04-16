"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  MessageSquare, 
  Users, 
  Compass,
  Cpu,
  Lock,
  ArrowRight,
  Monitor
} from "lucide-react";

export default function MentoriaPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const steps = [
    {
      title: "Etapa 01: Posicionamento",
      description: "Definição de nicho, público-alvo e construção de uma identidade visual e tom de voz únicos.",
      icon: <Compass className="w-8 h-8 text-cyan-400" />
    },
    {
      title: "Etapa 02: Produção",
      description: "Planejamento editorial estratégico e técnicas de storytelling para conteúdos irreais.",
      icon: <Monitor className="w-8 h-8 text-purple-400" />
    },
    {
      title: "Etapa 03: Crescimento",
      description: "Análise de métricas, uso de trends e estratégias de alcance para escalar sua audiência.",
      icon: <TrendingUp className="w-8 h-8 text-pink-400" />
    },
    {
      title: "Etapa 04: Escala",
      description: "Monetização avançada, parcerias e consolidação como referência absoluta no seu nicho.",
      icon: <Zap className="w-8 h-8 text-yellow-400" />
    }
  ];

  const deliverableGroups = [
    {
      title: "Direcionamento",
      items: ["Raio-x do Influenciador", "Diagnóstico Individual", "Plano de Ação Personalizado", "Sistema de Navegação Ativa"],
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Implementação",
      items: ["Área de Membros", "Bootcamp do Influenciador", "Laboratórios Práticos", "Templates Prontos"],
      icon: <Cpu className="w-6 h-6" />
    },
    {
      title: "Acompanhamento",
      items: ["6 Reuniões Estratégicas", "Análises de Conteúdo", "WhatsApp Tira-Dúvidas", "Plantão Mensal"],
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      title: "Conexão",
      items: ["Comunidade Virtual", "Encontros Presenciais", "Marketplace de Influencers"],
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-purple-500/30 font-sans">
      
      {/* Header Fixo Minimalista */}
      <header className="fixed top-0 w-full z-50 bg-[#050508]/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center text-black font-black">EV</div>
            EFEITO VIRAL
          </div>
          <button className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-medium transition-all">
            Falar com Especialista
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] -z-10 rounded-full"></div>

        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold tracking-wider mb-6">
              PROGRAMA HIGH TICKET EXCLUSIVO
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 leading-[1.1]">
              Transforme Seguidores em <br /> <span className="text-white">Renda Recorrente</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Do zero absoluto ao status de influenciador digital estratégico. Domine o algoritmo, construa autoridade e monetize sua audiência com o método validado Efeito Viral.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button className="w-full md:w-auto px-8 py-5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-3">
                GARANTIR MINHA VAGA <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Vagas limitadas por turma
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção das Etapas */}
      <section className="py-24 bg-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">A Jornada da Autoridade</h2>
            <p className="text-gray-400">O caminho exato para sair do anonimato para o topo do seu nicho.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="mb-6 p-4 bg-neutral-800 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* D.I.A.C Deliverables */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic">
                ESTRUTURA <span className="text-purple-500">D.I.A.C</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                Nós não entregamos apenas conteúdo. Entregamos acompanhamento personalizado em 4 dimensões.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {deliverableGroups.map((group, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3 text-white font-bold text-lg">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        {group.icon}
                      </div>
                      {group.title}
                    </div>
                    <ul className="space-y-2">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
               <div className="absolute inset-0 bg-purple-600/30 blur-[100px] -z-10"></div>
               <div className="p-2 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
                 <div className="aspect-video bg-neutral-800 rounded-[32px] flex items-center justify-center relative overflow-hidden">
                    <img 
                       src="/images/lp/mentoria-hero.png" 
                       alt="Mentoria Efeito Viral" 
                       className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black cursor-pointer hover:scale-110 transition-transform">
                        <Rocket className="w-8 h-8 ml-1" />
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-12 md:p-24 rounded-[40px] text-center relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                O Próximo Influenciador de <br /> Referência Pode Ser Você.
              </h2>
              <p className="text-xl text-purple-200/70 mb-12 max-w-2xl mx-auto">
                As vagas para o acompanhamento personalizado são extremamente limitadas para garantir a qualidade e o resultado de cada aluno.
              </p>
              <button className="px-12 py-6 bg-white text-black font-black text-xl rounded-2xl hover:bg-gray-200 transition-all transform hover:scale-105 shadow-2xl">
                QUERO APLICAR PARA A MENTORIA
              </button>
              <div className="mt-8 flex justify-center gap-8 text-sm font-bold text-white/50">
                <span className="flex items-center gap-2 tracking-widest uppercase"><CheckCircle2 className="w-4 h-4" /> Suporte 24h</span>
                <span className="flex items-center gap-2 tracking-widest uppercase"><CheckCircle2 className="w-4 h-4" /> Aulas ao Vivo</span>
                <span className="flex items-center gap-2 tracking-widest uppercase"><CheckCircle2 className="w-4 h-4" /> Networking</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 Efeito Viral - Todos os direitos reservados. Este programa não tem vínculo com o Google ou Meta.</p>
      </footer>
    </div>
  );
}
