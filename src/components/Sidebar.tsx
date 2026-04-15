"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  { name: "Visão Geral", path: "/membros", icon: "📊" },
  { name: "Busca Viral", path: "/membros/analise", icon: "🔍" },
  { name: "Raio-X Conteúdo", path: "/membros/raiox", icon: "🎥" },
  { name: "Comparador", path: "/membros/comparador", icon: "⚔️" },
  { name: "Ideias Diárias", path: "/membros/ideias", icon: "💡" },
  { name: "Otimizador Pro", path: "/membros/otimizador", icon: "🛠️" },
  { name: "Mentor IA", path: "/membros/mentor", icon: "🧠" },
  { name: "Meu Perfil", path: "/membros/perfil", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

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
          <div className={styles.avatar}>
            {user?.youtubeChannelAvatar ? (
              <img 
                src={user.youtubeChannelAvatar} 
                alt={user.name} 
                referrerPolicy="no-referrer"
                className={styles.avatarImage} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=9d4edd&color=fff`;
                }}
              />
            ) : (
              <div className={styles.avatarLetter}>
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || "Usuário"}</span>
            <span className={styles.userRole}>Plano Pro</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={() => signOut()}>
          Sair
        </button>
      </div>
    </aside>
  );
}
