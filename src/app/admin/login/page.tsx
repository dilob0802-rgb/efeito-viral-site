'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import styles from "@/app/login/login.module.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
            setError("E-mail ou senha inválidos.");
        } else {
            setError(result.error || "Acesso negado.");
        }
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow} style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 102, 0.15), transparent 60%)' }} />
      
      <div className={`glass-card ${styles.loginCard}`} style={{ borderTop: '4px solid #ff0066' }}>
        <div className={styles.header}>
          <ShieldCheck size={48} color="#ff0066" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>Acesso restrito à gestão da plataforma.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail Administrativo</label>
            <input
              id="email"
              type="email"
              placeholder="admin@efeitoviral.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{ padding: '14px' }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha de Acesso</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ padding: '14px' }}
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <div className={styles.error} style={{ background: 'rgba(255,0,102,0.1)', color: '#ff4d8f' }}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ background: '#ff0066', boxShadow: '0 0 20px rgba(255,0,102,0.3)', marginTop: '24px' }}>
            {loading ? "Verificando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
