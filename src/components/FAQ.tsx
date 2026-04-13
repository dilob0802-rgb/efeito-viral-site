"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: "O que é exatamente o Efeito Viral?",
    answer: "É um ecossistema completo que combina metodologia testada de roteirização, análise de dados de tendências e ferramentas de IA para acelerar seu crescimento orgânico e autoridade no digital."
  },
  {
    question: "Preciso já ter muitos seguidores para começar?",
    answer: "Não. O método foi desenhado justamente para quem quer sair do zero ou destravar perfis estagnados. O foco é em conteúdo que o algoritmo ama, independente do tamanho da base."
  },
  {
    question: "Quanto tempo por dia preciso dedicar?",
    answer: "Com o uso do nosso Ecossistema de ferramentas, você consegue reduzir o tempo de produção em até 90%. Recomendamos dedicar pelo menos 1 hora por dia para colher resultados sólidos."
  },
  {
    question: "Terei suporte durante o processo?",
    answer: "Sim. Além das ferramentas, você terá acesso à nossa comunidade de criadores e suporte técnico para garantir que você aplique cada pilar do método corretamente."
  },
  {
    question: "Para quais nichos o método funciona?",
    answer: "O Efeito Viral funciona para qualquer nicho que dependa de atenção e retenção: infoprodutos, serviços, e-commerce ou lifestyle. Se você precisa de audiência, o método é para você."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>Dúvidas Frequentes</h2>
        
        <div className={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
            >
              <button 
                className={styles.question} 
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <ChevronDown className={styles.icon} size={20} />
              </button>
              <div className={styles.answer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
