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
      {/* Mobile Header Bar */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileTitle}>
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
