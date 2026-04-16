"use client";

import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "./layout.module.css";

export default function MembrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className={styles.layout}>
      {/* Mobile Toggle */}
      <div className={styles.mobileHeader}>
        <div style={{ 
          fontFamily: "'Outfit', sans-serif",
          fontWeight: '900', 
          fontSize: '1.2rem', 
          letterSpacing: '0.5px',
          background: 'linear-gradient(135deg, #fff, #9d4edd)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          EFEITO VIRAL
        </div>
        <button className={styles.menuButton} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
