"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarOld.module.css";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Wand2, 
  Search, 
  BarChart3, 
  Users, 
  Bot, 
  User, 
  LogOut 
} from "lucide-react";

const menuItems = [
  { name: 'Visão Geral', path: '/membros', icon: <LayoutDashboard size={20} /> },
  { name: 'Otimizador', path: '/membros/otimizador', icon: <Wand2 size={20} /> },
  { name: 'Busca Viral', path: '/membros/analise', icon: <Search size={20} /> },
  { name: 'Raio-X de Canais', path: '/membros/raiox', icon: <BarChart3 size={20} /> },
  { name: 'Comparador', path: '/membros/comparador', icon: <Users size={20} /> },
  { name: 'Mentor IA', path: '/membros/mentor', icon: <Bot size={20} /> },
  { name: 'Meu Perfil', path: '/membros/perfil', icon: <User size={20} /> },
];

export default function SidebarOld() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          EFEITO VIRAL
        </Link>
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
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={() => signOut()}>
          <LogOut size={16} style={{ marginRight: '8px' }} /> Sair
        </button>
      </div>
    </aside>
  );
}
