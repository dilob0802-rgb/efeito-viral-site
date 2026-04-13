"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const menuItems = [
  { name: "Visão Geral", path: "/membros", icon: "📊" },
  { name: "Busca Viral", path: "/membros/analise", icon: "🔍" },
  { name: "Raio-X Conteúdo", path: "/membros/raiox", icon: "🎥" },
  { name: "Comparador", path: "/membros/comparador", icon: "⚔️" },
  { name: "Ideias Diárias", path: "/membros/ideias", icon: "💡" },
  { name: "Otimizador Pro", path: "/membros/otimizador", icon: "🛠️" },
  { name: "Mentor IA", path: "/membros/mentor", icon: "🧠" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          EFEITO VIRAL
        </Link>
        <span className={styles.badge}>PRO</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.name}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>L</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Lobato</span>
            <span className={styles.userRole}>Administrador</span>
          </div>
        </div>
        <button className={styles.logoutBtn}>
          Sair
        </button>
      </div>
    </aside>
  );
}
