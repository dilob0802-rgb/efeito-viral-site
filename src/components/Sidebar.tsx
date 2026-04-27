"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useSession, signOut } from "next-auth/react";
import { 
  Home, 
  Settings, 
  Hash, 
  User, 
  Eye, 
  Lightbulb, 
  GraduationCap, 
  Users, 
  LogOut,
  ChevronDown,
  CreditCard,
  X
} from "lucide-react";

const menuItems = [
  { group: "Principal", items: [
    { name: "Dashboard", path: "/membros", icon: <Home size={20} /> },
    { name: "Otimizador Pro", path: "/membros/otimizador", icon: <Settings size={20} /> },
    { name: "Busca Viral", path: "/membros/analise", icon: <Hash size={20} /> },
  ]},
  { group: "Mais ferramentas", items: [
    { name: "Mentor IA", path: "/membros/coaching", icon: <User size={20} /> },
    { name: "Comparador", path: "/membros/comparador", icon: <Eye size={20} /> },
    { name: "Concorrentes", path: "/membros/concorrentes", icon: <Users size={20} /> },
    { name: "Ideias Diárias", path: "/membros/ideias", icon: <Lightbulb size={20} /> },
    { name: "Aprender", path: "/membros/aprender", icon: <GraduationCap size={20} /> },
  ]}
];

const profileLinks = [
  { name: "Meu Perfil", path: "/membros/perfil", icon: <User size={18} /> },
  // { name: "Assinatura", path: "/membros/planos", icon: <CreditCard size={18} /> },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.logoContainer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link href="/" className={styles.logo}>
            EFEITO VIRAL <span className={styles.badge}>PRO</span>
          </Link>
          {onClose && (
            <button className={styles.closeMobile} onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((group, gIdx) => (
          <div key={gIdx} className={styles.navGroup}>
            {group.group === "Mais ferramentas" && (
              <div className={styles.groupHeader}>
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                  onClick={onClose}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.name}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.profileActions}>
          {profileLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`${styles.navLink} ${styles.smallLink} ${isActive ? styles.active : ""}`}
                onClick={onClose}
              >
                <span className={styles.icon}>{link.icon}</span>
                <span className={styles.name}>{link.name}</span>
              </Link>
            );
          })}
        </div>

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
            <span className={styles.userRole} style={{ color: user?.isPremium ? '#00ffcc' : '#94a3b8' }}>
              {user?.isPremium ? 'Membro PRO' : 'Plano Gratuito'}
            </span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={() => signOut()}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
    </>
  );
}
