import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: "Ana Silva",
    role: "Criadora de Conteúdo",
    text: "O ecossistema mudou minha forma de produzir. Em 30 dias, saí de 2k para 50k visualizações constantes apenas aplicando os ganchos da IA.",
    initials: "AS"
  },
  {
    name: "Marcos Oliveira",
    role: "Infoprodutor",
    text: "Pela primeira vez sinto que tenho controle sobre o algoritmo. O Radar VPH é um divisor de águas para quem quer escala.",
    initials: "MO"
  },
  {
    name: "Julia Costa",
    role: "Social Media",
    text: "A redução de tempo operacional é real. Consigo gerenciar 3x mais clientes com a mesma equipe usando o Efeito Viral.",
    initials: "JC"
  }
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>
          <span className="text-gradient">O que dizem nossos</span> <br />
          <span className="text-gradient-primary">Membros do Ecossistema</span>
        </h2>
        
        <div className={styles.grid}>
          {testimonials.map((t, index) => (
            <div key={index} className={styles.card}>
              <p className={styles.quote}>&quot;{t.text}&quot;</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{t.initials}</div>
                <div className={styles.info}>
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
